function parseGrep(s) {
  const parsed = s.split('+').map((tag) => {
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
}

function shouldTestRun(parsedGrep, testName) {
  return parsedGrep.every((p) => {
    if (p.invert) {
      return !testName.includes(p.tag)
    }

    return testName.includes(p.tag)
  })
}

module.exports = { parseGrep, shouldTestRun }
