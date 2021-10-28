/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // optional: register cypress-grep plugin code
  // https://github.com/bahmutov/cypress-grep
  require('../../src/plugin')(config)
  // remember to return the config
  // because it might be changed by the plugin
  return config
}
