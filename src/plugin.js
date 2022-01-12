const debug = require('debug')('cypress-grep')
const globby = require('globby')
const { getTestNames } = require('find-test-names')
const fs = require('fs')
const path = require('path')
const { version } = require('../package.json')
const { parseGrep, shouldTestRun } = require('./utils')

/**
 * Prints the cypress-grep environment values if any.
 * @param {Cypress.PluginConfigOptions} config
 */
function cypressGrepPlugin(config) {
  if (!config || !config.env) {
    return config
  }

  debug('Cypress config env object: %o', config.env)
  debug('plugin version %s', version)
  const grep = config.env.grep ? String(config.env.grep) : undefined
  if (grep) {
    console.log('cypress-grep: tests with "%s" in their names', grep.trim())
  }

  const grepTags = config.env.grepTags || config.env['grep-tags']
  if (grepTags) {
    console.log('cypress-grep: filtering using tag(s) "%s"', grepTags)
    const parsedGrep = parseGrep(null, grepTags)
    debug('parsed grep tags %o', parsedGrep.tags)
  }

  const grepBurn =
    config.env.grepBurn || config.env['grep-burn'] || config.env.burn
  if (grepBurn) {
    console.log('cypress-grep: running filtered tests %d times', grepBurn)
  }

  const grepUntagged = config.env.grepUntagged || config.env['grep-untagged']
  if (grepUntagged) {
    console.log('cypress-grep: running untagged tests')
  }

  const omitFiltered =
    config.env.grepOmitFiltered || config.env['grep-omit-filtered']
  if (omitFiltered) {
    console.log('cypress-grep: will omit filtered tests')
  }

  const grepFilterSpecs = config.env.grepFilterSpecs === true
  if (grepFilterSpecs) {
    if (grep) {
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

      const parsedGrep = parseGrep(grep)
      debug('parsed grep %o', parsedGrep)

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

          return testAndSuiteNames.some((name) => {
            const shouldRun = shouldTestRun(parsedGrep, name)
            return shouldRun
          })
        } catch (err) {
          debug(err.message)
          debug(err.stack)
          console.error('Could not determine test names in file: %s', specFile)
          console.error('Will run it to let the grep filter the tests')
          return true
        }
      })

      debug('found grep "%s" in %d specs', grep, specsWithText.length)
      debug('%o', specsWithText)

      config.testFiles = specsWithText
    } else if (grepTags) {
      console.log('cypress-grep: filtering specs using tag "%s"', grepTags)

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

      const parsedGrep = parseGrep(null, grepTags)
      debug('parsed grep tags %o', parsedGrep)

      const specsWithText = specFiles.filter((specFile) => {
        const text = fs.readFileSync(
          path.join(config.integrationFolder, specFile),
          'utf8',
        )
        try {
          const testInfo = getTestNames(text)
          debug('spec file %s', specFile)
          debug('test info: %o', testInfo.tests)

          return testInfo.tests.some((info) => {
            const shouldRun = shouldTestRun(parsedGrep, null, info.tags)
            return shouldRun
          })
        } catch (err) {
          console.error('Could not determine test names in file: %s', specFile)
          console.error('Will run it to let the grep filter the tests')
          return true
        }
      })

      debug('found grep tags "%s" in %d specs', grepTags, specsWithText.length)
      debug('%o', specsWithText)

      if (specsWithText.length) {
        config.testFiles = specsWithText
      } else {
        // hmm, we filtered out all specs, probably something is wrong
        console.warn('Grep "%s" has eliminated all specs', grep)
        console.warn('Will leave all specs to run to filter at run-time')
      }
    }
  }

  return config
}

module.exports = cypressGrepPlugin
