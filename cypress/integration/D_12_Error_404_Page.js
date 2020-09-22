describe('MOMCOM_D_12_Error_404_Page', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify 404 error page is display for the incorrect links', () => {
    // const XPATH_FOOTER_FB = '//a[@aria-label="Facebook"]'

    cy.log('#2 Access a link that does not exist')
    cy.visit('/live')

    cy.log('-Verify It should redirect to 404 page.')
    cy.url().should('eq', Cypress.config().baseUrl + '/live')

    cy.log('#3 Click back to mom.com Homepage')
    cy.get('span').contains('Go home').parent().click()

    cy.log('-Verify It should redirect to homepage')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
