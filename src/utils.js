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

function shouldTestRun(parsedGrep, testName) {
  // top levels are OR
  return parsedGrep.some((orPart) => {
    return orPart.every((p) => {
      if (p.invert) {
        return !testName.includes(p.tag)
      }

      return testName.includes(p.tag)
    })
  })
}

module.exports = { parseGrep, shouldTestRun }
