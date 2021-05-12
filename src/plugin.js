function cypressGrepPlugin(config) {
  if (config && config.env) {
    if (config.env.grep) {
      console.log(
        'cypress-grep: tests with "%s" in their names',
        config.env.grep,
      )
    }
    if (config.env.grepTags) {
      console.log('cypress-grep: filtering using tag "%s"', config.env.grepTags)
    }
  }
}

module.exports = cypressGrepPlugin
