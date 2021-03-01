const crypto = require('crypto')
const fs = require('./utils/fs')
const path = require('path')
const { getConfig } = require('./config')
const { listDirectoryFiles } = require('./utils/fs')

exports.getSampleMigration = async () => {
  return fs.readFile(path.resolve(__dirname, './templates/migration.js'), 'utf8')
}

exports.getPendingJobs = async () => {
  const config = await getConfig()
  const context = await config.context()
  const state = await config.fetchState(context)
  const alreadyRanFiles = state.history.map(({ filename }) => filename)

  // create an ID for our round so we can undo latest batch later
  const roundId = crypto.randomBytes(20).toString('hex')

  // figure out which directory to look for migrations
  // in and find all files in the directory
  const files = await listDirectoryFiles(config.migrationsDirectory)

  const pendingMigrations = files
    .filter((filename) => {
      if (!filename.endsWith('.js')) return false
      return !alreadyRanFiles.includes(filename)
    })
    .sort()
    .map((filename) => ({
      roundId,
      filename,
      path: path.join(config.migrationsDirectory, filename),
    }))

  return pendingMigrations
}

exports.runPendingMigrations = async () => {
  const config = await getConfig()

  const pendingMigrations = await this.getPendingJobs()

  if (pendingMigrations.length) {
    if (config.beforeAll) await config.beforeAll(pendingMigrations)

    for (const migrationJob of pendingMigrations) {
      await this.up(migrationJob)
    }
    if (config.afterAll) await config.afterAll(pendingMigrations)
  }

  return pendingMigrations
}

exports.up = async (migrationJob) => {
  const config = await getConfig()
  const context = await config.context()
  const state = await config.fetchState(context)

  // beforeEach()
  migrationJob.startedAt = (new Date()).toJSON()
  await config.beforeEach(migrationJob)

  // Run the migration.
  const migrationModule = require(migrationJob.path)
  await migrationModule.up(context)

  // afterEach()
  migrationJob.finishedAt = (new Date()).toJSON()
  await config.afterEach(migrationJob)

  // Store job in history, but strip absolute path
  // since it's not relevant in distributed environments.
  delete migrationJob.path
  state.history.push(migrationJob)
  state.lastRan = migrationJob.finishedAt
  await config.storeState(state, context)

  return state
}
