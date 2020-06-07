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
    config.findConfig.mockRejectedValueOnce({ code: 'NOCONFIG' })
    config.getSampleConfig.mockResolvedValueOnce('Hello world')

    await main.init(targetPath)

    expect(fs.writeFile).toHaveBeenCalledWith(targetPath, 'Hello world')
  })
  it('throws if a configuration already exists', async () => {
    const targetPath = path.join(process.cwd(), 'exodus-init-test.js')
    config.findConfig.mockResolvedValueOnce('/interwebz/exodus.config.js')

    await expect(main.init(targetPath)).rejects.toThrow('already exists')
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

describe('migrate()', () => {
  it('builds context', async () => {
    const contextBuilder = jest.fn()
    config.getConfig.mockResolvedValueOnce({ context: contextBuilder })

    await main.migrate().catch(() => {})

    expect(contextBuilder).toHaveBeenCalled()
  })

  it('returns ran migrations and state after running migrations', async () => {
    const fetchState = jest.fn()
    fetchState.mockResolvedValue({})
    config.getConfig.mockResolvedValueOnce({ fetchState })
    const job = { title: 'test-job-pls-ignore' }
    migrations.runPendingMigrations.mockResolvedValueOnce([job])

    const { state, ranMigrations } = await main.migrate()

    expect(migrations.runPendingMigrations).toHaveBeenCalledTimes(1)
    expect(ranMigrations).toMatchObject([job])
    expect(state).toMatchObject(state)
  })
})
