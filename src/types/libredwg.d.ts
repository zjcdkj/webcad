declare module 'libredwg' {
  export interface DWGDocument {
    header: {
      MEASUREMENT: boolean;
    };
    tables: {
      layer: DWGLayer[];
    };
    entities: DWGEntity[];
    blocks: DWGBlock[];
  }

  export interface DWGLayer {
    handle: string;
    name: string;
    frozen: boolean;
    color: number;
    lineType: string;
    lineWeight: number;
  }

  export interface DWGEntity {
    type: string;
    handle: string;
    layer: string;
    lineType?: string;
    start?: Point;
    end?: Point;
    center?: Point;
    radius?: number;
    startAngle?: number;
    endAngle?: number;
    vertices?: Point[];
    closed?: boolean;
  }

  export interface DWGBlock {
    handle: string;
    name: string;
    basePoint: Point;
    entities: DWGEntity[];
  }

  export interface Point {
    x: number;
    y: number;
    z: number;
  }

  export function read(buffer: Buffer): Promise<DWGDocument>;
} 