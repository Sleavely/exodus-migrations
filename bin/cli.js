#!/usr/bin/env node

const meow = require('meow')

const self = require('../package.json')

const cli = meow(`
Usage
  $ ${Object.keys(self.bin)[0]} <action>

Possible actions
  init              Adds a config file in your project directory
  create <name>     Creates a new file in your migrations dir
  run               Runs all remaining migrations
  rollback <file>   Rolls back all migrations to and including <file>
  up <file>         Runs a specific migration file
  down <file>       Rolls back a specific file

Options
  --help

For more information, see:
${self.homepage}
`, {
  description: false,
  flags: {},
})

const action = cli.input[0]
if (action) {
  console.log('WIP!')
} else {
  cli.showHelp(1)
}
