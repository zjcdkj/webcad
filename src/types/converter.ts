import { IntermediateFormat } from './IntermediateFormat';

export interface IConverter {
  convert(filePath: string): Promise<IntermediateFormat>;
}

export enum GeometryType {
  LINE = 'LINE',
  CIRCLE = 'CIRCLE',
  ARC = 'ARC',
  POLYLINE = 'POLYLINE',
  TEXT = 'TEXT',
  BLOCK = 'BLOCK',
  POINT = 'POINT',
  SPLINE = 'SPLINE'
}

export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  min: Point;
  max: Point;
} 