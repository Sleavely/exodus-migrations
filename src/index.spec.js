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
  it.todo('builds context')
  it.todo('determines pending jobs from state history')
  it.todo('runs beforeAll hook before executing any migrations')
  it.todo('runs afterAll hook after migrations have been executed')
  it.todo('doesnt run beforeAll when no migrations are pending')
  it.todo('doesnt run afterAll when no migrations are pending')
  it.todo('stores executed migrations to state')
})
