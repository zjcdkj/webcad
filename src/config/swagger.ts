import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CAD Web Viewer API',
      version: '1.0.0',
      description: 'API documentation for CAD Web Viewer',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        FileMetadata: {
          type: 'object',
          properties: {
            format: { type: 'string' },
            lastModified: { 
              type: 'string',
              format: 'date-time',
              example: '2024-11-22 08:34:54'
            }
          }
        },
        UploadedFile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            filename: { type: 'string' },
            originalname: { type: 'string' },
            size: { type: 'number' },
            status: { 
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed']
            },
            folderId: { type: 'string' },
            createdAt: { 
              type: 'string',
              format: 'date-time'
            },
            metadata: {
              type: 'object',
              properties: {
                format: { type: 'string' },
                lastModified: { 
                  type: 'string',
                  format: 'date-time'
                }
              }
            }
          }
        },
        FileList: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                files: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/UploadedFile'
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' }
                  }
                }
              }
            }
          }
        },
        FileUploadResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              $ref: '#/components/schemas/UploadedFile'
            }
          },
          example: {
            success: true,
            data: {
              id: "123e4567-e89b-12d3-a456-426614174000",
              filename: "example.dwg",
              originalname: "原始文件名.dwg",
              size: 1024,
              status: "pending",
              createdAt: "2024-11-22 08:34:54",
              metadata: {
                format: "DWG",
                lastModified: "2024-11-22 08:34:54"
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            error: { type: 'string' }
          },
          example: {
            success: false,
            error: "File not found"
          }
        },
        ConversionJob: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fileId: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'converting', 'optimizing', 'completed', 'failed']
            },
            progress: { type: 'number' },
            error: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ConversionOptions: {
          type: 'object',
          properties: {
            maxAttempts: { type: 'number' },
            timeout: { type: 'number' },
            priority: { type: 'number' }
          }
        },
        Folder: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            path: { type: 'string' },
            parentId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        FolderContents: {
          type: 'object',
          properties: {
            folders: {
              type: 'array',
              items: { $ref: '#/components/schemas/Folder' }
            },
            files: {
              type: 'array',
              items: { $ref: '#/components/schemas/File' }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                totalFolders: { type: 'integer' },
                totalFiles: { type: 'integer' },
                total: { type: 'integer' }
              }
            }
          }
        },
        File: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            path: { type: 'string' },
            folderId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options); 