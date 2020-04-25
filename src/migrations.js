
const fs = require('./utils/fs')
const path = require('path')

exports.getSampleMigration = async () => {
  return fs.readFile(path.resolve(__dirname, './templates/migration.js'), 'utf8')
}
