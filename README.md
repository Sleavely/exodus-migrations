# exodus-migrations

> Framework-agnostic migrations

[ ![CircleCI](https://img.shields.io/circleci/build/github/Sleavely/exodus-migrations?token=22848581bf01ecc38384dd7f568a8404e84c21d2) ](https://circleci.com/gh/Sleavely/exodus-migrations)

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

Exodus was largely inspired by the flexibility and user experience of [`migrat`](https://github.com/naturalatlas/migrat), and many of the configurables and templates have been forked from there. The major difference is that callbacks are a thing of the past, kicked aside in favor of async-await patterns.
