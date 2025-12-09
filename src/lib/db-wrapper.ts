// D1 compatibility wrapper - makes D1 work like better-sqlite3
export function createDBWrapper(d1: D1Database) {
  return {
    prepare: (sql: string) => {
      const stmt = d1.prepare(sql);
      return {
        run: async (...params: any[]) => {
          if (params.length > 0) {
            return await stmt.bind(...params).run();
          }
          return await stmt.run();
        },
        get: async (...params: any[]) => {
          if (params.length > 0) {
            const result = await stmt.bind(...params).first();
            return result;
          }
          const result = await stmt.first();
          return result;
        },
        all: async (...params: any[]) => {
          if (params.length > 0) {
            const result = await stmt.bind(...params).all();
            return result.results || [];
          }
          const result = await stmt.all();
          return result.results || [];
        }
      };
    },
    exec: async (sql: string) => {
      return await d1.exec(sql);
    }
  };
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function jsonParse<T>(str: string | null): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}
