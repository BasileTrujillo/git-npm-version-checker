'use strict';

const exec = require('child_process').exec;
const joi = require('joi');
const chalk = require('chalk');
const commandExistsSync = require('command-exists').sync;
const fs = require('fs-extra');

class GitNpmVersionChecker {
  /**
   * @param {Object} options Options
   * @param {Boolean} options.fixVersion true to automatically change the package.json's version
   */
  constructor(options) {
    const optSchema = joi.object().keys({
      fixVersion: joi.boolean().default(false),
      verbose: joi.boolean().default(false)
    }).unknown().required();

    const validatedOptions = joi.validate(options || {}, optSchema);

    if (validatedOptions.error) {
      throw new Error(this.constructor.name + ' options validation error: ' + validatedOptions.error.message);
    }

    this.options = validatedOptions.value;

    if (!commandExistsSync('git')) {
      throw new Error('"git" command not found. Please install git before using this script.');
    }
  }

  /**
   * Run the whole check process (get git branch version and compare with package.json)
   *
   * @return {Promise} A Promise of compare and fix if needed
   */
  run() {
    return this.getGitBranchName().then(branchName => {

      let version = null;
      const matchedVersion = branchName
                              .trim()
                              .match(`(?:${GitNpmVersionChecker.VERSION_BRANCH_IDENTIFIER.join('|')})\/(.*)$`);

      if (matchedVersion !== null && matchedVersion[1] !== '') {
        version = matchedVersion[1];
        this.log(chalk.blue(`Extracted git branch version: ${version}`));
      } else {
        const errMsg = 'No current git branch version found.';

        return Promise.reject(new Error(errMsg));
      }

      return this.compareWithPackage(version);
    });
  }

  /**
   * Try to get the current git branch name
   *
   * @return {Promise} Return the found branch name to the Promise resolver
   */
  getGitBranchName() {
    return new Promise((resolve, reject) => {
      exec('git symbolic-ref -q HEAD || git describe --all --exact-match', (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          this.log(chalk.blue(`Current git branch found: ${stdout}`));
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Read package.json and compare the version with the received one
   * Edit package.json if this.options.fixVersion == true
   *
   * @param {String} version Version to compare with
   * @return {Promise} Return true (to Promise resolver) if everything passed
   */
  compareWithPackage(version) {
    return new Promise((resolve, reject) => {
      // Read package.json
      fs.readJson(GitNpmVersionChecker.PACKAGE_PATH, (readJsonErr, packageFile) => {
        if (readJsonErr) {
          reject(readJsonErr);
        } else {
          this.log(chalk.blue(`package.json's version: ${packageFile.version}`));

          if (packageFile.version !== version) {
            const errMsg = 'Versions mismatch (git = ' + version + ' package.json = ' + packageFile.version + ')';

            if (this.options.fixVersion) {
              console.warn(chalk.magenta(errMsg));
              this.log(chalk.blue('Fixing package.json\'s version'));

              packageFile.version = version;

              // Write new version to package.json
              fs.writeJson(GitNpmVersionChecker.PACKAGE_PATH, packageFile, writeJsonErr => {
                if (writeJsonErr){
                  reject(writeJsonErr);
                } else {
                  console.log(chalk.green('Version fixed!'));
                  resolve(true);
                }
              });
            } else {
              reject(new Error(errMsg));
            }
          } else {
            console.log(chalk.green('Version check passed!'));
            resolve();
          }
        }
      });
    });
  }

  /**
   * Log function that console.log() only if this.options.verbose == true
   *
   * @param {String} msg Message to console.log()
   * @return {void} void
   */
  log(msg) {
    if (this.options.verbose) {
      console.log(msg);
    }
  }
}

/**
 * @type {string} "package.json" path
 */
GitNpmVersionChecker.PACKAGE_PATH = './package.json';
/**
 * @type {[String]} List of branch prefix to scan
 */
GitNpmVersionChecker.VERSION_BRANCH_IDENTIFIER = [
  'tags',
  'release',
  'hotfix'
];

module.exports = GitNpmVersionChecker;