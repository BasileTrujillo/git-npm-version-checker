'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;
const proxyquire = require('proxyquire').noPreserveCache();
const fakeVersion = '1.0.0';
const branchNamesThatShouldPassed = [
  'tags/' + fakeVersion,
  'heads/release/' + fakeVersion,
  'refs/heads/release/' + fakeVersion,
  'heads/hotfix/' + fakeVersion,
  'refs/heads/hotfix/' + fakeVersion
];
const branchNamesThatShouldFailed = [
  'heads/develop',
  'heads/master',
];
const fakeMismatchedVersion = '2.0.0';
const mismatchedBranchName = 'refs/heads/release/' + fakeMismatchedVersion;

describe('Check supported branch names', () => {

  for (let i in branchNamesThatShouldPassed) {
    const branchName = branchNamesThatShouldPassed[i];
    it('Should successfully check branch "' + branchName + '"', () => {
      const mocks = {
        'command-exists': {
          sync: () => true
        },
        'child_process': {
          exec: (cmd, func) => func(null, branchName)
        },
        'fs-extra': {
          readJson: (path, func) => func(null, {version: fakeVersion}),
          writeJson: (path, json, func) => func(null)
        }
      };
      const GitNpmVersionChecker = proxyquire('../lib/git-npm-version-checker.js', mocks);

      return new GitNpmVersionChecker({}).run();
    });
  }

  it('Should successfully fix version for branch "' + mismatchedBranchName + '" + verbose', () => {
    const mocks = {
      'command-exists': {
        sync: () => true
      },
      'child_process': {
        exec: (cmd, func) => func(null, mismatchedBranchName)
      },
      'fs-extra': {
        readJson: (path, func) => func(null, {version: fakeVersion}),
        writeJson: (path, json, func) => func(null)
      }
    };
    const GitNpmVersionChecker = proxyquire('../lib/git-npm-version-checker.js', mocks);

    return new GitNpmVersionChecker({
      fixVersion: true,
      verbose: true
    }).run();
  });
});

describe('Check unsupported branch names', () => {
  for (let i in branchNamesThatShouldFailed) {
    const branchName = branchNamesThatShouldFailed[i];
    it('Should fail to check branch "' + branchName + '"', () => {
      const mocks = {
        'command-exists': {
          sync: () => true
        },
        'child_process': {
          exec: (cmd, func) => func(null, branchName)
        },
        'fs-extra': {
          readJson: (path, func) => func(null, {version: fakeVersion}),
          writeJson: (path, json, func) => func(null)
        }
      };
      const GitNpmVersionChecker = proxyquire('../lib/git-npm-version-checker.js', mocks);

      return expect(new GitNpmVersionChecker({}).run()).be.rejectedWith(Error);;
    });
  }
});


describe('Check Errors and log', () => {
  it('Should fail to validate options', () => {
    const mocks = {
      'command-exists': {
        sync: () => false
      },
      'child_process': {
        exec: (cmd, func) => func(null)
      },
      'fs-extra': {
        readJson: (path, func) => func(null),
        writeJson: (path, json, func) => func(null)
      }
    };
    const GitNpmVersionChecker = proxyquire('../lib/git-npm-version-checker.js', mocks);

    return expect(() => new GitNpmVersionChecker({fixVersion: ''})).to.throw(Error);
  });

  it('Should fail to check branch because of command-exists error', () => {
    const mocks = {
      'command-exists': {
        sync: () => false
      },
      'child_process': {
        exec: (cmd, func) => func(null)
      },
      'fs-extra': {
        readJson: (path, func) => func(null),
        writeJson: (path, json, func) => func(null)
      }
    };
    const GitNpmVersionChecker = proxyquire('../lib/git-npm-version-checker.js', mocks);

    return expect(() => new GitNpmVersionChecker({})).to.throw(Error);
  });

  it('Should fail to check branch because of an exec() error', () => {
    const mocks = {
      'command-exists': {
        sync: () => true
      },
      'child_process': {
        exec: (cmd, func) => func(new Error('exec error'))
      },
      'fs-extra': {
        readJson: (path, func) => func(null, {version: fakeVersion}),
        writeJson: (path, json, func) => func(null)
      }
    };
    const GitNpmVersionChecker = proxyquire('../lib/git-npm-version-checker.js', mocks);

    return expect(new GitNpmVersionChecker({}).run()).be.rejectedWith(Error);
  });

  it('Should fail because versions mismatch for branch "' + mismatchedBranchName + '" + verbose', () => {
    const mocks = {
      'command-exists': {
        sync: () => true
      },
      'child_process': {
        exec: (cmd, func) => func(null, mismatchedBranchName)
      },
      'fs-extra': {
        readJson: (path, func) => func(null, {version: fakeVersion}),
        writeJson: (path, json, func) => func(null)
      }
    };
    const GitNpmVersionChecker = proxyquire('../lib/git-npm-version-checker.js', mocks);

    return expect(new GitNpmVersionChecker().run()).be.rejectedWith(Error);
  });

  it('Should fail reading package.json version for branch "' + mismatchedBranchName + '"', () => {
    const mocks = {
      'command-exists': {
        sync: () => true
      },
      'child_process': {
        exec: (cmd, func) => func(null, mismatchedBranchName)
      },
      'fs-extra': {
        readJson: (path, func) => func(new Error('readJson error')),
        writeJson: (path, json, func) => func(null)
      }
    };
    const GitNpmVersionChecker = proxyquire('../lib/git-npm-version-checker.js', mocks);

    return expect(new GitNpmVersionChecker({fixVersion: true}).run()).be.rejectedWith(Error);
  });

  it('Should fail fixing version for branch "' + mismatchedBranchName + '"', () => {
    const mocks = {
      'command-exists': {
        sync: () => true
      },
      'child_process': {
        exec: (cmd, func) => func(null, mismatchedBranchName)
      },
      'fs-extra': {
        readJson: (path, func) => func(null, {version: fakeVersion}),
        writeJson: (path, json, func) => func(new Error('writeJson error'))
      }
    };
    const GitNpmVersionChecker = proxyquire('../lib/git-npm-version-checker.js', mocks);

    return expect(new GitNpmVersionChecker({fixVersion: true}).run()).be.rejectedWith(Error);
  });
});