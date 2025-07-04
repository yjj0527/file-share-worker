// src/storage/d1.js

class D1Storage {
  constructor(db) {
    this.db = db;
  }

  async store(id, file, previewEnabled, path = '') {
    try {
      const arrayBuffer = await file.arrayBuffer();

      await this.db.prepare(
        'INSERT INTO files (id, filename, path, size, storage_type, preview_enabled, content) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, file.name, path, file.size, 'd1', previewEnabled ? 1 : 0, arrayBuffer).run();

      console.log(`File stored in D1: ${file.name} (ID: ${id})`);
    } catch (error) {
      console.error('D1 store error:', error);
      throw error;
    }
  }

  async retrieve(id) {
    try {
      const result = await this.db.prepare(
        'SELECT * FROM files WHERE id = ?'
      ).bind(id).first();

      if (result) {
        const arrayBuffer = result.content;

        console.log(`File retrieved from D1: ${result.filename} (ID: ${id})`);

        return {
          stream: new Response(arrayBuffer).body,
          filename: result.filename,
          path: result.path,
          storage_type: 'd1',
          preview_enabled: result.preview_enabled === 1,
        };
      }
      console.warn(`File not found in D1: ID ${id}`);
      return null;
    } catch (error) {
      console.error('D1 retrieve error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.db.prepare(
        'DELETE FROM files WHERE id = ?'
      ).bind(id).run();
      console.log(`File deleted from D1: ID ${id}`);
      return result.success;
    } catch (error) {
      console.error('D1 delete error:', error);
      return false;
    }
  }

  async list() {
    try {
      const results = await this.db.prepare(
        'SELECT id, filename, path, size, storage_type, preview_enabled, created_at FROM files ORDER BY created_at DESC'
      ).all();
      console.log(`Listed ${results.results.length} files from D1`);
      return results.results || [];
    } catch (error) {
      console.error('D1 list error:', error);
      return [];
    }
  }
}

export { D1Storage };
