describe('TypeScript spec', () => {
  it('works', () => {
    type Person = {
      name: string
    }

    const person: Person = {
      name: 'Joe',
    }

    cy.wrap(person).should('have.property', 'name', 'Joe')
  })

  it('loads', () => {
    const n: number = 1
    cy.wrap(n).should('eq', 1)
  })
})
