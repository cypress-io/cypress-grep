/// <reference types="cypress" />

// IGNORED: specify tag as substring
describe('block with tag @smoke', () => {
  it('inside describe 1', () => {})

  it('inside describe 2', () => {})
})

// WORKING: specify tag inside the config object
describe('block with config tag', { tags: '@smoke' }, () => {
  it('inside describe 3', () => {})

  it('inside describe 4', () => {})
})

describe('block without any tags', () => {
  // note the parent suite has no tags
  // so this test should run when using --eng grep=@smoke
  it('still runs', { tags: '@smoke' }, () => {})
})
