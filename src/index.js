const { getConfig, getSampleConfig } = require('./config')
const { getSampleMigration, getPendingJobs, up } = require('./migrations')
const { mkdir, writeFile } = require('./utils/fs')
const path = require('path')
const slugify = require('slugify')

exports.getConfig = getConfig

/**
 * Create a sample configuration in the supplied path
 */
exports.init = async (targetPath) => {
  const sampleConfig = await getSampleConfig()
  await writeFile(targetPath, sampleConfig)
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
exports.run = async () => {
  // find the config
  const config = await getConfig()

  // Initialize context and load history
  const context = await config.context()

  const pendingMigrations = await getPendingJobs()
  if (pendingMigrations.length) {
    await config.beforeAll(pendingMigrations)
    for (const migrationJob of pendingMigrations) {
      await up(migrationJob)
    }
    await config.afterAll(pendingMigrations)
  }

  // Store which migrations have been run, but clean absolute paths
  const state = await config.fetchState(context)
  state.lastRan = (new Date()).toJSON()
  state.history.forEach((job) => {
    delete job.path
  })
  await config.storeState(state, context)

  return { state, ranMigrations: pendingMigrations }
}

exports.rollback = async () => {}

exports.up = async () => {}

exports.down = async () => {}
