export class Repository<T extends { id?: number }> {
    constructor(private chain: any) {}

    async add(value: T): Promise<number> {
        const result: any = await this.chain.push(value).write();
        return result.id;
    }

    getById(id: number): Promise<T> {
        return Promise.resolve<T>(this.chain.find({ id }).value());
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
            .find({ id: value.id })
            .assign(value)
            .write();
    }

    updateAll(value: T[]): Promise<T[]> {
        return Promise.all(
            value.map(v =>
                this.chain
                    .find({ id: v.id })
                    .assign(v)
                    .write()
            )
        );
    }

    delete(id: number): Promise<any> {
        return this.chain.remove({ id }).write();
    }
}
