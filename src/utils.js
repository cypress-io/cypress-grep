function parseGrep(s) {
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

// note: tags take precedence over the test name
function shouldTestRun(parsedGrep, testName, tags = []) {
  if (Array.isArray(testName)) {
    // the caller passed tags only, no test name
    tags = testName
    testName = undefined
  }

  // top levels are OR
  return parsedGrep.some((orPart) => {
    return orPart.every((p) => {
      if (p.invert) {
        if (tags.length) {
          return !tags.includes(p.tag)
        }

        if (testName) {
          return !testName.includes(p.tag)
        }

        // no tags, no test name
        return true
      }

      if (tags.length) {
        return tags.includes(p.tag)
      }

      if (testName) {
        return testName.includes(p.tag)
      }

      // no tags, no test name
      return true
    })
  })
}

module.exports = { parseGrep, shouldTestRun }
