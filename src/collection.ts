import { deepCopy, match, toPairs } from './utils'

export type Query<T> = { [key in keyof T]?: any }

export class Collection<T> {
  private readonly collection: T[]

  private onSave: () => Promise<any>

  public constructor (collection: T[], onSave: () => Promise<any>) {
    this.collection = collection
    this.onSave = onSave
  }

  private query (query?: Query<T>): T[] {
    const pairs = toPairs(query)
    return pairs.length
      ? this.collection.filter((item) => match(item, pairs))
      : this.collection
  }

  private queryOne (query?: Query<T>): T | null {
    const pairs = toPairs(query)
    const result = pairs.length
      ? this.collection.find((item) => match(item, pairs))
      : this.collection[0]

    return result || null
  }

  public async find (query?: Query<T>): Promise<T[]> {
    return this.query(query).map(deepCopy)
  }

  public async findOne (query?: Query<T>): Promise<T | null> {
    return deepCopy(this.queryOne(query))
  }

  public async insert<A extends T | T[]> (items: A): Promise<A> {
    let results: any

    if (Array.isArray(items)) {
      results = []

      items.map((i) => {
        if (!i) return

        this.collection.push(deepCopy(i))
        results.push(deepCopy(i))
      })
    } else {
      this.collection.push(deepCopy(items as any))
      results = deepCopy(items)
    }

    await this.onSave()
    return results
  }

  public async update (query: Query<T>, changes: Partial<T>): Promise<number> {
    const results = await this.query(query)
    const copyChanges = deepCopy(changes)

    results.forEach((item) => {
      Object.assign(item, copyChanges)
    })

    await this.onSave()
    return results.length
  }

  public async updateOne (
    query: Query<T>,
    changes: Partial<T>
  ): Promise<number> {
    const result = this.queryOne(query)
    if (!result) return 0

    Object.assign(result, changes)

    await this.onSave()
    return 1
  }

  public async remove (query?: Query<T>): Promise<number> {
    const pairs = toPairs(query)

    if (!pairs.length) {
      const count = this.collection.length
      this.collection.length = 0

      if (count) await this.onSave()
      return count
    }

    const indexes: number[] = []

    this.collection.forEach((item, index) => {
      if (match(item, pairs)) indexes.push(index)
    })

    indexes.reverse().forEach((index) => {
      this.collection.splice(index, 1)
    })

    if (indexes.length) await this.onSave()
    return indexes.length
  }

  public async removeOne (query: Query<T>): Promise<number> {
    const pairs = toPairs(query)
    const index = this.collection.findIndex((item) => match(item, pairs))

    if (index === -1) return 0

    this.collection.splice(index, 1)
    await this.onSave()
    return 1
  }
}
