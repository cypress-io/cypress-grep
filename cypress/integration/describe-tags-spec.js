/// <reference types="cypress" />

// specify tag as substring
describe('block with tag @smoke', () => {
  it('inside describe 1', () => {})

  it('inside describe 2', () => {})
})

// specify tag inside the config object
describe('block with config tag', { tags: '@smoke' }, () => {
  it('inside describe 3', () => {})

  it('inside describe 4', () => {})
})
