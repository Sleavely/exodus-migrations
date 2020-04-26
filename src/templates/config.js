module.exports = exports = {
  /**
   * @name migrationsDirectory
   *
   * The folder to store migration scripts in,
   * relative to your configuration file.
   */
  // migrationsDirectory: './migrations',

  /**
   * @name context
   *
   * Invoked at the beginning of a run, this method can return
   * an object with any details you want passed through to all
   * migrations, such as database connections, loggers, etc.
   *
   * @return {object}
   */
  // context: async () => { return {} },

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
   * @name fetchState
   *
   * This method is responsible for fetching the current
   * migration state, persisted by `storeState`.
   * If undefined, Exodus falls back to exodus.state.json
   *
   * @param context The object you returned in `context`
   * @return {object}
   */
  // fetchState: async (context) => {},

  /**
   * @name beforeAll
   *
   * Executed right before any of the queued migrations are run.
   *
   * @param {migrationJob[]}
   */
  // beforeAll: async (pendingMigrations) => {},

  /**
   * @name beforeEach
   *
   * Executed before each migration.
   *
   * @param {migrationJob}
   */
  // beforeEach: async (migrationJob) => {},

  /**
   * @name afterEach
   *
   * Executed after each migration.
   *
   * @param {migrationJob}
   */
  // afterEach: async (migrationJob) => {},

  /**
   * @name afterAll
   *
   * Executed after the final pending migration was run.
   *
   * @param {migrationJob[]}
   */
  // afterAll: async (pendingMigrations) => {},

}
