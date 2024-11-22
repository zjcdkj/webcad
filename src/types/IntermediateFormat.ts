import { BoundingBox, GeometryType, Point } from './converter';
import { Layer, Attribute, Block, LineType, TextStyle } from './geometry';

export interface IntermediateFormat {
  version: string;
  metadata: {
    originalFile: string;
    units: string;
    bounds: BoundingBox;
  };
  layers: Layer[];
  elements: {
    geometries: Geometry[];
    attributes: Attribute[];
    blocks: Block[];
  };
  styles: {
    lineTypes: LineType[];
    textStyles: TextStyle[];
  };
}

export interface Geometry {
  id: string;
  type: GeometryType;
  data: {
    points?: Point[];
    center?: Point;
    radius?: number;
    rotation?: number;
    // 其他几何数据
  };
  layerId: string;
  styleId: string;
} 