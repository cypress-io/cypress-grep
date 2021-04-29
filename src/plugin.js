function cypressGrepPlugin(config) {
  if (config && config.env && config.env.grep) {
    console.log(
      'cypress-grep: only running tests with "%s" in their names',
      config.env.grep,
    )
  }
}

module.exports = cypressGrepPlugin
