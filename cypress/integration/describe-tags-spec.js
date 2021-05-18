/// <reference types="cypress" />

describe('block with no tags', () => {
  it('inside describe 1', () => {})

  it('inside describe 2', () => {})
})

// WORKING: ignore the entire suite using invert option
//  --env grepTags=-@smoke
// NOT WORKING: run all the tests in this suite only
//  --env grepTags=@smoke
describe('block with tag smoke', { tags: '@smoke' }, () => {
  it('inside describe 3', () => {})

  it('inside describe 4', () => {})
})

describe('block without any tags', () => {
  // note the parent suite has no tags
  // so this test should run when using --eng grepTags=@smoke
  it('test with tag smoke', { tags: '@smoke' }, () => {})
})

it('is a test outside any suites', () => {})
