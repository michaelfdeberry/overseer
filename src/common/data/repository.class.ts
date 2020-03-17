export class Repository<T extends { id?: string }> {
  constructor(private chain: any) {}

  async add(value: T): Promise<string> {
    const result: any = await this.chain.insert(value).write();
    return result.id;
  }

  getById(id: string): Promise<T> {
    return Promise.resolve<T>(this.chain.getById(id).value());
  }

  getByKey(predicate: (value: T) => boolean): Promise<T> {
    return Promise.resolve<T>(this.chain.find(predicate).value());
  }

  getAll(): Promise<T[]> {
    return Promise.resolve<T[]>(this.chain.value());
  }

  find(predicate: (value: T) => boolean): Promise<T[]> {
    return Promise.resolve<T[]>(this.chain.filter(predicate).value());
  }

  update(value: T): Promise<T> {
    return this.chain
      .getById(value.id)
      .assign(value, { id: value.id })
      .write();
  }

  updateAll(value: T[]): Promise<T[]> {
    return Promise.all(value.map(v => this.update(v)));
  }

  delete(id: string): Promise<any> {
    return this.chain.removeById(id).write();
  }
}
