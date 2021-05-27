// @ts-check

// Universal code - should run in Node or in the browser

/**
 * Parses test title grep string.
 * The string can have "-" in front of it to invert the match.
 * @param {string} s Input substring of the test title
 */
function parseTitleGrep(s) {
  if (!s || typeof s !== 'string') {
    return null
  }

  s = s.trim()
  if (s.startsWith('-')) {
    return {
      title: s.substr(1),
      invert: true,
    }
  }
  return {
    title: s,
    invert: false,
  }
}

function parseFullTitleGrep(s) {
  if (!s || typeof s !== 'string') {
    return []
  }

  // separate each title
  return s.split(';').map(parseTitleGrep)
}

/**
 * Parses tags to grep for.
 * @param {string} s Tags string like "@tag1+@tag2"
 */
function parseTagsGrep(s) {
  if (!s) {
    return []
  }

  // top level split - using space, each part is OR
  const ORS = s.split(' ').map((part) => {
    // now every part is an AND
    const parsed = part.split('+').map((tag) => {
      if (tag.startsWith('-')) {
        return {
          tag: tag.slice(1),
          invert: true,
        }
      }

      return {
        tag,
        invert: false,
      }
    })

    return parsed
  })

  return ORS
}

function shouldTestRunTags(parsedGrepTags, tags = []) {
  if (!parsedGrepTags.length) {
    // there are no parsed tags to search for, the test should run
    return true
  }

  // now the test has tags and the parsed tags are present

  // top levels are OR
  const onePartMatched = parsedGrepTags.some((orPart) => {
    const everyAndPartMatched = orPart.every((p) => {
      if (p.invert) {
        return !tags.includes(p.tag)
      }

      return tags.includes(p.tag)
    })
    // console.log('every part matched %o?', orPart, everyAndPartMatched)

    return everyAndPartMatched
  })

  // console.log('onePartMatched', onePartMatched)
  return onePartMatched
}

function shouldTestRunTitle(parsedGrep, testName) {
  if (!testName) {
    // if there is no title, let it run
    return true
  }
  if (!parsedGrep) {
    return true
  }

  if (parsedGrep.invert) {
    return !testName.includes(parsedGrep.title)
  }

  return testName.includes(parsedGrep.title)
}

// note: tags take precedence over the test name
function shouldTestRun(parsedGrep, testName, tags = []) {
  if (Array.isArray(testName)) {
    // the caller passed tags only, no test name
    tags = testName
    testName = undefined
  }

  return (
    shouldTestRunTitle(parsedGrep.title, testName) &&
    shouldTestRunTags(parsedGrep.tags, tags)
  )
}

function parseGrep(titlePart, tags) {
  return {
    title: parseTitleGrep(titlePart),
    tags: parseTagsGrep(tags),
  }
}

module.exports = {
  parseGrep,
  parseTitleGrep,
  parseFullTitleGrep,
  parseTagsGrep,
  shouldTestRun,
  shouldTestRunTags,
  shouldTestRunTitle,
}
