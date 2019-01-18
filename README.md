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

- For JavaScript

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

- For TypeScript

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

- store.load(): Promise<Persiston>

- store.save(): Promise<Persiston>

- store.collection(): Collection<T>

- collection.find(query?: Query<T>): Promise<T[]>

- collection.findOne(query?: Query<T>): Promise<T | null>

- collection.insert<A extends T | T[]>(items: A): Promise<A>

- collection.update(query: Query<T>, changes: Partial<T>): Promise<number>

- collection.updateOne(query: Query<T>, changes: Partial<T>): Promise<number>

- collection.remove(query?: Query<T>): Promise<number>

- collection.removeOne(query: Query<T>): Promise<number>
