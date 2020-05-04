jest.mock('./utils/fs')
const fs = require('./utils/fs')

const config = jest.requireActual('./config')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getSampleConfig()', () => {
  it('reads sample template relative to itself', async () => {
    const path = jest.requireActual('path')

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
  it.todo('finds config in current or parent directories')
  it.todo('merges with default settings')

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
