/// <reference types="cypress" />

import { parseGrep, shouldTestRun } from './utils'

// preserve the real "it" function
const _it = it

/**
 * Wraps the "it" function with a new function.
 * @see https://github.com/bahmutov/cypress-grep
 */
function cypressGrep() {
  const grep = Cypress.env('grep')

  if (!grep) {
    // nothing to do, the user has no specified the "grep" string
    return
  }

  const parsedGrep = parseGrep(grep)

  it = (name, options, callback) => {
    if (typeof options === 'function') {
      // the test has format it('...', cb)
      callback = options
      options = {}
    }

    if (!callback) {
      // the pending test by itself
      return _it(name, options)
    }

    const shouldRun = shouldTestRun(parsedGrep, name)

    if (shouldRun) {
      return _it(name, options, callback)
    }

    // skip tests without grep string in their names
    return _it.skip(name, options, callback)
  }

  // keep the "it.skip" the same as before
  it.skip = _it.skip
}

module.exports = cypressGrep
