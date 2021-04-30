/// <reference types="cypress" />
describe('tests that use .skip', () => {
  it('works', () => {})

  it.skip('is pending', () => {})

  it.skip('is pending again', () => {})
})
