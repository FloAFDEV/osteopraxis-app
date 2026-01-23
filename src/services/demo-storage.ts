export class DemoStorage {
  private static getKey(cabinetId: string, entity: string): string {
    return `demo:${cabinetId}:${entity}`;
  }

  static set(cabinetId: string, entity: string, data: any): void {
    const key = this.getKey(cabinetId, entity);
    localStorage.setItem(key, JSON.stringify(data));
  }

  static get<T>(cabinetId: string, entity: string): T | null {
    const key = this.getKey(cabinetId, entity);
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  static remove(cabinetId: string, entity: string): void {
    const key = this.getKey(cabinetId, entity);
    localStorage.removeItem(key);
  }

  static clearCabinet(cabinetId: string): void {
    const prefix = `demo:${cabinetId}:`;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  static getAll<T>(cabinetId: string, entity: string): T[] {
    const data = this.get<T[]>(cabinetId, entity);
    return data || [];
  }

  static add<T>(cabinetId: string, entity: string, item: T): void {
    const items = this.getAll<T>(cabinetId, entity);
    items.push(item);
    this.set(cabinetId, entity, items);
  }

  static update<T extends { id: string }>(
    cabinetId: string,
    entity: string,
    id: string,
    updatedItem: T
  ): void {
    const items = this.getAll<T>(cabinetId, entity);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = updatedItem;
      this.set(cabinetId, entity, items);
    }
  }

  static delete(cabinetId: string, entity: string, id: string): void {
    const items = this.getAll<any>(cabinetId, entity);
    const filtered = items.filter(item => item.id !== id);
    this.set(cabinetId, entity, filtered);
  }
}
