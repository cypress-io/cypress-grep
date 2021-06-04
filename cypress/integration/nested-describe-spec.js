/// <reference path="../../src/index.d.ts" />

// @ts-check
describe('grand', () => {
  describe('outer', { tags: '@smoke' }, () => {
    describe('inner', () => {
      it('runs', () => {})
    })
  })
})
