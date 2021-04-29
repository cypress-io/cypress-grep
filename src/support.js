/// <reference types="cypress" />

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

  // TODO: handle (name, options, callback) form
  it = (name, callback) => {
    if (!callback) {
      // the pending test by itself
      return _it(name)
    }

    if (name.includes(grep)) {
      return _it(name, callback)
    }

    // skip tests without grep string in their names
    return _it.skip(name, callback)
  }
}

module.exports = cypressGrep
