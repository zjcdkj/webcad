import { IntermediateFormat, Geometry } from '../../types/IntermediateFormat';
import { Point } from '../../types/converter';
import { Logger } from '../logger/Logger';

export class DataOptimizer {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('DataOptimizer');
  }

  async optimize(data: IntermediateFormat): Promise<IntermediateFormat> {
    try {
      // 1. 删除重复顶点
      this.deduplicateVertices(data);
      
      // 2. 合并相似图元
      this.mergeSimilarElements(data);
      
      // 3. 简化精度
      this.reducePrecision(data);

      return data;
    } catch (error) {
      this.logger.error('Failed to optimize data:', error);
      throw error;
    }
  }

  private deduplicateVertices(data: IntermediateFormat): void {
    const uniquePoints = new Map<string, Point>();
    
    data.elements.geometries.forEach((geometry: Geometry) => {
      if (geometry.data.points) {
        geometry.data.points = geometry.data.points.map((point: Point) => {
          const key = `${point.x},${point.y},${point.z}`;
          if (!uniquePoints.has(key)) {
            uniquePoints.set(key, point);
          }
          return uniquePoints.get(key)!;
        });
      }
    });
  }

  private mergeSimilarElements(data: IntermediateFormat): void {
    // 实现图元合并逻辑
    // 例如：合并共线的线段、合并相同位置的点等
    // 这部分需要根据具体需求实现
  }

  private reducePrecision(data: IntermediateFormat): void {
    const PRECISION = 4; // 保留4位小数
    
    const roundNumber = (num: number) => {
      return Number(num.toFixed(PRECISION));
    };

    const roundPoint = (point: Point) => {
      point.x = roundNumber(point.x);
      point.y = roundNumber(point.y);
      point.z = roundNumber(point.z);
      return point;
    };

    data.elements.geometries.forEach(geometry => {
      if (geometry.data.points) {
        geometry.data.points = geometry.data.points.map(roundPoint);
      }
      if (geometry.data.center) {
        geometry.data.center = roundPoint(geometry.data.center);
      }
      if (geometry.data.radius) {
        geometry.data.radius = roundNumber(geometry.data.radius);
      }
    });
  }
} 