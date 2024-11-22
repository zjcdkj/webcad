import { IConverter, GeometryType, Point } from '../../types/converter';
import { IntermediateFormat, Geometry } from '../../types/IntermediateFormat';
import { Layer, Attribute, Block, BoundingBox } from '../../types/geometry';
import * as LibreDWG from 'libredwg';  // 需要安装 libredwg 包
import { promises as fs } from 'fs';

interface DWGLayer {
  name: string;
  frozen: boolean;
  color: number;
  lineType: string;
  lineWeight: number;
}

interface DWGStyle {
  name: string;
  font: string;
  height: number;
  bold: boolean;
  italic: boolean;
}

export class LibreDWGConverter implements IConverter {
  private dwg: {
    header: { MEASUREMENT: boolean };
    tables: {
      layer: DWGLayer[];
      ltype: { name: string; pattern: number[]; description: string }[];
      style: DWGStyle[];
    };
  };

  async convert(filePath: string): Promise<IntermediateFormat> {
    try {
      // 1. 读取DWG文件
      this.dwg = await this.readDWGFile(filePath);
      
      // 2. 提取图层信息
      const layers = this.extractLayers();
      
      // 3. 提取图元数据
      const elements = {
        geometries: [] as Geometry[],
        attributes: [] as Attribute[],
        blocks: [] as Block[]
      };
      
      // 4. 提取样式信息
      const styles = this.extractStyles();
      
      // 5. 计算边界框
      const bounds = this.calculateBounds(elements.geometries);

      return {
        version: '1.0',
        metadata: {
          originalFile: filePath,
          units: this.extractUnits(),
          bounds
        },
        layers,
        elements,
        styles
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to convert DWG file: ${error.message}`);
      }
      throw new Error('Failed to convert DWG file');
    }
  }

  private async readDWGFile(filePath: string): Promise<any> {
    const buffer = await fs.readFile(filePath);
    return LibreDWG.read(buffer);
  }

  private extractUnits(): string {
    return this.dwg.header.MEASUREMENT ? 'Metric' : 'Imperial';
  }

  private extractLayers(): Layer[] {
    return this.dwg.tables.layer.map(layer => ({
      id: layer.name,
      name: layer.name,
      visible: !layer.frozen,
      color: this.convertColor(layer.color),
      properties: {
        lineType: layer.lineType,
        lineWeight: layer.lineWeight
      }
    }));
  }

  private convertColor(colorNumber: number): string {
    // 实现AutoCAD颜色转换为hex
    const colors = {
      1: '#FF0000',
      2: '#FFFF00',
      3: '#00FF00',
      // ... 更多颜色映射
    };
    return colors[colorNumber] || '#FFFFFF';
  }

  private calculateBounds(geometries: any[]): BoundingBox {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    geometries.forEach(geo => {
      if (geo.data.points) {
        geo.data.points.forEach((point: Point) => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          minZ = Math.min(minZ, point.z);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
          maxZ = Math.max(maxZ, point.z);
        });
      }
    });

    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };
  }

  private extractStyles() {
    return {
      lineTypes: this.extractLineTypes(),
      textStyles: this.extractTextStyles()
    };
  }

  private extractLineTypes() {
    return this.dwg.tables.ltype.map(lt => ({
      id: lt.name,
      name: lt.name,
      pattern: lt.pattern,
      description: lt.description
    }));
  }

  private extractTextStyles() {
    return this.dwg.tables.style.map(style => ({
      id: style.name,
      name: style.name,
      fontFamily: style.font,
      fontSize: style.height,
      bold: style.bold,
      italic: style.italic
    }));
  }
} 