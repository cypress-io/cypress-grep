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

  /** @type {number} Number of times to repeat each running test */
  const grepBurn =
    Cypress.env('grepBurn') ||
    Cypress.env('grep-burn') ||
    Cypress.env('burn') ||
    1

  debug('grep %o', { grep, grepTags, grepBurn })
  // TODO validate grepBurn value
  const parsedGrep = parseGrep(grep, grepTags)
  debug('parsed grep %o', parsedGrep)

  it = function itGrep(name, options, callback) {
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
    if (configTags && configTags.length) {
      debug(
        'should test "%s" with tags %s run? %s',
        name,
        configTags.join(','),
        shouldRun,
      )
    } else {
      debug('should test "%s" run? %s', name, shouldRun)
    }

    if (shouldRun) {
      if (grepBurn > 1) {
        // repeat the same test to make sure it is solid
        return Cypress._.times(grepBurn, (k) => {
          const fullName = `${name}: burning ${k + 1} of ${grepBurn}`
          _it(fullName, options, callback)
        })
      }
      return _it(name, options, callback)
    }

    // skip tests without grep string in their names
    return _it.skip(name, options, callback)
  }

  describe = function describeGrep(name, options, callback) {
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
      _describe(name, options, callback)
      return
    }

    // when looking at the suite of the tests, I found
    // that using the name is quickly becoming very confusing
    // and thus we need to use the explicit tags
    const shouldRun = shouldTestRun(parsedGrep, configTags)

    if (shouldRun) {
      _describe(name, options, callback)
      return
    }

    // skip tests without grep string in their names
    _describe.skip(name, options, callback)
    return
  }

  // keep the ".skip", ".only" methods the same as before
  it.skip = _it.skip
  it.only = _it.only
  describe.skip = _describe.skip
  describe.only = _describe.only
}

function restartTests() {
  setTimeout(() => {
    window.top.document.querySelector('.reporter .restart').click()
  }, 0)
}

if (!Cypress.grep) {
  /**
   * A utility method to set the grep and run the tests from
   * the DevTools console. Restarts the test runner
   * @example
   *  // run only the tests with "hello w" in the title
   *  Cypress.grep('hello w')
   *  // runs only tests tagged both "@smoke" and "@fast"
   *  Cypress.grep(null, '@smoke+@fast')
   *  // runs the grepped tests 100 times
   *  Cypress.grep('add items', null, 100)
   *  // remove all current grep settings
   *  // and run all tests
   *  Cypress.grep()
   * @see "Grep from DevTools console" https://github.com/bahmutov/cypress-grep#devtools-console
   */
  Cypress.grep = function grep(grep, tags, burn) {
    Cypress.env('grep', grep)
    Cypress.env('grepTags', tags)
    Cypress.env('grepBurn', burn)
    // remove any aliased values
    Cypress.env('grep-tags', null)
    Cypress.env('grep-burn', null)
    Cypress.env('burn', null)

    debug('set new grep to "%o" restarting tests', { grep, tags, burn })
    restartTests()
  }
}

module.exports = cypressGrep
