const debug = require('debug')('cypress-grep')
const globby = require('globby')
const { getTestNames } = require('find-test-names')
const fs = require('fs')
const path = require('path')

/**
 * Prints the cypress-grep environment values if any.
 * @param {Cypress.PluginConfigOptions} config
 */
function cypressGrepPlugin(config) {
  if (!config || !config.env) {
    return config
  }

  debug('Cypress config env object: %o', config.env)
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

  const grepFilterSpecs = config.env.grepFilterSpecs === true
  if (grepFilterSpecs && grep) {
    console.log('cypress-grep: filtering specs using "%s" in the title', grep)

    debug({
      integrationFolder: config.integrationFolder,
      testFiles: config.testFiles,
      ignoreTestFiles: config.ignoreTestFiles,
    })

    const specFiles = globby.sync(config.testFiles, {
      cwd: config.integrationFolder,
      ignore: config.ignoreTestFiles,
      absolute: false,
    })
    debug('found %d spec files', specFiles.length)
    debug('%o', specFiles)

    const specsWithText = specFiles.filter((specFile) => {
      const text = fs.readFileSync(
        path.join(config.integrationFolder, specFile),
        'utf8',
      )
      try {
        const names = getTestNames(text)
        const testAndSuiteNames = names.suiteNames.concat(names.testNames)
        debug('spec file %s', specFile)
        debug('suite and test names: %o', testAndSuiteNames)

        return testAndSuiteNames.some((name) => name.includes(grep))
      } catch (err) {
        console.error('Could not determine test names in file: %s', specFile)
        console.error('Will run it to let the grep filter the tests')
        return true
      }
    })

    debug('found "%s" in %d specs', grep, specsWithText.length)
    debug('%o', specsWithText)

    config.testFiles = specsWithText
  }

  return config
}

module.exports = cypressGrepPlugin
