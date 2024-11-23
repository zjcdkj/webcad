import { GeometryType, Point, BoundingBox } from './converter';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  properties: {
    lineType?: string;
    lineWeight?: number;
  };
}

export interface Geometry {
  id: string;
  type: GeometryType;
  layerId: string;
  styleId: string;
  data: GeometryData;
}

export interface GeometryData {
  points?: Point[];
  center?: Point;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  closed?: boolean;
  text?: string;
}

export interface Block {
  id: string;
  name: string;
  basePoint: Point;
  entities: Geometry[];
}

export interface LineType {
  id: string;
  name: string;
  pattern: number[];
  description?: string;
}

export interface TextStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  bold?: boolean;
  italic?: boolean;
}

export interface Attribute {
  id: string;
  tag: string;
  value: string;
  position: Point;
  style?: TextStyle;
} 