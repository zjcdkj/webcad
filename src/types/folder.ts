export interface Folder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFolderDto {
  name: string;
  parentId?: string;
}

export interface UpdateFolderDto {
  name: string;
} 