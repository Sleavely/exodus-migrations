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
      .then(() => ora().succeed(`Created configuration in "${targetPath}"`))
      .catch((err) => {
        if (err.code !== 'INITEXISTS') throw err
        ora().fail(err.message)
        process.exit(1)
      })
  } else if (action === 'create') {
    const name = cli.input[1]
    if (!name) throw new Error('No name supplied for "create" command.')
    const targetPath = await main.create(name)
    console.log(`Created migration in "${targetPath}`)
  } else if (action === 'migrate') {
    // Wrap *Each() to print each step.
    const spinners = {}
    spinners.getConfig = ora().start('Loading configuration')
    const config = await main.getConfig()
    spinners.getConfig.succeed('Loaded configuration')

    const originalContextBuilder = config.context
    config.context = async () => {
      const stepName = 'context()'
      const runForFirstTime = !spinners[stepName] || spinners[stepName].isSpinning
      if (runForFirstTime) spinners[stepName] = ora().start('Building context')
      const contextReturnValue = await originalContextBuilder()
      if (runForFirstTime) spinners[stepName].succeed('Loaded context')
      return contextReturnValue
    }

    const originalBeforeEach = config.beforeEach
    config.beforeEach = async (migrationJob, ...additionalArgs) => {
      const stepName = `"${migrationJob.filename}"`
      spinners[stepName] = ora()
      spinners[stepName].start(`Running ${stepName}`)
      await originalBeforeEach(migrationJob, ...additionalArgs)
    }

    const originalAfterEach = config.afterEach
    config.afterEach = async (migrationJob, ...additionalArgs) => {
      await originalAfterEach(migrationJob, ...additionalArgs)
      const stepName = `"${migrationJob.filename}"`
      spinners[stepName].succeed(`Ran ${stepName}`)
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
      let currentStep
      for (let step in spinners) {
        // find runnign ones and fail them.
        if (spinners[step].isSpinning) currentStep = step
      }
      if (currentStep) spinners[currentStep].fail()
      console.error(err)
      ora('').warn()
      ora(`${currentStep || 'exodus'} encountered a problem. The error above might help.`).warn()
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
