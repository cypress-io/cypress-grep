/// <reference types="cypress" />

// NOTE, IGNORED: specify tag as substring has no effect
describe('block with tag @smoke', () => {
  it('inside describe 1', () => {})

  it('inside describe 2', () => {})
})

// WORKING: ignore the entire suite using invert option
//  --env grep=-@smoke
// NOT WORKING: run all the tests in this suite only
//  --env grep=@smoke
describe('block with config tag', { tags: '@smoke' }, () => {
  it('inside describe 3', () => {})

  it('inside describe 4', () => {})
})

describe('block without any tags', () => {
  // note the parent suite has no tags
  // so this test should run when using --eng grep=@smoke
  it('still runs', { tags: '@smoke' }, () => {})
})
