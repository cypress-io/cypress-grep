function parseGrep(s) {
  const ands = s.split('+')

  return ands
}

function shouldTestRun(parsedGrep, testName) {
  return parsedGrep.every((tag) => testName.includes(tag))
}

module.exports = { parseGrep, shouldTestRun }
