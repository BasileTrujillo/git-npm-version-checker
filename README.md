# Git NPM Version Checker

[![build status](https://gitlab.com/L0gIn/git-npm-version-checker/badges/master/build.svg)](https://gitlab.com/L0gIn/git-npm-version-checker/commits/master)
[![NPM Badge](https://img.shields.io/npm/v/git-npm-version-checker.svg)](https://www.npmjs.com/package/git-npm-version-checker)
[![coverage report](https://img.shields.io/badge/link-coverage-green.svg)](https://l0gin.gitlab.io/git-npm-version-checker/coverage)
[![JsDoc report](https://img.shields.io/badge/link-jsdoc-green.svg)](https://l0gin.gitlab.io/git-npm-version-checker/jsdoc)
[![Plato report](https://img.shields.io/badge/link-plato-green.svg)](https://l0gin.gitlab.io/git-npm-version-checker/plato)

Git NPM Version Checker is a CLI tool to check your NPM package.json's version and your git branch version.
Exemple: If your package.json is in version 1.0.0 and your current git branch called hotfix/1.0.1 or release/1.1.0, then git-npm-version-checker will alert you that package.json is not up to date.

This work with hotfix/* , release/*, tags/*

## Install

```bash
    $ npm i -g git-npm-version-checker
```

## Usage

```
  Usage: git-npm-version-checker [options]
  Or
  Usage: git-nv-check [options]

  Check your NPM package.json's version and your git branch version.

  Options:

    -h, --help     output usage information
    -f, --fix      Automatically fix package.json version
    -v, --verbose  Add more verbosity
```

## Examples

### Just check versions

```bash
    $ git-npm-version-checker
    # Or
    $ git-nv-check
```

### Check versions and fix it in package.json if different

```bash
    $ git-npm-version-checker --fix
    # Or
    $ git-nv-check -f
```

### Check versions with more verbosity

```bash
    $ git-npm-version-checker --verbose
    # Or
    $ git-nv-check -v
```
