import { Collection } from './collection'

const VERSION_KEY = 'PERSISTON_VERSION'

export type Collections = {
  [key: string]: any[];
}

export type Migration = {
  target: number
  process: (data: any) => any
}

export interface Adapter<T = any> {
  read: () => Promise<T>
  write: (data: T) => Promise<void>
}

export class Persiston {
  private adapter: Adapter

  public version: number

  public data: Collections

  public migrations: Migration[]

  public constructor (adapter: Adapter, version: number = 1) {
    this.adapter = adapter
    this.version = version
    this.data = { [VERSION_KEY]: version } as any
    this.migrations = []
  }

  public async load () {
    let data = await this.adapter.read()
    const version = data[VERSION_KEY] || 0

    if (version !== this.version) {
      data = this.migrations.reduce((newData, migration) => {
        return version <= migration.target
          ? migration.process(newData)
          : newData
      }, data)
    }

    this.data = { ...data, [VERSION_KEY]: this.version }

    return this
  }

  public async save () {
    this.adapter.write(this.data)
    return this
  }

  public collection<T = any> (name: string): Collection<T> {
    if (name === VERSION_KEY) {
      throw new Error(`Invalid collection name: ${VERSION_KEY}`)
    }

    return new Collection(this, name)
  }
}
