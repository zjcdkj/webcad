import { IntermediateFormat } from './IntermediateFormat';
import { Geometry, Layer, Block } from './geometry';

export interface IConverter {
  convert(buffer: Buffer): Promise<IntermediateFormat>;
  getGeometries(buffer: Buffer): Promise<Geometry[]>;
  getLayers(buffer: Buffer): Promise<Layer[]>;
  getBlocks(buffer: Buffer): Promise<Block[]>;
}

export enum GeometryType {
  LINE = 'LINE',
  CIRCLE = 'CIRCLE',
  ARC = 'ARC',
  POLYLINE = 'POLYLINE',
  TEXT = 'TEXT',
  BLOCK = 'BLOCK',
  POINT = 'POINT',
  SPLINE = 'SPLINE',
  DIMENSION = 'DIMENSION',
  HATCH = 'HATCH'
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