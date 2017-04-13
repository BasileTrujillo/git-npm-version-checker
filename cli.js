#!/usr/bin/env node

'use strict';

const program = require('commander');
const chalk = require('chalk');
const GitNpmVersionChecker = require('./lib/git-npm-version-checker');

program
    .description('Check your NPM package.json\'s version and your git branch version.')
    .option(
        '-f, --fix',
        'Automatically fix package.json version'
    )
    .option(
        '-v, --verbose',
        'Add more verbosity'
    )
    .parse(process.argv);

new GitNpmVersionChecker({
  fixVersion: program.fix,
  verbose: program.verbose
}).run().catch(err => {
  console.log(chalk.red('Error : ' + chalk.bold(err.message)));
  process.exitCode = 1;
});
