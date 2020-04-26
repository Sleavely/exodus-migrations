
const fs = require('./utils/fs')
const path = require('path')

exports.getSampleConfig = async () => {
  return fs.readFile(path.resolve(__dirname, './templates/config.js'), 'utf8')
}

let _config
let _context
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
        return fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf8')
      }
    }
    if (!_config.fetchState) {
      _config.fetchState = async () => {
        const statePath = path.join(configDir, 'exodus.state.json')
        try {
          return JSON.parse(await fs.readFile(statePath, 'utf8'))
        } catch (err) {
          if (err.code !== 'ENOENT') throw err
          return {}
        }
      }
    }

    // Transform context into a singleton
    const originalContextGetter = _config.context
    _config.context = async () => {
      if (!_context) {
        _context = await originalContextGetter()
      }
      return _context
    }
  }
  return _config
}

const defaultConfig = {
  /**
   * @name migrationsDirectory
   *
   * The folder to store migration scripts in,
   * relative to your configuration file.
   */
  migrationsDirectory: './migrations',

  /**
   * @name context
   *
   * Invoked at the beginning of a run, this method can return
   * an object with any details you want passed through to all
   * migrations, such as database connections, loggers, etc.
   *
   * @return {object}
   */
  context: async () => {
    return {}
  },

  /**
   * @name storeState
   *
   * Called to persist current migration state. Use this to store
   * the `state` argument in Redis, to disk, your database etc.
   * If undefined, Exodus falls back to exodus.state.json
   *
   * @param state The state object to be stored.
   * @param context The object you returned in `context`
   */
  // storeState: async (state, context) => {},

  /**
   * @name initialize
   *
   * This method is responsible for fetching the current
   * migration state, persisted by `storeState`.
   * If undefined, Exodus falls back to exodus.state.json
   *
   * @param context The object you returned in `context`
   * @return {object}
   */
  // fetchState: async (context) => {},

  // Callback executed right before all queued migrations are executed.
  beforeAll: async (pendingMigrations) => {},

  // Callback executed before each migration.
  beforeEach: async (migrationJob) => {},

  // Callback executed after each migration.
  afterEach: async (migrationJob) => {},

  // Callback executed right after all queued migrations are executed.
  afterAll: async (pendingMigrations) => {},

}
