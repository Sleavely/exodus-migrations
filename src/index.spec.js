
const requireUncached = (moduleName) => {
  delete require.cache[require.resolve(moduleName)]
  return require(moduleName)
}

it('can be loaded without throwing exceptions', () => {
  expect(() => {
    requireUncached(`./index`)
  }).not.toThrow()
})

describe('init()', () => {
  it.todo('writes a configtemplate to the supplied path')
})

describe('create()', () => {
  it.todo('ensures the migrationsDirectory exists')
  it.todo('creates a migration from template')
  it.todo('writes migration in the directory defined by config')
})

describe('run()', () => {
  it.todo('builds context')
  it.todo('determines pending jobs from state history')
  it.todo('runs beforeAll hook before executing any migrations')
  it.todo('runs afterAll hook after migrations have been executed')
  it.todo('doesnt run beforeAll when no migrations are pending')
  it.todo('doesnt run afterAll when no migrations are pending')
  it.todo('stores executed migrations to state')
})
