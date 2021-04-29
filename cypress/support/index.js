/// <reference types="cypress" />

// preserve the real "it" function
const _it = it

const grep = Cypress.env('grep')

if (grep) {
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
