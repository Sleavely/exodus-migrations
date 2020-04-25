
const fs = require('./utils/fs')

exports.getSampleConfig = async () => {
  return fs.readFile('./sample.config.js', 'utf8')
}

let _config
exports.getConfig = async () => {
  if (!_config) {
    const configName = 'exodus.config.js'
    const targetConfig = await fs.findUpwardsFile(configName)
    if (!targetConfig) throw new Error(`Could not find ${configName} in this or any parent directories.`)
    _config = require(targetConfig)
  }
  return _config
}
