import { IConverter } from '../../types/converter';
import { IntermediateFormat } from '../../types/IntermediateFormat';
import { Logger } from '../logger/Logger';
import { Geometry, Layer, Block } from '../../types/geometry';

export class ODAConverter implements IConverter {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ODAConverter');
  }

  async convert(buffer: Buffer): Promise<IntermediateFormat> {
    throw new Error('ODA Converter not implemented');
  }

  async getGeometries(buffer: Buffer): Promise<Geometry[]> {
    throw new Error('ODA Converter not implemented');
  }

  async getLayers(buffer: Buffer): Promise<Layer[]> {
    throw new Error('ODA Converter not implemented');
  }

  async getBlocks(buffer: Buffer): Promise<Block[]> {
    throw new Error('ODA Converter not implemented');
  }
} 