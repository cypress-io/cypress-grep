/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  if (config.env && config.env.grep) {
    console.log(
      'cypress-grep: only running tests with "%s" in their names',
      config.env.grep,
    )
  }
}
