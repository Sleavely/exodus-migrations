#!/usr/bin/env node

const meow = require('meow')
const self = require('../package.json')

const main = require('..')
const path = require('path')

const cli = meow(`
Usage
  $ ${Object.keys(self.bin)[0]} <action>

Possible actions
  init              Adds a config file in your project directory
  create <name>     Creates a new file in your migrations dir
  run               Runs all remaining migrations
  rollback <file>   Rolls back all migrations to and including <file>

Options
  --help

For more information, see:
${self.homepage}
`, {
  description: false,
  flags: {},
})

const action = cli.input[0]

;(async () => {
  if (action) {
    switch (action) {
      case 'init':
        const targetFile = `${Object.keys(self.bin)[0]}.config.js`
        const targetPath = path.join(process.cwd(), targetFile)
        await main.init(targetPath)
        console.log(`Created configuration in "${targetPath}"`)
        break
      default:
        console.log('WIP!')
    }
  } else {
    cli.showHelp(1)
  }
})()
