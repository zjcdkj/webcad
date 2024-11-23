import { v4 as uuidv4 } from 'uuid';
import { FolderModel } from '../../models/folder.model';
import { FileModel } from '../../models/file.model';
import { Folder, CreateFolderDto, UpdateFolderDto } from '../../types/folder';
import { Logger } from '../logger/Logger';
import { ApiError } from '../../utils/ApiError';

export class FolderService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('FolderService');
  }

  async createFolder(dto: CreateFolderDto): Promise<Folder> {
    try {
      const id = uuidv4();
      let path = `/${dto.name}`;
      
      if (dto.parentId) {
        const parentFolder = await FolderModel.findOne({ id: dto.parentId });
        if (!parentFolder) {
          throw new ApiError(404, 'Parent folder not found');
        }
        path = `${parentFolder.path}/${dto.name}`;
        
        // 检查同级目录下是否存在同名文件夹
        const existingFolder = await FolderModel.findOne({
          parentId: dto.parentId,
          name: dto.name
        });
        
        if (existingFolder) {
          throw new ApiError(400, 'Folder with this name already exists in this location');
        }
      } else {
        // 检查根目录下是否存在同名文件夹
        const existingFolder = await FolderModel.findOne({
          parentId: null,
          name: dto.name
        });
        
        if (existingFolder) {
          throw new ApiError(400, 'Folder with this name already exists in root directory');
        }
      }

      const folderDoc = await FolderModel.create({
        id,
        name: dto.name,
        path,
        parentId: dto.parentId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const folder = folderDoc.toObject();
      return {
        id: folder.id,
        name: folder.name,
        path: folder.path,
        parentId: folder.parentId,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt
      };
    } catch (error) {
      this.logger.error('Failed to create folder:', error);
      throw error;
    }
  }

  async renameFolder(folderId: string, dto: UpdateFolderDto): Promise<Folder> {
    try {
      const folder = await FolderModel.findOne({ id: folderId });
      if (!folder) {
        throw new ApiError(404, 'Folder not found');
      }

      // 检查同级目录下是否存在同名文件夹
      const existingFolder = await FolderModel.findOne({
        parentId: folder.parentId,
        name: dto.name,
        id: { $ne: folderId }
      });

      if (existingFolder) {
        throw new ApiError(400, 'Folder with this name already exists in this location');
      }

      // 更新当前文件夹的路径
      const oldPath = folder.path;
      const newPath = folder.parentId 
        ? `${(await this.getParentPath(folder.parentId))}/${dto.name}`
        : `/${dto.name}`;

      // 更新所有子文件夹的路径
      await this.updateChildrenPaths(oldPath, newPath);

      // 更新当前文件夹
      folder.name = dto.name;
      folder.path = newPath;
      folder.updatedAt = new Date();
      await folder.save();

      const folderObj = folder.toObject();
      return {
        id: folderObj.id,
        name: folderObj.name,
        path: folderObj.path,
        parentId: folderObj.parentId,
        createdAt: folderObj.createdAt,
        updatedAt: folderObj.updatedAt
      };
    } catch (error) {
      this.logger.error('Failed to rename folder:', error);
      throw error;
    }
  }

  async deleteFolder(folderId: string): Promise<void> {
    try {
      const folder = await FolderModel.findOne({ id: folderId });
      if (!folder) {
        throw new ApiError(404, 'Folder not found');
      }

      // 检查是否有子文件夹
      const hasSubfolders = await FolderModel.exists({ parentId: folderId });
      if (hasSubfolders) {
        throw new ApiError(400, 'Cannot delete folder with subfolders');
      }

      // 检查是否有文件
      const hasFiles = await FileModel.exists({ folderId });
      if (hasFiles) {
        throw new ApiError(400, 'Cannot delete folder with files');
      }

      await folder.deleteOne();
    } catch (error) {
      this.logger.error('Failed to delete folder:', error);
      throw error;
    }
  }

  async getFolderContents(folderId: string | null, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const folders = await FolderModel.find({ parentId: folderId })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

      const files = await FileModel.find({ folderId })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

      const totalFolders = await FolderModel.countDocuments({ parentId: folderId });
      const totalFiles = await FileModel.countDocuments({ folderId });

      return {
        folders: folders.map(f => ({
          id: f.id,
          name: f.name,
          path: f.path,
          parentId: f.parentId,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt
        })),
        files: files.map(f => ({
          id: f.id,
          name: f.name,
          path: f.path,
          folderId: f.folderId,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt
        })),
        pagination: {
          page,
          limit,
          totalFolders,
          totalFiles,
          total: totalFolders + totalFiles
        }
      };
    } catch (error) {
      this.logger.error('Failed to get folder contents:', error);
      throw error;
    }
  }

  private async getParentPath(parentId: string): Promise<string> {
    const parent = await FolderModel.findOne({ id: parentId });
    if (!parent) {
      throw new ApiError(404, 'Parent folder not found');
    }
    return parent.path;
  }

  private async updateChildrenPaths(oldPath: string, newPath: string): Promise<void> {
    const folders = await FolderModel.find({
      path: { $regex: `^${oldPath}/` }
    });

    for (const folder of folders) {
      folder.path = folder.path.replace(oldPath, newPath);
      await folder.save();
    }
  }
} 