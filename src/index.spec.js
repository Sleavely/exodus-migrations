const path = require('path')

jest.doMock('./config')
const config = require('./config')

jest.doMock('./migrations')
const migrations = require('./migrations')

jest.doMock('./utils/fs')
const fs = require('./utils/fs')

const requireUncached = (moduleName) => {
  let mod
  jest.isolateModules(() => {
    mod = require(moduleName)
  })
  return mod
}

const main = require('./index')

beforeEach(() => {
  jest.resetAllMocks()
})

it('can be loaded without throwing exceptions', () => {
  expect(() => {
    requireUncached(`./index`)
  }).not.toThrow()
})

describe('init()', () => {
  it('writes a configtemplate to the supplied path', async () => {
    const targetPath = path.join(process.cwd(), 'exodus-init-test.js')
    config.getSampleConfig.mockResolvedValueOnce('Hello world')

    await main.init(targetPath)

    expect(fs.writeFile).toHaveBeenCalledWith(targetPath, 'Hello world')
  })
})

describe('create()', () => {
  it('ensures the migrationsDirectory exists', async () => {
    config.getConfig.mockResolvedValueOnce({
      migrationsDirectory: '/dev/null',
    })

    await main.create().catch(() => {})

    expect(fs.mkdir).toHaveBeenCalledWith(
      '/dev/null',
      expect.objectContaining({ recursive: true })
    )
  })

  it('creates a migration from template', async () => {
    config.getConfig.mockResolvedValueOnce({ migrationsDirectory: '/' })
    migrations.getSampleMigration.mockResolvedValueOnce('Red Sea')

    await main.create('follow me')

    expect(migrations.getSampleMigration).toHaveBeenCalled()
  })

  it('writes slugified migration in the directory defined by config', async () => {
    const migrationsDirectory = path.resolve('/dev/null')
    config.getConfig.mockResolvedValueOnce({ migrationsDirectory })
    migrations.getSampleMigration.mockResolvedValueOnce('Dessert')

    await main.create('Delicious Pie')

    expect(fs.writeFile).toHaveBeenCalled()
    expect(fs.writeFile.mock.calls[0][0]).toInclude(migrationsDirectory)
    expect(fs.writeFile.mock.calls[0][0]).toInclude('delicious-pie')
  })
})

describe('run()', () => {
  beforeEach(() => {
    config.getConfig.mockResolvedValue({})
  })
  it('builds context', async () => {
    const contextBuilder = jest.fn()
    config.getConfig.mockResolvedValueOnce({ context: contextBuilder })

    await main.run().catch(() => {})

    expect(contextBuilder).toHaveBeenCalled()
  })

  it('determines pending jobs from state history', async () => {
    await main.run().catch(() => {})

    expect(migrations.getPendingJobs).toHaveBeenCalled()
  })

  it('passes pending jobs off to up()', async () => {
    config.getConfig.mockResolvedValueOnce({})
    const job = {
      title: 'something non-descript',
      responsibilities: 'all of them',
      salary: 'too low',
    }
    migrations.getPendingJobs.mockResolvedValueOnce([job])

    await main.run().catch(() => {})

    expect(migrations.up).toHaveBeenCalledWith(job)
  })

  it('runs beforeAll hook before executing any migrations', async () => {
    const beforeAll = jest.fn(() => Date.now())
    config.getConfig.mockResolvedValueOnce({ beforeAll })
    migrations.getPendingJobs.mockResolvedValueOnce([{}])
    // Delay for a bit just to make sure :D
    // Because fast computers are THE WORST
    migrations.up.mockReturnValue(Date.now() + 1)

    await main.run().catch(() => {})

    expect(beforeAll).toHaveBeenCalled()
    expect(migrations.up).toHaveBeenCalled()
    expect(beforeAll.mock.results[0].value)
      .toBeLessThan(migrations.up.mock.results[0].value)
  })

  it('runs afterAll hook after migrations have been executed', async () => {
    migrations.up.mockReturnValue(Date.now())
    // Supersonic speedbump
    const afterAll = jest.fn(() => Date.now() + 1)
    config.getConfig.mockResolvedValueOnce({
      beforeAll: jest.fn(),
      afterAll,
      context: jest.fn(),
    })
    migrations.getPendingJobs.mockResolvedValueOnce([{}])

    await main.run().catch(() => {})

    expect(migrations.up).toHaveBeenCalled()
    expect(afterAll).toHaveBeenCalled()
    expect(migrations.up.mock.results[0].value)
      .toBeLessThan(afterAll.mock.results[0].value)
  })

  it('doesnt run beforeAll when no migrations are pending', async () => {
    const beforeAll = jest.fn()
    config.getConfig.mockResolvedValueOnce({ beforeAll })
    // Pretend this isnt the DMV by using an empty queue
    migrations.getPendingJobs.mockResolvedValueOnce([])

    await main.run().catch(() => {})

    expect(beforeAll).not.toHaveBeenCalled()
  })

  it('doesnt run afterAll when no migrations are pending', async () => {
    const afterAll = jest.fn()
    config.getConfig.mockResolvedValueOnce({ afterAll })
    // You're in luck; fast-track normally costs extra!
    migrations.getPendingJobs.mockResolvedValueOnce([])

    await main.run().catch(() => {})

    expect(afterAll).not.toHaveBeenCalled()
  })

  it.todo('stores executed migrations to state')
})
