const {
  findConfig,
  getConfig,
  getSampleConfig,
} = require('./config')
const {
  getSampleMigration,
  runPendingMigrations,
} = require('./migrations')
const {
  mkdir,
  writeFile,
} = require('./utils/fs')
const path = require('path')
const slugify = require('slugify')

exports.getConfig = getConfig

/**
 * Create a sample configuration in the supplied path
 */
exports.init = async (targetPath) => {
  const existingConfigPath = await findConfig()
    .catch(err => {
      if (err.code === 'NOCONFIG') return false
      throw err
    })
  const sampleConfig = await getSampleConfig()
  if (existingConfigPath) {
    const err = new Error(`A configuration already exists in "${existingConfigPath}"`)
    err.code = 'INITEXISTS'
    throw err
  }
  return writeFile(targetPath, sampleConfig)
}

/**
 * Create a migration file in the migrations directory
 */
exports.create = async (name) => {
  const config = await getConfig()

  // Make sure migrationsDirectory exists, otherwise create it.
  const targetDir = config.migrationsDirectory
  await mkdir(targetDir, { recursive: true })

  const targetName = `${Date.now()}-${slugify(name, { lower: true })}.js`
  const targetPath = path.join(targetDir, targetName)
  const template = await getSampleMigration()
  await writeFile(targetPath, template, 'utf8')
  return targetPath
}

/**
 * Run all unprocessed migrations
 */
exports.migrate = async () => {
  // find the config
  const config = await getConfig()

  // Initialize context and load history
  const context = config.context ? await config.context() : {}

  const ranMigrations = await runPendingMigrations()

  const state = await config.fetchState(context)
  return { state, ranMigrations }
}
/**
 * TODO: Remove in ^2.0.0
 *
 * @deprecated
 */
exports.run = this.migrate

exports.rollback = async () => {}

exports.up = async () => {}

exports.down = async () => {}
