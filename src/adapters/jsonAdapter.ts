import JSONdb from "simple-json-db";
import Adapter from "./adapter";

interface JsonAdapterConfig {
  path: string;
  absolutePath?: boolean;
}
export default function JsonAdapter(p: JsonAdapterConfig): Adapter {
  const db = new JSONdb(
    p.absolutePath ? p.path : `${__dirname.replace("adapters", "")}${p.path}`
  );

  return {
    async findByKey(key) {
      const data = db.get(`${key}`);
      return data;
    },
    async createKey(key, userId) {
      try {
        db.set(`${key}`, userId);
      } catch (err) {
        console.error(err);
      }
      return userId;
    },
    async revokeKey(key) {
      db.delete(`${key}`);
      return true;
    },
    async checkKey(key) {
      return db.has(`${key}`);
    },
    devCommands: {
      async seed() {
        db.JSON({});
      },
    },
  };
}
