export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  min: Point;
  max: Point;
}

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

export interface Attribute {
  id: string;
  tag: string;
  value: string;
  position?: Point;
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