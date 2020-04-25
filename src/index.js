const { getConfig, getSampleConfig } = require('./config')
const { getSampleMigration } = require('./migrations')
const { listDirectoryFiles, writeFile } = require('./utils/fs')
const path = require('path')
const slugify = require('slugify')

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
  const slug = slugify(name)
  const config = await getConfig()
  const targetDir = config.migrationsDirectory
  const targetName = `${Date.now()}-${slug}.js`
  const statePath = path.join(targetDir, targetName)
  const template = await getSampleMigration()
  await writeFile(statePath, template, 'utf8')
}

/**
 * Run all unprocessed migrations
 */
exports.run = async () => {
  // find the config
  const config = await getConfig()
  // figure out which directory to look for migrations
  // in and find all files in the directory
  const files = await listDirectoryFiles(config.migrationsDirectory)

  // figure out which ones havent already been ran
  const state = await config.fetchState()

  // queue each to have up() called later
  const queuedFiles = files.filter((filename) => {
    return state.history.map(({ filename })).includes(filename)
  })

  // if the queue is non-empty, call beforeAll()
  if (queuedFiles.length) {
    await config.beforeAll()
    for (const file of queuedFiles) {
      const migration = require(file)
      // call beforeEach()
      await config.beforeEach(migration)
      // call up()
      await migration.up()
      // call afterEach()
      await config.afterEach(migration)
    }
    await config.afterAll()
  }

  // Store which migrations have been run
  await config.storeState(state)
}

exports.rollback = async () => {}

exports.up = async () => {}

exports.down = async () => {}
