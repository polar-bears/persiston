import * as fs from 'fs'

import { Adapter } from '../persiston'

export interface FileAdapterOptions<T> {
  initialValues?: T
  serialize?: (data: T) => string
  deserialize?: (data: string) => T
}

export class FileAdapter<T = any> implements Adapter<T> {
  private filename: string

  private initialValues: T

  private serialize: (data: T) => string

  private deserialize: (data: string) => T

  public constructor (filename: string, options: FileAdapterOptions<T> = {}) {
    this.filename = filename
    this.initialValues = options.initialValues || ({} as any)
    this.serialize = options.serialize || ((data) => JSON.stringify(data))
    this.deserialize = options.deserialize || ((data) => JSON.parse(data))
  }

  public async read () {
    if (!(await this.isFileExisted())) {
      await this.write(this.initialValues)
      return this.initialValues
    }

    try {
      const data = fs.readFileSync(this.filename, 'utf8').trim()
      return data ? this.deserialize(data) : this.initialValues
    } catch (error) {
      throw new Error(`Could not read file ${this.filename}: ${error.message}`)
    }
  }

  public async write (data: T) {
    try {
      const content = this.serialize(data)
      fs.writeFileSync(this.filename, content, 'utf8')
    } catch (error) {
      throw new Error(`Could not write file ${this.filename}: ${error.message}`)
    }
  }

  private async isFileExisted () {
    try {
      const stat = fs.statSync(this.filename)
      return stat.isFile()
    } catch (error) {
      return false
    }
  }
}
