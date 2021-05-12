/// <reference types="cypress" />

const { parseGrep, shouldTestRun } = require('./utils')
const debug = require('debug')('cypress-grep')
debug.log = console.info.bind(console)

// preserve the real "it" function
const _it = it
const _describe = describe

/**
 * Wraps the "it" and "describe" functions that support tags.
 * @see https://github.com/bahmutov/cypress-grep
 */
function cypressGrep() {
  /** @type {string} Part of the test title go grep */
  const grep = Cypress.env('grep')
  /** @type {string} Raw tags to grep string */
  const grepTags = Cypress.env('grepTags') || Cypress.env('grep-tags')

  if (!grep && !grepTags) {
    // nothing to do, the user has no specified the "grep" string
    debug('Nothing to grep')
    return
  }

  debug('grep %o', { grep, grepTags })
  const parsedGrep = parseGrep(grep, grepTags)
  debug('parsed grep %o', parsedGrep)

  it = function (name, options, callback) {
    if (typeof options === 'function') {
      // the test has format it('...', cb)
      callback = options
      options = {}
    }

    if (!callback) {
      // the pending test by itself
      return _it(name, options)
    }

    let configTags = options && options.tags
    if (typeof configTags === 'string') {
      configTags = [configTags]
    }
    const shouldRun = shouldTestRun(parsedGrep, name, configTags)

    if (shouldRun) {
      return _it(name, options, callback)
    }

    // skip tests without grep string in their names
    return _it.skip(name, options, callback)
  }

  describe = function (name, options, callback) {
    if (typeof options === 'function') {
      // the block has format describe('...', cb)
      callback = options
      options = {}
    }

    if (!callback) {
      // the pending suite by itself
      return _describe(name, options)
    }

    let configTags = options && options.tags
    if (typeof configTags === 'string') {
      configTags = [configTags]
    }

    if (!configTags || !configTags.length) {
      // if the describe suite does not have explicit tags
      // move on, since the tests inside can have their own tags
      return _describe(name, options, callback)
    }

    // when looking at the suite of the tests, I found
    // that using the name is quickly becoming very confusing
    // and thus we need to use the explicit tags
    const shouldRun = shouldTestRun(parsedGrep, configTags)

    if (shouldRun) {
      return _describe(name, options, callback)
    }

    // skip tests without grep string in their names
    return _describe.skip(name, options, callback)
  }

  // keep the "it.skip" the same as before
  it.skip = _it.skip
  describe.skip = _describe.skip
}

function restartTests() {
  setTimeout(() => {
    window.top.document.querySelector('.reporter .restart').click()
  }, 0)
}

if (!Cypress.grep) {
  // expose a utility method to set the grep and run the tests
  Cypress.grep = function grep(s) {
    Cypress.env('grep', s)
    debug('set new grep to "%s", restarting tests', s)
    restartTests()
  }
}

if (!Cypress.grepTags) {
  Cypress.grepTags = function grepTags(s) {
    Cypress.env('grepTags', s)
    debug('set new grep tags to "%s", restarting tests', s)
    restartTests()
  }
}

module.exports = cypressGrep
