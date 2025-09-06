/**
 * IndexedDB Storage for Offline Mode
 * Handles persistent storage of tasks, folders, and mutation queue
 */

// IndexedDB Configuration
const DB_NAME = 'TaskFlowOffline';
const DB_VERSION = 1;

// Store names
export const STORES = {
  TASKS: 'tasks',
  FOLDERS: 'folders',
  PROPERTIES: 'properties',
  MUTATION_QUEUE: 'mutation_queue',
  SYNC_METADATA: 'sync_metadata'
} as const;

// Mutation types for offline queue
export type MutationType = 
  | 'CREATE_TASK'
  | 'UPDATE_TASK'
  | 'DELETE_TASK'
  | 'CREATE_FOLDER'
  | 'UPDATE_FOLDER'
  | 'DELETE_FOLDER'
  | 'SET_TASK_PROPERTY';

export interface OfflineMutation {
  id: string;
  type: MutationType;
  data: any;
  timestamp: number;
  retryCount: number;
  tempId?: string; // For optimistic updates
  userId: string;
}

export interface SyncMetadata {
  key: string;
  lastSync: number;
  version: number;
}

// Initialize IndexedDB
export const initOfflineDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Tasks store
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const tasksStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
        tasksStore.createIndex('user_id', 'user_id', { unique: false });
        tasksStore.createIndex('folder_id', 'folder_id', { unique: false });
        tasksStore.createIndex('status', 'status', { unique: false });
        tasksStore.createIndex('updated_at', 'updated_at', { unique: false });
      }

      // Folders store
      if (!db.objectStoreNames.contains(STORES.FOLDERS)) {
        const foldersStore = db.createObjectStore(STORES.FOLDERS, { keyPath: 'id' });
        foldersStore.createIndex('user_id', 'user_id', { unique: false });
        foldersStore.createIndex('is_system', 'is_system', { unique: false });
      }

      // Properties store
      if (!db.objectStoreNames.contains(STORES.PROPERTIES)) {
        const propertiesStore = db.createObjectStore(STORES.PROPERTIES, { keyPath: 'id' });
        propertiesStore.createIndex('user_id', 'user_id', { unique: false });
      }

      // Mutation queue store
      if (!db.objectStoreNames.contains(STORES.MUTATION_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.MUTATION_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('user_id', 'user_id', { unique: false });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        queueStore.createIndex('type', 'type', { unique: false });
      }

      // Sync metadata store
      if (!db.objectStoreNames.contains(STORES.SYNC_METADATA)) {
        db.createObjectStore(STORES.SYNC_METADATA, { keyPath: 'key' });
      }
    };
  });
};

// Generic storage operations
export class OfflineStorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    this.db = await initOfflineDB();
  }

  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // Generic CRUD operations
  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    const db = this.ensureDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string, indexName?: string, indexValue?: any): Promise<T[]> {
    const db = this.ensureDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      
      if (indexName && indexValue !== undefined) {
        const index = store.index(indexName);
        request = index.getAll(indexValue);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async putMany<T>(storeName: string, items: T[]): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      let remaining = items.length;
      if (remaining === 0) {
        resolve();
        return;
      }

      items.forEach(item => {
        const request = store.put(item);
        request.onsuccess = () => {
          remaining--;
          if (remaining === 0) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Mutation queue specific operations
  async addMutation(mutation: OfflineMutation): Promise<void> {
    await this.put(STORES.MUTATION_QUEUE, mutation);
  }

  async getMutations(userId: string): Promise<OfflineMutation[]> {
    const mutations = await this.getAll<OfflineMutation>(STORES.MUTATION_QUEUE, 'user_id', userId);
    return mutations.sort((a, b) => a.timestamp - b.timestamp);
  }

  async removeMutation(mutationId: string): Promise<void> {
    await this.delete(STORES.MUTATION_QUEUE, mutationId);
  }

  async clearMutations(userId: string): Promise<void> {
    const mutations = await this.getMutations(userId);
    await Promise.all(mutations.map(m => this.removeMutation(m.id)));
  }

  // Sync metadata operations
  async setSyncMetadata(key: string, lastSync: number, version: number = 1): Promise<void> {
    await this.put(STORES.SYNC_METADATA, { key, lastSync, version });
  }

  async getSyncMetadata(key: string): Promise<SyncMetadata | undefined> {
    return this.get<SyncMetadata>(STORES.SYNC_METADATA, key);
  }

  // User-specific data operations
  async getUserTasks(userId: string): Promise<any[]> {
    return this.getAll(STORES.TASKS, 'user_id', userId);
  }

  async getUserFolders(userId: string): Promise<any[]> {
    return this.getAll(STORES.FOLDERS, 'user_id', userId);
  }

  async getUserProperties(userId: string): Promise<any[]> {
    return this.getAll(STORES.PROPERTIES, 'user_id', userId);
  }

  // Bulk operations for sync
  async syncUserData(userId: string, data: { tasks: any[], folders: any[], properties: any[] }): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction([STORES.TASKS, STORES.FOLDERS, STORES.PROPERTIES], 'readwrite');
    
    const tasksStore = transaction.objectStore(STORES.TASKS);
    const foldersStore = transaction.objectStore(STORES.FOLDERS);
    const propertiesStore = transaction.objectStore(STORES.PROPERTIES);

    // Clear existing user data
    const clearPromises = [
      new Promise<void>((resolve, reject) => {
        const tasksIndex = tasksStore.index('user_id');
        const request = tasksIndex.openCursor(userId);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const foldersIndex = foldersStore.index('user_id');
        const request = foldersIndex.openCursor(userId);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const propertiesIndex = propertiesStore.index('user_id');
        const request = propertiesIndex.openCursor(userId);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      })
    ];

    await Promise.all(clearPromises);

    // Add new data
    const addPromises = [
      ...data.tasks.map(task => new Promise<void>((resolve, reject) => {
        const request = tasksStore.add(task);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })),
      ...data.folders.map(folder => new Promise<void>((resolve, reject) => {
        const request = foldersStore.add(folder);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })),
      ...data.properties.map(property => new Promise<void>((resolve, reject) => {
        const request = propertiesStore.add(property);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }))
    ];

    await Promise.all(addPromises);
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorageManager();