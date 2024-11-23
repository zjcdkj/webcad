import { IConverter, GeometryType, Point, BoundingBox } from '../../types/converter';
import { IntermediateFormat } from '../../types/IntermediateFormat';
import { Layer, Block, LineType, TextStyle } from '../../types/geometry';
import { Logger } from '../logger/Logger';
import * as LibreDWG from 'libredwg';

export class LibreDWGConverter implements IConverter {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('LibreDWGConverter');
  }

  async convert(buffer: Buffer): Promise<IntermediateFormat> {
    const dwg = await LibreDWG.read(buffer);
    
    const layers = await this.getLayers(buffer);
    const geometries = await this.getGeometries(buffer);
    const blocks = await this.getBlocks(buffer);
    
    const bounds = this.calculateBounds(geometries);

    return {
      version: '1.0',
      metadata: {
        originalFile: 'dwg-file',
        units: this.getUnits(dwg),
        bounds
      },
      layers,
      elements: {
        geometries,
        attributes: this.getAttributes(dwg),
        blocks
      },
      styles: {
        lineTypes: this.getLineTypes(dwg),
        textStyles: this.getTextStyles(dwg)
      }
    };
  }

  async getLayers(buffer: Buffer): Promise<Layer[]> {
    const dwg = await LibreDWG.read(buffer);
    return dwg.tables.layer.map(layer => ({
      id: layer.handle,
      name: layer.name,
      visible: !layer.frozen,
      color: this.convertColor(layer.color),
      properties: {
        lineType: layer.lineType,
        lineWeight: layer.lineWeight
      }
    }));
  }

  async getGeometries(buffer: Buffer): Promise<IntermediateFormat['elements']['geometries']> {
    const dwg = await LibreDWG.read(buffer);
    const geometries: IntermediateFormat['elements']['geometries'] = [];

    // 处理直线
    dwg.entities.filter(e => e.type === 'LINE').forEach(line => {
      if (line.start && line.end) {
        geometries.push({
          id: line.handle,
          type: GeometryType.LINE,
          layerId: line.layer,
          styleId: line.lineType || 'CONTINUOUS',
          data: {
            points: [
              { x: line.start.x, y: line.start.y, z: line.start.z },
              { x: line.end.x, y: line.end.y, z: line.end.z }
            ]
          }
        });
      }
    });

    // 处理圆
    dwg.entities.filter(e => e.type === 'CIRCLE').forEach(circle => {
      if (circle.center) {
        geometries.push({
          id: circle.handle,
          type: GeometryType.CIRCLE,
          layerId: circle.layer,
          styleId: circle.lineType || 'CONTINUOUS',
          data: {
            center: { x: circle.center.x, y: circle.center.y, z: circle.center.z },
            radius: circle.radius || 0
          }
        });
      }
    });

    // 处理圆弧
    dwg.entities.filter(e => e.type === 'ARC').forEach(arc => {
      if (arc.center) {
        geometries.push({
          id: arc.handle,
          type: GeometryType.ARC,
          layerId: arc.layer,
          styleId: arc.lineType || 'CONTINUOUS',
          data: {
            center: { x: arc.center.x, y: arc.center.y, z: arc.center.z },
            radius: arc.radius || 0,
            rotation: arc.startAngle || 0
          }
        });
      }
    });

    return geometries;
  }

  async getBlocks(buffer: Buffer): Promise<Block[]> {
    const dwg = await LibreDWG.read(buffer);
    return dwg.blocks.map(block => ({
      id: block.handle,
      name: block.name,
      basePoint: {
        x: block.basePoint.x,
        y: block.basePoint.y,
        z: block.basePoint.z
      },
      entities: block.entities.map(entity => ({
        id: entity.handle,
        type: GeometryType.BLOCK,
        layerId: entity.layer,
        styleId: entity.lineType || 'CONTINUOUS',
        data: {}
      }))
    }));
  }

  private getUnits(dwg: LibreDWG.DWGDocument): string {
    return dwg.header.MEASUREMENT ? 'Metric' : 'Imperial';
  }

  private convertColor(colorNumber: number): string {
    const colorMap: Record<number, string> = {
      1: '#FF0000',  // Red
      2: '#FFFF00',  // Yellow
      3: '#00FF00',  // Green
      4: '#00FFFF',  // Cyan
      5: '#0000FF',  // Blue
      6: '#FF00FF',  // Magenta
      7: '#FFFFFF'   // White
    };
    return colorMap[colorNumber] || '#FFFFFF';
  }

  private calculateBounds(geometries: IntermediateFormat['elements']['geometries']): BoundingBox {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    geometries.forEach(geometry => {
      if (geometry.data.points) {
        geometry.data.points.forEach(point => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          minZ = Math.min(minZ, point.z);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
          maxZ = Math.max(maxZ, point.z);
        });
      }
      if (geometry.data.center) {
        const radius = geometry.data.radius || 0;
        minX = Math.min(minX, geometry.data.center.x - radius);
        minY = Math.min(minY, geometry.data.center.y - radius);
        minZ = Math.min(minZ, geometry.data.center.z);
        maxX = Math.max(maxX, geometry.data.center.x + radius);
        maxY = Math.max(maxY, geometry.data.center.y + radius);
        maxZ = Math.max(maxZ, geometry.data.center.z);
      }
    });

    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };
  }

  private getAttributes(dwg: LibreDWG.DWGDocument): any[] {
    return [];
  }

  private getLineTypes(dwg: LibreDWG.DWGDocument): LineType[] {
    return [];
  }

  private getTextStyles(dwg: LibreDWG.DWGDocument): TextStyle[] {
    return [];
  }
} 