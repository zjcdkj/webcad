class ODAConverter implements IConverter {
  async convert(filePath: string): Promise<string> {
    // 1. 调用ODA转换为SVG或DXF
    const result = await this.executeODAConverter(filePath, 'SVG');
    
    // 2. 解析转换后的文件，提取图元数据
    const elements = await this.parseElements(result.outputPath);
    
    // 3. 转换为自定义中间格式
    return this.toIntermediateFormat(elements);
  }
} 