# exodus-migrations

> Framework-agnostic migrations

[Github](https://github.com/Sleavely/exodus-migrations) | [NPM](https://www.npmjs.com/package/exodus)

## Install

```
$ npm i -g exodus
```

Node 10+ is recommended.

## Usage

```
$ exodus --help

  Usage
    $ exodus <action>

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
  https://github.com/Sleavely/exodus-migrations
```
