const FileAdapter = require('../adapters/file-adapter').FileAdapter
const FileAdapterSync = require('../adapters/file-adapter-sync').FileAdapter
const setup = require('./setup')

setup(FileAdapter, 'data.json')
setup(FileAdapterSync, 'data-sync.json')
