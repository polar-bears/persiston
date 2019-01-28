import { Collection } from './collection'

export type Collections = {
  [key: string]: any[];
}

export interface Adapter<T = any> {
  read: () => Promise<T>
  write: (data: T) => Promise<void>
}

export class Persiston {
  private adapter: Adapter

  public data: Collections = {}

  public constructor (adapter: Adapter) {
    this.adapter = adapter
  }

  public async load () {
    this.data = await this.adapter.read()
    return this
  }

  public async save () {
    this.adapter.write(this.data)
    return this
  }

  public collection<T = any> (name: string): Collection<T> {
    this.data[name] = this.data[name] || []
    return new Collection(this, name)
  }
}
