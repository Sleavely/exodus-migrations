
jest.mock('./utils/fs')
const fs = require('./utils/fs')

const path = require('path')

// Emulate a config file
const virtualConfig = jest.fn({})
const configPath = './config.virtual'
fs.findUpwardsFile.mockResolvedValue(configPath)
jest.doMock(configPath, virtualConfig, { virtual: true })

let config
beforeEach(() => {
  jest.clearAllMocks()
  // Reset any singletons
  config = jest.requireActual('./config')
})

describe('getSampleConfig()', () => {
  it('reads sample template relative to itself', async () => {
    await config.getSampleConfig()

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile.mock.calls[0][0]).toBe(
      path.join(__dirname, 'templates', 'config.js')
    )
  })

  it('returns the contents of the template as a string', async () => {
    const sampleTemplate = 'The bestest of templates.'
    fs.readFile.mockResolvedValueOnce(sampleTemplate)

    await expect(config.getSampleConfig()).resolves.toBe(sampleTemplate)
  })
})

describe('getConfig()', () => {
  it('finds config in current or parent directories', async () => {
    expect.assertions(1)
    await config.getConfig()
      // Dont care if we fail down the line for this test
      .catch(() => {})
      .finally(() => {
        // Trust and outsource to findUpwardsFile
        expect(fs.findUpwardsFile).toHaveBeenCalled()
      })
  })

  it('merges with default settings', async () => {
    const configFile = {
      bird: 'mockingbird',
    }
    virtualConfig.mockReturnValueOnce(configFile)

    const resolvedConfig = await config.getConfig()

    expect(resolvedConfig).toMatchObject(configFile)
    expect(resolvedConfig).toContainKeys([
      'migrationsDirectory',
      'context',
      'fetchState',
      'storeState',
      'beforeAll',
      'afterAll',
      'beforeEach',
      'afterEach',
    ])
  })

  it('caches resolved configuration in memory (singleton)', async () => {
    const firstConfig = await config.getConfig()
    const secondConfig = await config.getConfig()

    expect(secondConfig).toBe(firstConfig)
  })

  describe('config.migrationsDirectory', () => {
    it.todo('points to an absolute path')
  })

  describe('config.context()', () => {
    it.todo('returns a singleton')
  })

  describe('config.fetchState()', () => {
    it.todo('falls back to file-based state storage')
    it.todo('returns a singleton')
  })

  describe('config.storeState()', () => {
    it.todo('test')
    it.todo('falls back to file-based state storage')
  })

  describe('config.beforeAll()', () => {
    it.todo('test')
  })

  describe('config.beforeEach()', () => {
    it.todo('test')
  })

  describe('config.afterEach()', () => {
    it.todo('test')
  })

  describe('config.afterAll()', () => {
    it.todo('test')
  })
})
