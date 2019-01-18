const path = require('path')
const util = require('util')
const expect = require('chai').expect
const rimraf = require('rimraf')
const fs = require('fs')

const rimrafAsync = util.promisify(rimraf)
const writeFileAsync = util.promisify(fs.writeFile)

const { Persiston } = require('..')
const { FileAdapter } = require('../adapters/file-adapter')

const dataFile = path.resolve(__dirname, 'data.json')
const adapter = new FileAdapter(dataFile)
const store = new Persiston(adapter)

describe('persiston', () => {
  beforeEach(async () => {
    const data = {
      items: [
        { title: 'a1', group: 'A', active: false },
        { title: 'a2', group: 'A', active: true },
        { title: 'a3', group: 'A', active: false },
        { title: 'b1', group: 'B', active: true },
        { title: 'b2', group: 'B', active: false },
        { title: 'b3', group: 'B', active: true },
        { title: 'b4', group: 'B', active: false },
        { title: 'b5', group: 'B', active: true }
      ]
    }

    await rimrafAsync(dataFile)
    await writeFileAsync(dataFile, JSON.stringify(data), 'utf8')
    await store.load()
  })

  it('collection', () => {
    const items = store.collection('items')
    expect(items).to.be.an('object')

    const others = store.collection('others')
    expect(others).to.be.an('object')
  })

  it('collection.findOne', async () => {
    const item1 = await store.collection('items').findOne()
    expect(item1).to.be.an('object')
    expect(item1).to.have.property('title')

    const item2 = await store.collection('items').findOne({ group: 'A' })
    expect(item2).to.be.an('object')
    expect(item2).to.have.property('group', 'A')

    const item3 = await store.collection('items').findOne({ group: 'A', active: true })
    expect(item3).to.be.an('object')
    expect(item3).to.have.property('title', 'a2')

    const item4 = await store.collection('items').findOne({ group: 'C' })
    expect(item4).to.equal(null)
  })

  it('collection.find', async () => {
    const items1 = await store.collection('items').find()
    expect(items1).to.be.an('array')
    expect(items1).to.have.lengthOf(8)

    const items2 = await store.collection('items').find({ group: 'A' })
    expect(items2).to.be.an('array')
    expect(items2).to.have.lengthOf(3)

    const items3 = await store.collection('items').find({ group: 'A', active: true })
    expect(items3).to.be.an('array')
    expect(items3).to.have.lengthOf(1)
  })

  it('collection.insert', async () => {
    const item = await store.collection('items').insert({ title: 'c1', group: 'C', active: false })
    expect(item).to.be.an('object')
    expect(item).to.have.property('title', 'c1')
    expect(item).to.have.property('active', false)

    const items = await store
      .collection('items')
      .insert([{ title: 'c2', group: 'C', active: false }, null, { title: 'c3', group: 'C', active: true }])
    expect(items).to.be.an('array')
    expect(items).to.have.lengthOf(2)

    const list = await store.collection('items').find({ group: 'C' })
    expect(list).to.be.an('array')
    expect(list).to.have.lengthOf(3)
  })

  it('collection.updateOne', async () => {
    const result1 = await store.collection('items').updateOne({}, { active: true })
    expect(result1).to.equal(1)

    const item1 = await store.collection('items').findOne()
    expect(item1).to.be.an('object')
    expect(item1).to.have.property('active', true)

    const result2 = await store.collection('items').updateOne({ title: 'a2' }, { active: false })
    expect(result2).to.equal(1)

    const item2 = await store.collection('items').findOne({ title: 'a2' })
    expect(item2).to.be.an('object')
    expect(item2).to.have.property('active', false)

    const result3 = await store.collection('items').updateOne({ title: 'c1' }, { active: true })
    expect(result3).to.equal(0)
  })

  it('collection.update', async () => {
    const result = await store.collection('items').update({ group: 'B' }, { active: true })
    expect(result).to.equal(5)

    const items = await store.collection('items').find({ group: 'B' })
    expect(items).to.have.lengthOf(5)
    expect(items[0]).to.have.property('active', true)
    expect(items[1]).to.have.property('active', true)
    expect(items[2]).to.have.property('active', true)
    expect(items[3]).to.have.property('active', true)
    expect(items[4]).to.have.property('active', true)
  })

  it('collection.removeOne', async () => {
    const result1 = await store.collection('items').removeOne()
    expect(result1).to.equal(1)

    const items1 = await store.collection('items').find()
    expect(items1).to.have.lengthOf(7)

    const result2 = await store.collection('items').removeOne({group: 'B'})
    expect(result2).to.equal(1)

    const items2 = await store.collection('items').find({group: 'B'})
    expect(items2).to.have.lengthOf(4)

    const result3 = await store.collection('items').removeOne({group: 'B', otherProp: 'test'})
    expect(result3).to.equal(0)

    const items3 = await store.collection('items').find({group: 'B'})
    expect(items3).to.have.lengthOf(4)
  })

  it('collection.remove', async () => {
    const result1 = await store.collection('items').remove({group: 'C'})
    expect(result1).to.equal(0)

    const items1 = await store.collection('items').find()
    expect(items1).to.have.lengthOf(8)

    const result2 = await store.collection('items').remove({group: 'A', active: false})
    expect(result2).to.equal(2)

    const items2 = await store.collection('items').find({group: 'A'})
    expect(items2).to.have.lengthOf(1)

    const result3 = await store.collection('items').remove()
    expect(result3).to.equal(6)

    const items3 = await store.collection('items').find()
    expect(items3).to.have.lengthOf(0)

    const result4 = await store.collection('items').remove()
    expect(result4).to.equal(0)

    const items4 = await store.collection('items').find()
    expect(items4).to.have.lengthOf(0)
  })
})
