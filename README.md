# persiston

Simple persistent store with database-like API.

## Installation

```bash
# npm
npm install --save persiston

# yarn
yarn add persiston
```

## Usage

- For JavaScript & Promise

```javascript
import { Persiston } from 'persiston'
import { FileAdapter } from 'persiston/adapters/file-adapter'

const adapter = new FileAdapter('./data.json')
const store = new Persiston(adapter)

function main () {
  store.load()
    .then(() => store.collection('users').insert({ name: 'foo' }))
    .then(() => store.collection('users').findOne())
    .then((user) => console.log(user)) // { name: 'foo' }
}

main()
```

- For TypeScript & async/await

```typescript
import { Persiston } from 'persiston'
import { FileAdapter } from 'persiston/adapters/file-adapter'

interface User {
  name: string
}

class Store extends Persiston {
  users = this.collection<User>('users')
}

const adapter = new FileAdapter('./data.json')
const store = new Store(adapter)

async function main () {
  await store.load()
  await store.users.insert({ name: 'foo' })
  const user = await store.users.findOne()
  console.log(user) // { name: 'foo' }
}

main()
```

## APIs

- `store.load(): Promise<Persiston>`

  Loads data by adapter. It should be called before all collection operations.

- `store.save(): Promise<Persiston>`

  Saves data by adapter. You probably won't call it by yourself.

- `store.collection(): Collection<T>`

  Gets a collection object.

- `collection.find(query?: Query<T>, fields?: string): Promise<T[]>`

  Finds items by query.

- `collection.findOne(query?: Query<T>, fields?: string): Promise<T | null>`

  Finds an item by query.

- `collection.insert<A extends T | T[]>(items: A): Promise<A>`

  Saves given item or items.

- `collection.update(query: Query<T>, changes: Partial<T>): Promise<number>`

  Partially updates by query.

- `collection.updateOne(query: Query<T>, changes: Partial<T>): Promise<number>`

  Partially updates an item by query.

- `collection.remove(query?: Query<T>): Promise<number>`

  Removes items by query.

- `collection.removeOne(query: Query<T>): Promise<number>`

  Removes an item by query.
