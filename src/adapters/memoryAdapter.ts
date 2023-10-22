import Adapter from "./adapter";

export default function MemoryAdapter(): Adapter {
  const memoryStore: Record<string, string | undefined> = {};
  return {
    async findByKey(key) {
      return memoryStore[key];
    },
    async checkKey(key) {
      return key in memoryStore;
    },
    async createKey(key, userId) {
      memoryStore[key] = userId;
      return userId;
    },
    async revokeKey(key) {
      delete memoryStore[key];
    },
  };
}
