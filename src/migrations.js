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

/**
 * Find the latest batch of jobs that ran.
 * This is the spiritual inversion of getPendingJobs()
 */
exports.getRecentRound = async () => {
  const config = await getConfig()
  const context = await config.context()
  const state = await config.fetchState(context)

  const descHistory = state.history.sort(({ finishedAt: b }, { finishedAt: a }) => {
    if (a < b) {
      return -1
    }
    if (a > b) {
      return 1
    }
    return 0
  })
  return descHistory
    .filter(({ roundId }) => roundId === descHistory[0].roundId)
    .map((job) => ({
      ...job,
      path: path.join(config.migrationsDirectory, job.filename),
    }))
}

exports.rollbackRecentRound = async ({ ignoreMissing = false } = {}) => {
  const recentRound = await this.getRecentRound()

  // We need to consider distributed environments where the files
  // dont exist locally (e.g. distributed collaborative environments),
  // or for some reason were deleted.
  // Let's verify we have the entire round before proceeding.
  for (const migrationJob of recentRound) {
    migrationJob.exists = await fs.fileExists(migrationJob.path)

    if (!ignoreMissing && !migrationJob.exists) {
      const err = new Error(`"${migrationJob.filename}" is missing!`)
      err.code = 'MIGRATIONMISSING'
      throw err
    }
  }
  // The actual execution of the rollbacks gets its own loop
  // to avoid accidentally rolling back a partial round.
  for (const migrationJob of recentRound) {
    if (migrationJob.exists) {
      await this.down(migrationJob)
    }
    await this.deleteMigrationFromState(migrationJob)
  }

  return recentRound
}

exports.deleteMigrationFromState = async (migrationJob) => {
  const config = await getConfig()
  const context = await config.context()
  const state = await config.fetchState(context)

  // Delete the migration from the history, Thanos-style.
  state.history = state.history.filter(({ roundId, filename }) => {
    return roundId !== migrationJob.roundId || filename !== migrationJob.filename
  })
  delete migrationJob.exists
  delete migrationJob.path
  await config.storeState(state, context)
  return state
}

exports.down = async (migrationJob) => {
  const config = await getConfig()
  const context = await config.context()

  // Roll it back.
  const migrationModule = require(migrationJob.path)
  return migrationModule.down(context)
}
