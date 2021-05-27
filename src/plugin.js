/**
 * Prints the cypress-grep environment values if any.
 * Only informs the user, does not modify the config.
 * @param {Cypress.PluginConfigOptions} config
 */
function cypressGrepPlugin(config) {
  if (config && config.env) {
    const grep = config.env.grep
    if (grep) {
      console.log('cypress-grep: tests with "%s" in their names', grep.trim())
    }

    const grepTags = config.env.grepTags || config.env['grep-tags']
    if (grepTags) {
      console.log('cypress-grep: filtering using tag "%s"', grepTags)
    }

    const grepBurn =
      config.env.grepBurn || config.env['grep-burn'] || config.env.burn
    if (grepBurn) {
      console.log('cypress-grep: running filtered tests %d times', grepBurn)
    }
  }
}

module.exports = cypressGrepPlugin
