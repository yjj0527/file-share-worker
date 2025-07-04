// src/storage/manager.js

import { R2Storage } from './r2';
import { D1Storage } from './d1';
import { generateId } from '../utils/id';

class StorageManager {
  constructor(env) {
    this.r2Storage = new R2Storage(env.FILE_BUCKET);
    this.d1Storage = new D1Storage(env.DB);
  }

  async store(file, storageType, previewEnabled, path = '') {
    const id = generateId();
    const metadata = {
      id,
      filename: file.name,
      path,
      size: file.size,
      storage_type: storageType,
      preview_enabled: previewEnabled,
    };

    if (storageType === 'r2') {
      await this.r2Storage.store(id, file, previewEnabled, path);
    } else {
      await this.d1Storage.store(id, file, previewEnabled, path);
    }

    return metadata;
  }

  async retrieve(id) {
    // 尝试从 D1 存储中获取
    let file = await this.d1Storage.retrieve(id);
    if (file) return file;

    // 尝试从 R2 存储中获取
    file = await this.r2Storage.retrieve(id);
    if (file) return file;

    return null;
  }

  async delete(id) {
    // 尝试从 D1 存储中删除
    let success = await this.d1Storage.delete(id);
    if (success) return true;

    // 尝试从 R2 存储中删除
    success = await this.r2Storage.delete(id);
    if (success) return true;

    return false;
  }

  async list() {
    const d1Files = await this.d1Storage.list();
    const r2Files = await this.r2Storage.list();
    return [...d1Files, ...r2Files];
  }
}

export { StorageManager };
