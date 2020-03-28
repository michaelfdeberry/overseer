export class Repository<T extends { id?: string }> {
  constructor(private chain: any, private objConstructor: new () => T) {}

  construct(obj: any): T {
    const result = new this.objConstructor();
    Object.assign(result, obj);

    return result;
  }

  async add(value: T): Promise<string> {
    const result: T = await this.chain.insert(value).write();
    return result.id;
  }

  getById(id: string): Promise<T> {
    return Promise.resolve<T>(this.construct(this.chain.getById(id).value()));
  }

  getByKey(predicate: (value: T) => boolean): Promise<T> {
    return Promise.resolve<T>(this.construct(this.chain.find(predicate).value()));
  }

  getAll(): Promise<T[]> {
    return Promise.resolve<T[]>(this.chain.value().map((x: T) => this.construct(x)));
  }

  find(predicate: (value: T) => boolean): Promise<T[]> {
    return Promise.resolve<T[]>(
      this.chain
        .filter(predicate)
        .value()
        .map((x: T) => this.construct(x))
    );
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
