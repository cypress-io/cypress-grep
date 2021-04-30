/// <reference types="cypress" />

const { parseGrep, shouldTestRun } = require('./utils')

// preserve the real "it" function
const _it = it
const _describe = describe

/**
 * Wraps the "it" and "describe" functions that support tags.
 * @see https://github.com/bahmutov/cypress-grep
 */
function cypressGrep() {
  const grep = Cypress.env('grep')

  if (!grep) {
    // nothing to do, the user has no specified the "grep" string
    return
  }

  const parsedGrep = parseGrep(grep)

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
    const shouldRun = shouldTestRun(parsedGrep, name, configTags)

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

module.exports = cypressGrep
