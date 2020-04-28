const fs = require('fs')
const path = require('path')

jest.mock('fs')
jest.mock('path')
jest.mock('util', () => ({
  promisify: jest.fn().mockImplementation(fn => fn),
}))

const toPathObject = (directory, filename) => ({
  dir: directory,
  base: filename,
  root: '/',
})

describe('access()', () => {
  it('Calls fs.access', () => {
    const { access } = jest.requireActual('./fs')
    access()

    expect(fs.access).toHaveBeenCalledTimes(1)
  })
})

describe('lstat()', () => {
  it('Calls fs.lstat', () => {
    const { lstat } = jest.requireActual('./fs')

    lstat()

    expect(fs.lstat).toHaveBeenCalledTimes(1)
  })
})

describe('mkdir()', () => {
  it('Calls fs.readdir', () => {
    const { mkdir } = jest.requireActual('./fs')

    mkdir()

    expect(fs.mkdir).toHaveBeenCalledTimes(1)
  })
})

describe('readDir()', () => {
  it('Calls fs.readdir', () => {
    const { readDir } = jest.requireActual('./fs')

    readDir()

    expect(fs.readdir).toHaveBeenCalledTimes(1)
  })
})

describe('readFile()', () => {
  it('Calls fs.readFile', () => {
    const { readFile } = jest.requireActual('./fs')

    readFile()

    expect(fs.readFile).toHaveBeenCalledTimes(1)
  })
})

describe('stat()', () => {
  it('Calls fs.stat', () => {
    const { stat } = jest.requireActual('./fs')

    stat()

    expect(fs.stat).toHaveBeenCalledTimes(1)
  })
})

describe('writeFile()', () => {
  it('Calls fs.writeFile', () => {
    const { writeFile } = jest.requireActual('./fs')

    writeFile()

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
  })
})

describe('findUpwardsFile()', () => {
  const directory = '/home/test'
  const filename = 'test.file'
  const parsedPath = toPathObject(directory, filename)
  const errors = {
    random: {
      code: 'TEST',
    },
    enoent: {
      code: 'ENOENT',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()

    path.parse.mockReturnValue(parsedPath)
    path.join.mockReturnValue(directory.concat('/', filename))
  })
  it('looks for file in the supplied directory', async () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    path.parse.mockReturnValue(parsedPath)
    path.join.mockReturnValue(directory.concat('/', filename))

    fs.access.mockReturnValue()

    const targetFile = await findUpwardsFile(filename, directory)

    expect(fs.access).toHaveBeenCalledTimes(1)
    expect(targetFile).toBe('/home/test/test.file')
  })
  it('defaults to process.cwd()', async () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    const cwdSpy = jest.spyOn(process, 'cwd')
    cwdSpy.mockReturnValue(directory)

    fs.access.mockReturnValue()

    await findUpwardsFile(filename)

    expect(cwdSpy).toHaveBeenCalledTimes(1)
  })
  it('returns an absolute path when matching file is found', async () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    fs.access.mockResolvedValue()

    const targetFile = await findUpwardsFile(filename, directory)

    expect(targetFile).toBe('/home/test/test.file')
  })
  it('returns false when file cannot be found', async () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    const rootDir = '/'
    const rootPath = {
      ...parsedPath,
      dir: rootDir,
    }

    path.parse.mockReturnValue(rootPath)
    fs.access.mockRejectedValue(errors.enoent)

    const targetFile = await findUpwardsFile(filename, rootDir)

    expect(targetFile).toBeFalse()
  })
  it('traverses the directory tree', async () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    path.parse.mockReturnValue(parsedPath)
    path.join.mockReturnValue(directory.concat('/', filename, directory))
    path.dirname.mockReturnValueOnce('/test1')

    fs.access.mockRejectedValueOnce(errors.enoent)
    fs.access.mockResolvedValueOnce()

    await findUpwardsFile(filename, directory)

    expect(path.parse).toHaveBeenCalledTimes(2)
    expect(path.join).toHaveBeenCalledTimes(4)
    expect(path.dirname).toHaveBeenCalledTimes(1)
    expect(fs.access).toHaveBeenCalledTimes(2)
  })
  it('propagates error when fs access throws an error different than ENOENT', () => {
    const { findUpwardsFile } = jest.requireActual('./fs')

    const rootDir = '/'
    const rootPath = {
      ...parsedPath,
      dir: rootDir,
    }

    path.parse.mockReturnValue(rootPath)
    fs.access.mockRejectedValue(errors.random)

    expect(findUpwardsFile(filename, rootDir))
      .rejects
      .toMatchObject(errors.random)
  })
})
describe('listDirectoryFiles()', () => {
  it.todo('lists files in the supplied directory')
  it.todo('???')
})
