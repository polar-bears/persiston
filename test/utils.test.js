const expect = require('chai').expect
const utils = require('../utils')

describe('utils', () => {
  it('getDeepValue', () => {
    const obj = {
      A: 'a',
      B: {
        B1: 'b1'
      }
    }

    expect(utils.getDeepValue(obj, 'A')).to.equal('a')
    expect(utils.getDeepValue(obj, '')).to.equal(undefined)
    expect(utils.getDeepValue(obj, 'B.B1')).to.equal('b1')
  })

  it('toPairs', () => {
    const obj = {
      A: 'a1',
      'B.B1': 'b1'
    }

    const pairs = utils.toPairs(obj)
    expect(pairs).to.be.an('array')
    expect(pairs).to.have.lengthOf(2)
    expect(pairs[0][0]).to.equal('A')
    expect(pairs[0][1]).to.equal('a1')
    expect(pairs[1][0]).to.equal('B.B1')
    expect(pairs[1][1]).to.equal('b1')
  })

  it('match', () => {
    const obj = {
      foo: 'foo',
      bar: 'bar',
      baz: {
        foo: 'foo'
      }
    }

    expect(utils.match(obj, [])).to.equal(true)
    expect(utils.match(obj, [['foo', 'foo']])).to.equal(true)
    expect(utils.match(obj, [['bar', 'baz']])).to.equal(false)
    expect(utils.match(obj, [['baz.foo', 'foo']])).to.equal(true)
  })

  it('computedKeys', () => {
    const obj = {a: 1, b: 2, c: 3, d: 4}

    const keys1 = utils.computeKeys(obj)
    const keys2 = utils.computeKeys(obj, '')
    const keys3 = utils.computeKeys(obj, 'b c')
    const keys4 = utils.computeKeys(obj, '-b -c')
    const keys5 = utils.computeKeys(obj, '-a -b -c -d')
    const keys6 = utils.computeKeys(obj, 'a -c -d')
    const keys7 = utils.computeKeys(obj, '-a -b c')

    expect(keys1).to.have.members(['a', 'b', 'c', 'd'])
    expect(keys2).to.have.members(['a', 'b', 'c', 'd'])
    expect(keys3).to.have.members(['b', 'c'])
    expect(keys4).to.have.members(['a', 'd'])
    expect(keys5).to.have.members([])
    expect(keys6).to.have.members(['a'])
    expect(keys7).to.have.members(['c'])
  })

  it('deepCopy', () => {
    const obj = {
      foo: 'foo',
      index: 5,
      date: new Date(),
      array: [1, 2, 3],
      bar: {
        x: 1,
        y: 2
      },
      other: undefined
    }

    const copy = utils.deepCopy(obj)

    expect(copy).to.not.equal(obj)
    expect(copy.foo).to.equal(obj.foo)
    expect(copy.index).to.equal(obj.index)
    expect(copy.date).to.not.equal(obj.date)
    expect(copy.date.getTime()).to.equal(obj.date.getTime())
    expect(copy.array).to.not.equal(obj.array)
    expect(copy.array.length).to.equal(obj.array.length)
    expect(copy.bar).to.not.equal(obj.bar)
    expect(copy.bar.x).to.equal(obj.bar.x)
    expect(copy.bar.y).to.equal(obj.bar.y)
    expect(copy.other).to.equal(undefined)
  })
})
