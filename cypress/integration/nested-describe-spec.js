/// <reference path="../../src/index.d.ts" />

// @ts-check
describe('grand', () => {
  context('outer', { tags: '@smoke' }, () => {
    describe('inner', () => {
      it('runs', () => {})
    })
  })
})
