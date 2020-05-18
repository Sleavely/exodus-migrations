
jest.doMock('./config')
const config = require('./config')

const migrations = require('./migrations')

/**
 * Prepares a module that can be require()'d by the application
 */
const createVirtualMigration = () => {
  const job = {
    path: `./exodus-test-suite/${Math.ceil(Math.random() * 1000)}/migration.js`,
  }
  const migrationModule = {
    up: jest.fn(),
    down: jest.fn(),
  }
  const exportsFactory = jest.fn(() => migrationModule)
  jest.doMock(job.path, exportsFactory, { virtual: true })

  return {
    job,
    migrationModule,
    exportsFactory,
  }
}

describe('getSampleMigration()', () => {
  it.todo('test')
})

describe('getPendingJobs()', () => {
  it.todo('test')
})

describe('up()', () => {
  it.todo('test')

  it('stores executed migrations to state', async () => {
    const fetchState = jest.fn(async () => ({ history: [] }))
    const storeState = jest.fn()
    const context = jest.fn(() => ({}))
    const beforeAfterHooks = jest.fn()
    config.getConfig.mockResolvedValueOnce({
      context,
      fetchState,
      storeState,
      beforeEach: beforeAfterHooks,
      afterEach: beforeAfterHooks,
    })

    const { job } = createVirtualMigration()

    await migrations.up(job)

    expect(storeState).toHaveBeenCalled()
    expect(storeState.mock.calls[0][0]).toEqual({
      // Looks like a date, talks like a date?
      lastRan: expect.stringMatching(/^\d\d\d\d-\d\d-\d\dT\d\d/),
      history: [
        job,
      ],
    })
  })

  it.todo('doesnt store absolute file path prop to history')
})
