import * as fs from 'fs'
import * as util from 'util'

import { Adapter } from '../persiston'

const statFile = util.promisify(fs.stat)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

export interface FileAdapterOptions<T> {
  initialValues?: T
  serialize?: (data: T) => Promise<string>
  deserialize?: (data: string) => Promise<T>
}

export class FileAdapter<T = any> implements Adapter<T> {
  private filename: string

  private initialValues: T

  private serialize: (data: T) => Promise<string>

  private deserialize: (data: string) => Promise<T>

  public constructor (filename: string, options: FileAdapterOptions<T> = {}) {
    this.filename = filename
    this.initialValues = options.initialValues || ({} as any)
    this.serialize = options.serialize || ((data) => Promise.resolve(JSON.stringify(data)))
    this.deserialize = options.deserialize || ((data) => Promise.resolve(JSON.parse(data)))
  }

  public async read () {
    if (!(await this.isFileExisted())) {
      await this.write(this.initialValues)
      return this.initialValues
    }

    try {
      const data = (await readFile(this.filename, 'utf8')).trim()
      return data ? this.deserialize(data) : this.initialValues
    } catch (error) {
      throw new Error(`Could not read file ${this.filename}: ${error.message}`)
    }
  }

  public async write (data: T) {
    try {
      const content = await this.serialize(data)
      await writeFile(this.filename, content, 'utf8')
    } catch (error) {
      throw new Error(`Could not write file ${this.filename}: ${error.message}`)
    }
  }

  private async isFileExisted () {
    try {
      const stat = await statFile(this.filename)
      return stat.isFile()
    } catch (error) {
      return false
    }
  }
}
