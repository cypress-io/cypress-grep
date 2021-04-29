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

  // TODO: handle (name, options, callback) form
  it = (name, callback) => {
    if (!callback) {
      // the pending test by itself
      return _it(name)
    }

    const shouldRun = shouldTestRun(parsedGrep, name)

    if (shouldRun) {
      return _it(name, callback)
    }

    // skip tests without grep string in their names
    return _it.skip(name, callback)
  }
}

module.exports = cypressGrep
