import { BoundingBox, GeometryType, Point } from './converter';
import { Layer, LineType, TextStyle, Block, Attribute } from './geometry';

export interface Geometry {
  id: string;
  type: GeometryType;
  data: {
    points?: Point[];
    center?: Point;
    radius?: number;
    rotation?: number;
  };
  layerId: string;
  styleId: string;
}

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