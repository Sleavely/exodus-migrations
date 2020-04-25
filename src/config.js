
const fs = require('./utils/fs')
const path = require('path')

exports.getSampleConfig = async () => {
  return fs.readFile(path.resolve(__dirname, './templates/config.js'), 'utf8')
}

let _config
exports.getConfig = async () => {
  if (!_config) {
    const configName = 'exodus.config.js'
    const targetConfig = await fs.findUpwardsFile(configName)
    if (!targetConfig) throw new Error(`Could not find ${configName} in this or any parent directories.`)
    const externalConfig = require(targetConfig)
    _config = {
      ...defaultConfig,
      ...externalConfig,
    }
    // Resolve the absolute path to the migrations directory
    const configDir = path.dirname(targetConfig)
    _config.migrationsDirectory = path.resolve(
      configDir,
      _config.migrationsDirectory
    )

    // If no statehandlers have been defined, fall back to filebased state.
    if (!_config.storeState) {
      const statePath = path.join(configDir, 'exodus.state.json')
      _config.storeState = async (state) => {
        return fs.writeFile(statePath, state, 'utf8')
      }
    }
    if (!_config.fetchState) {
      _config.fetchState = async () => {
        const statePath = path.join(configDir, 'exodus.state.json')
        return fs.readFile(statePath, 'utf8')
      }
    }
  }
  return _config
}

const defaultConfig = {
  // The folder to store migration scripts in.
  migrationsDirectory: './migrations',

  // Persists the current migration state. The `state`
  // argument will always be a variable-length JSON-serialized string.
  // Store it to redis, disk, database, ... whatever suits you.
  // OPTIONAL: If undefined, Exodus falls back to exodus.state.json
  // storeState: async (state, context) => {},

  // This method is responsible for fetching the
  // current migration state, persisted by `storeState`.
  // OPTIONAL: If undefined, Exodus falls back to exodus.state.json
  // fetchState: async (context) => {},

  // Invoked at the beginning of a run, this method
  // should return an object with any details you want passed
  // through to all migrations. This can be database connections,
  // logging interfaces, etc.
  context: async () => {
    return {}
  },

  // Provide a function that returns a string to use
  // as the source for a new migration file.
  migrationTemplate: async () => {
    return fs.readFile(path.resolve(__dirname, './templates/migration.js'), 'utf8')
  },

  // Invoked at the very beginning of a run before
  // any locks are acquired or state is read. Use this to
  // establish any connections needed by `fetchState`,
  // `storeState`, `lock`, `unlock`.
  initialize: async () => {},

  // Callback executed right before all queued migrations are executed.
  beforeAll: async (runlist) => {},

  // Callback executed before each migration.
  beforeEach: async (runlistItem) => {},

  // Callback executed after each migration.
  afterEach: async (runlistItem) => {},

  // Callback executed right after all queued migrations are executed.
  afterAll: async (runlist) => {},

  // Invoked at the very tail end of a run once locks
  // are released and state has been stored. Use this to tear
  // down any connections established in `initialize`.
  terminate: async () => {},

  // Invoked at the beginning of a migration
  // run. Use this to establish a global lock. You can
  // either wait for a lock to become available, or fail.
  lock: async () => {},

  // Implement this to release any global lock acquired by the `lock` function.
  unlock: async () => {},

  // The number of milliseconds to give up after if
  // a lock cannot be obtained or released. This is only
  // applicable if the `lock` function is implemented.
  lockTimeout: 0,
}
