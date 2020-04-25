module.exports = exports = {
  // The folder to store migration scripts in.
  // migrationsDirectory: './migrations',

  // Persists the current migration state. The `state`
  // argument will always be a variable-length JSON-serialized string.
  // Store it to redis, disk, database, ... whatever suits you.
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

  // // OPTIONAL. Invoked at the very beginning of a run before
  // // any locks are acquired or state is read. Use this to
  // // establish any connections needed by `fetchState`,
  // // `storeState`, `lock`, `unlock`.
  // initialize: async () => {},

  // // OPTIONAL. Callback executed right before all
  // // queued migrations are executed.
  // beforeAll: async (runlist) => {},

  // // OPTIONAL. Callback executed before each migration.
  // beforeEach: async (runlistItem) => {},

  // // OPTIONAL. Callback executed after each migration.
  // afterEach: async (runlistItem) => {},

  // // OPTIONAL. Callback executed right after all
  // // queued migrations are executed.
  // afterAll: async (runlist) => {},

  // // OPTIONAL. Invoked at the very tail end of a run once locks
  // // are released and state has been stored. Use this to tear
  // // down any connections established in `initialize`.
  // terminate: async () => {},

  // // OPTIONAL. Invoked at the beginning of a migration
  // // run. Use this to establish a global lock. You can
  // // either wait for a lock to become available, or fail.
  // lock: async () => {},

  // // OPTIONAL (unless `lock` is implemented). Implement this to
  // // release any global lock acquired by the `lock` function.
  // unlock: async () => {},

  // // OPTIONAL. The number of milliseconds to give up after if
  // // a lock cannot be obtained or released. This is only
  // // applicable if the `lock` function is implemented.
  // lockTimeout: 0,
}
