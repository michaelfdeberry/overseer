export class ValueStore {
  constructor(private chain: any) {}

  get<T>(key: string): Promise<T> {
    try {
      const entry = this.chain.find({ key }).value();
      return Promise.resolve(entry?.value);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getOrSet<T>(key: string, setFunc: () => T): Promise<T> {
    let entry = this.chain.find({ key }).value();
    if (!entry) {
      entry = { key: key, value: setFunc() };
      await this.chain.push(entry).write();
    }

    return entry.value;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const result = await this.chain
      .find({ key })
      .assign({ value })
      .write();

    if (!result.id) {
      await this.chain.push({ key, value }).write();
    }
  }
}
