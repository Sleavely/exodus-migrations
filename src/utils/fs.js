const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

exports.access = promisify(fs.access)
exports.lstat = promisify(fs.lstat)
exports.mkdir = promisify(fs.mkdir)
exports.readDir = promisify(fs.readdir)
exports.readFile = promisify(fs.readFile)
exports.stat = promisify(fs.stat)
exports.writeFile = promisify(fs.writeFile)

/**
 * Finds and returns the path to an upwards file by traversing parent directories
 * until either the file exists or the directory is in the root of the filesystem.
 *
 * @param filename Name of file to look for
 * @param directory (Optional) Directory to start looking in.
 * @returns {string|false} Absolute path to the file.
 */
exports.findUpwardsFile = async (filename, directory = process.cwd()) => {
  const parsedPath = path.parse(path.join(directory, filename))
  const targetFile = path.join(parsedPath.dir, parsedPath.base)
  let fileExists = false
  try {
    await exports.access(targetFile, 'utf8')
    fileExists = true
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  if (fileExists) {
    // yay!
    return targetFile
  } else {
    if (parsedPath.dir === parsedPath.root) {
      // We're at the root of the filesystem. There's nowhere else to look.
      return false
    } else {
      // Keep digging
      return exports.findUpwardsFile(filename, path.dirname(directory))
    }
  }
}

/**
 * Retrieve all filenames in a directory, excluding subdirectories.
 *
 * @param directoryPath
 * @return {string[]} Filenames
 */
exports.listDirectoryFiles = async (directoryPath) => {
  // Note: withFileTypes requires Node 10+
  const dir = await exports.readDir(directoryPath, { withFileTypes: true })

  // Backwards compatibility
  const dirItems = await Promise.all(
    dir.map(async (item) => {
      // node 10.10+
      if (item.isDirectory) return item
      // Node 8 mostly
      const fsStatsObject = await exports.lstat(path.join(directoryPath, item))
      fsStatsObject.name = item
      return fsStatsObject
    })
  )

  return dirItems
    .filter(item => !item.isDirectory())
    .map(item => item.name)
}
