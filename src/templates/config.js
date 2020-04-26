module.exports = exports = {
  // The folder to store migration scripts in.
  // migrationsDirectory: './migrations',

  // Persists the current migration state. The `state` argument
  // will always be an object. Store it as JSON to redis, disk, etc.
  // OPTIONAL: If undefined, Exodus falls back to exodus.state.json
  // storeState: async (state, context) => {},

  // This method is responsible for fetching the
  // current migration state, persisted by `storeState`.
  // OPTIONAL: If undefined, Exodus falls back to exodus.state.json
  // fetchState: async (context) => {},

  // // OPTIONAL. Invoked at the beginning of a run, this method
  // // should return an object with any details you want passed
  // // through to all migrations. This can be database connections,
  // // logging interfaces, etc.
  // context: async () => {
  //   return {}
  // },

  // // OPTIONAL. Provide a function that returns a string to use
  // // as the source for a new migration file.
  // migrationTemplate: async () => {
  //   return require('fs').readFileSync('path/to/template.js', 'utf8',)
  // },

  // // OPTIONAL. Callback executed right before all
  // // queued migrations are executed.
  // beforeAll: async (pendingMigrations) => {},

  // // OPTIONAL. Callback executed before each migration.
  // beforeEach: async (migrationJob) => {},

  // // OPTIONAL. Callback executed after each migration.
  // afterEach: async (migrationJob) => {},

  // // OPTIONAL. Callback executed right after all
  // // queued migrations are executed.
  // afterAll: async (pendingMigrations) => {},

}
