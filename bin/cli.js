#!/usr/bin/env node

const meow = require('meow')
const ora = require('ora')
const self = require('../package.json')

const main = require('..')
const path = require('path')

const cli = meow(`
Usage
  $ ${Object.keys(self.bin)[0]} <action>

Possible actions
  init              Adds a config file in your project directory
  create <name>     Creates a new file in your migrations dir
  migrate           Runs all remaining migrations

Options
  --help

For more information, see:
${self.homepage}
`, {
  description: false,
  flags: {},
})

let action = cli.input[0]

;(async () => {
  if (action === 'run') {
    // TODO: Remove in ^2.0.0
    action = 'migrate'
    ora('The "run" command has been deprecated and will be removed in the next major version. Use "migrate" instead.').warn()
  }

  if (action === 'init') {
    const targetFile = `${Object.keys(self.bin)[0]}.config.js`
    const targetPath = path.join(process.cwd(), targetFile)
    await main.init(targetPath)
    console.log(`Created configuration in "${targetPath}"`)
  } else if (action === 'create') {
    const name = cli.input[1]
    if (!name) throw new Error('No name supplied for "create" command.')
    const targetPath = await main.create(name)
    console.log(`Created migration in "${targetPath}`)
  } else if (action === 'migrate') {
    // Wrap *Each() to print each migration.
    const config = await main.getConfig()
    const spinners = {}

    const originalBeforeEach = config.beforeEach
    config.beforeEach = async (migrationJob, ...additionalArgs) => {
      spinners[migrationJob.filename] = ora()
      spinners[migrationJob.filename].start(`Running "${migrationJob.filename}"`)
      await originalBeforeEach(migrationJob, ...additionalArgs)
    }

    const originalAfterEach = config.afterEach
    config.afterEach = async (migrationJob, ...additionalArgs) => {
      await originalAfterEach(migrationJob, ...additionalArgs)
      spinners[migrationJob.filename].succeed(`Ran "${migrationJob.filename}"`)
    }
    // Now run 'em
    try {
      const { ranMigrations } = await main.run()
      if (ranMigrations.length) {
        ora().succeed(`Finished running ${ranMigrations.length} migration${ranMigrations.length === 1 ? '' : 's'}.`)
      } else {
        ora().info('No migrations to run.')
      }
    } catch (err) {
      let currentFile
      for (let filename in spinners) {
        // find runnign ones and fail them.
        if (spinners[filename].isSpinning) currentFile = filename
      }
      spinners[currentFile].fail()
      console.error(err)
      ora('').warn()
      ora(`"${currentFile}" encountered a problem. The error above might help.`).warn()
      ora('Migrations that finished have been saved to history and will not run again.').warn()
      ora('').warn()
      process.exit(1)
    }
  } else {
    cli.showHelp(1)
  }
})().catch(err => {
  console.error(err)
  cli.showHelp(1)
})
