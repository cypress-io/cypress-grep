/// <reference types="cypress" />

import { parseGrep, shouldTestRun } from '../../src/utils'

describe('utils', () => {
  context('parseGrep', () => {
    // no need to exhaustively test the parsing
    // since we want to confirm it works via test names
    // and not through the implementation details of
    // the parsed object
    it('creates objects from the grep string', () => {
      const parsed = parseGrep('@tag1+@tag2+@tag3')
      expect(parsed).to.deep.equal([
        // single OR part
        [
          // with 3 AND parts
          { tag: '@tag1', invert: false },
          { tag: '@tag2', invert: false },
          { tag: '@tag3', invert: false },
        ],
      ])
    })
  })

  context('shouldTestRun', () => {
    // a little utility function to parse the given grep string
    // and apply the first argument in shouldTestRun
    const checkName = (grep) => {
      expect(grep, 'grep string').to.be.a('string')

      const parsed = parseGrep(grep)
      expect(parsed).to.be.an('array')

      return (testName) => {
        expect(testName).to.be.a('string')
        return shouldTestRun(parsed, testName)
      }
    }

    it('simple tag', () => {
      const parsed = parseGrep('@tag1')
      expect(shouldTestRun(parsed, 'no tag1 here')).to.be.false
      expect(shouldTestRun(parsed, 'has @tag1 in the name')).to.be.true
    })

    it('with invert option', () => {
      const t = checkName('-@tag1')
      expect(t('no tag1 here')).to.be.true
      expect(t('has @tag1 in the name')).to.be.false
    })

    it('with AND option', () => {
      const t = checkName('@tag1+@tag2')
      expect(t('no tag1 here')).to.be.false
      expect(t('has only @tag1 in the name')).to.be.false
      expect(t('has only @tag2 in the name')).to.be.false
      expect(t('has @tag1 and @tag2 in the name')).to.be.true
    })

    it('with OR option', () => {
      const t = checkName('@tag1 @tag2')
      expect(t('no tag1 here')).to.be.false
      expect(t('has only @tag1 in the name')).to.be.true
      expect(t('has only @tag2 in the name')).to.be.true
      expect(t('has @tag1 and @tag2 in the name')).to.be.true
    })

    it('OR with AND option', () => {
      const t = checkName('@tag1 @tag2+@tag3')
      expect(t('no tag1 here')).to.be.false
      expect(t('has only @tag1 in the name')).to.be.true
      expect(t('has only @tag2 in the name')).to.be.false
      expect(t('has only @tag2 in the name and also @tag3')).to.be.true
      expect(t('has @tag1 and @tag2 and @tag3 in the name')).to.be.true
    })
  })
})
