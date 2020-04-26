const { getConfig, getSampleConfig } = require('./config')
const { getSampleMigration } = require('./migrations')
const { listDirectoryFiles, mkdir, writeFile } = require('./utils/fs')
const crypto = require('crypto')
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

  const targetName = `${Date.now()}-${slugify(name)}.js`
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

  const context = await config.context()
  // figure out which directory to look for migrations
  // in and find all files in the directory
  const files = await listDirectoryFiles(config.migrationsDirectory)

  // figure out which ones havent already been ran
  const state = await config.fetchState(context)
  state.history = state.history || []

  // create an ID for our round so we can undo latest batch later
  const roundId = crypto.randomBytes(20).toString('hex')

  // queue each pending to have up() called later
  const alreadyRanFiles = state.history.map(({ filename }) => filename)
  const pendingMigrations = files
    .filter((filename) => {
      return !alreadyRanFiles.includes(filename)
    })
    .sort()
    .map((filename) => ({
      roundId,
      filename,
      path: path.join(config.migrationsDirectory, filename),
    }))

  // if the queue is non-empty, call beforeAll()
  if (pendingMigrations.length) {
    await config.beforeAll(pendingMigrations)
    for (const migrationJob of pendingMigrations) {
      // beforeEach()
      migrationJob.startedAt = (new Date()).toJSON()
      await config.beforeEach(migrationJob)

      // Run the migration.
      const migrationModule = require(migrationJob.path)
      await migrationModule.up(context)

      // afterEach()
      migrationJob.finishedAt = (new Date()).toJSON()
      await config.afterEach(migrationJob)

      state.history.push(migrationJob)
    }
    await config.afterAll(pendingMigrations)
  }

  // Store which migrations have been run, but clean absolute paths
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
