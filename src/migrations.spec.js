
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

describe('runPendingMigrations', () => {
  beforeEach(() => {
    config.getConfig.mockResolvedValue({})
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('determines pending jobs from state history', async () => {
    const getPendingJobsSpy = jest.spyOn(migrations, 'getPendingJobs')

    await migrations.runPendingMigrations().catch(() => {})

    expect(getPendingJobsSpy).toHaveBeenCalled()
  })

  it('runs beforeAll hook before executing any migrations', async () => {
    const executionOrder = jest.fn(v => v)
    const beforeAll = jest.fn(() => executionOrder('beforeAll'))
    config.getConfig.mockResolvedValueOnce({ beforeAll })
    const getPendingJobsSpy = jest.spyOn(migrations, 'getPendingJobs')
    getPendingJobsSpy.mockResolvedValueOnce([{}])
    const upSpy = jest.spyOn(migrations, 'up')
    upSpy.mockImplementation(() => executionOrder('up'))

    await migrations.runPendingMigrations()

    expect(beforeAll).toHaveBeenCalled()
    expect(upSpy).toHaveBeenCalled()
    expect(executionOrder.mock.results[0].value).toBe('beforeAll')
    expect(executionOrder.mock.results[1].value).toBe('up')
  })

  it('doesnt run beforeAll when no migrations are pending', async () => {
    const beforeAll = jest.fn()
    config.getConfig.mockResolvedValueOnce({ beforeAll })
    const getPendingJobsSpy = jest.spyOn(migrations, 'getPendingJobs')
    // Pretend this isnt the DMV by using an empty queue
    getPendingJobsSpy.mockResolvedValueOnce([])

    await migrations.runPendingMigrations()

    expect(beforeAll).not.toHaveBeenCalled()
  })

  it('passes pending jobs off to up()', async () => {
    const job = {
      title: 'something non-descript',
      responsibilities: 'all of them',
      salary: 'too low',
    }
    const getPendingJobsSpy = jest.spyOn(migrations, 'getPendingJobs')
    getPendingJobsSpy.mockResolvedValueOnce([job])

    const upSpy = jest.spyOn(migrations, 'up')

    await migrations.runPendingMigrations().catch(() => {})

    expect(upSpy).toHaveBeenCalledWith(job)
  })

  it('runs afterAll hook after migrations have been executed', async () => {
    const executionOrder = jest.fn(v => v)

    const getPendingJobsSpy = jest.spyOn(migrations, 'getPendingJobs')
    getPendingJobsSpy.mockResolvedValueOnce([{}])

    const upSpy = jest.spyOn(migrations, 'up')
    upSpy.mockImplementation(() => executionOrder('up'))

    const afterAll = jest.fn(() => executionOrder('afterAll'))
    config.getConfig.mockResolvedValueOnce({
      afterAll,
      context: jest.fn(),
    })

    await migrations.runPendingMigrations()

    expect(upSpy).toHaveBeenCalled()
    expect(afterAll).toHaveBeenCalled()
    expect(executionOrder.mock.results[0].value).toBe('up')
    expect(executionOrder.mock.results[1].value).toBe('afterAll')
  })

  it('doesnt run afterAll when no migrations are pending', async () => {
    const afterAll = jest.fn()
    config.getConfig.mockResolvedValueOnce({ afterAll })
    const getPendingJobsSpy = jest.spyOn(migrations, 'getPendingJobs')
    // You're in luck; fast-track normally costs extra!
    getPendingJobsSpy.mockResolvedValueOnce([])

    await migrations.runPendingMigrations()

    expect(afterAll).not.toHaveBeenCalled()
  })
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
