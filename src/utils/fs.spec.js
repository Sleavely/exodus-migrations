const fs = require('fs')
const path = require('path')

jest.mock('fs')
jest.mock('util', () => ({
  promisify: jest.fn(fn => fn),
}))

describe('access()', () => {
  it('Calls fs.access', async () => {
    const { access } = jest.requireActual('./fs')
    await access()

    expect(fs.access).toHaveBeenCalledTimes(1)
  })
})

describe('lstat()', () => {
  it('Calls fs.lstat', async () => {
    const { lstat } = jest.requireActual('./fs')

    await lstat()

    expect(fs.lstat).toHaveBeenCalledTimes(1)
  })
})

describe('mkdir()', () => {
  it('Calls fs.mkdir', async () => {
    const { mkdir } = jest.requireActual('./fs')

    await mkdir()

    expect(fs.mkdir).toHaveBeenCalledTimes(1)
  })
})

describe('readDir()', () => {
  it('Calls fs.readdir', async () => {
    const { readDir } = jest.requireActual('./fs')

    await readDir()

    expect(fs.readdir).toHaveBeenCalledTimes(1)
  })
})

describe('readFile()', () => {
  it('Calls fs.readFile', async () => {
    const { readFile } = jest.requireActual('./fs')

    await readFile()

    expect(fs.readFile).toHaveBeenCalledTimes(1)
  })
})

describe('stat()', () => {
  it('Calls fs.stat', async () => {
    const { stat } = jest.requireActual('./fs')

    await stat()

    expect(fs.stat).toHaveBeenCalledTimes(1)
  })
})

describe('writeFile()', () => {
  it('Calls fs.writeFile', async () => {
    const { writeFile } = jest.requireActual('./fs')

    await writeFile()

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
  })
})

describe('findUpwardsFile()', () => {
  const directory = '/home/test'
  const filename = 'test.file'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('looks for file in the supplied directory', async () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    fs.access.mockReturnValue()

    const targetFile = await findUpwardsFile(filename, directory)

    expect(fs.access).toHaveBeenCalledTimes(1)
    expect(targetFile).toBe(path.normalize('/home/test/test.file'))
  })
  it('defaults to process.cwd()', async () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    const cwdSpy = jest.spyOn(process, 'cwd')
    cwdSpy.mockReturnValue(directory)

    fs.access.mockReturnValue()

    await findUpwardsFile(filename)

    expect(cwdSpy).toHaveBeenCalledTimes(1)

    cwdSpy.mockRestore()
  })
  it('returns an absolute path when matching file is found', async () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    fs.access.mockResolvedValue()

    const targetFile = await findUpwardsFile(filename, directory)

    expect(targetFile).toBe(path.normalize('/home/test/test.file'))
  })
  it('returns false when file cannot be found', async () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    const enoentError = Error()
    enoentError.code = 'ENOENT'
    fs.access.mockRejectedValue(enoentError)

    const targetFile = await findUpwardsFile(filename, directory)

    expect(targetFile).toBeFalse()
  })
  it('traverses the directory tree', async () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    const enoentError = Error()
    enoentError.code = 'ENOENT'

    fs.access.mockRejectedValueOnce(enoentError)
    fs.access.mockResolvedValueOnce()

    await findUpwardsFile(filename, directory)

    expect(fs.access).toHaveBeenCalledTimes(2)
  })
  it('propagates error when fs access throws an error different than ENOENT', () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    const error = Error()
    fs.access.mockRejectedValue(error)

    expect(findUpwardsFile(filename, directory))
      .rejects
      .toMatchObject(error)
  })
})
describe('listDirectoryFiles()', () => {
  it('lists files in the supplied directory', async () => {
    const { listDirectoryFiles } = jest.requireActual('./fs')
    const { Dirent, constants } = jest.requireActual('fs')
    const { UV_DIRENT_FILE } = constants

    const file = new Dirent('file', UV_DIRENT_FILE)

    fs.readdir.mockResolvedValue([ file ])

    const files = await listDirectoryFiles()

    expect(files).toMatchObject([ file.name ])
  })
  it('ignores subdirectories in the supplied directory', async () => {
    const { listDirectoryFiles } = jest.requireActual('./fs')
    const { Dirent, constants } = jest.requireActual('fs')
    const { UV_DIRENT_DIR } = constants

    const directory = new Dirent('directory', UV_DIRENT_DIR)
    fs.readdir.mockResolvedValue([ directory ])

    const files = await listDirectoryFiles()

    expect(files).toMatchObject([])
  })
})
