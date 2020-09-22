describe('MOMCOM_D_03_Search_Invalid', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  let randomString = () => {
    let randomText = ''
    let possibleChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 10; i++)
      randomText += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length))

    return randomText
  }

  it('Verify Search function with invalid keyword and no search result page', () => {
    const KEYWORD = randomString() + 'Test'

    const CSS_SEARCH_ICON = 'button[class*="sharedStyles__ScIconButton"]'
    const CSS_SEARCH_INPUT = 'input[class*="NavbarDesktop__ScForwardRefSearchBox"]'

    // Click search icon #2
    cy.get(CSS_SEARCH_ICON).click()

    // Verify search box appear with "Search" text and type keyword #2
    cy.log('#2 Verify search box appear with "Search" text and type keyword')
    cy.get(CSS_SEARCH_INPUT).invoke('attr', 'placeholder').should('eq', 'Search')

    // Type keyword in search box
    cy.get(CSS_SEARCH_INPUT).type(KEYWORD)

    // Click search #2
    cy.get(CSS_SEARCH_ICON).click()

    // Assert search result page url #2
    cy.log('#2 Verify URL of Search results page')
    cy.url().should('eq', Cypress.config().baseUrl + '/search/' + KEYWORD)

    // Article list on the first load must have 10 articles #2
    cy.log('#2 Verify Article should NOT be loaded')
    cy.get('article').should('have.length', 0)

    // Verify heading in search result page
    cy.log('#2 Verify heading and message in search result page')
    cy.get('h1', { timeout: 6000 }).should('contain', '0 results for "' + KEYWORD + '"')

    cy.get('div')
      .contains(
        'Sorry, we were unable to find a match. Please try another keyword or explore our homepage.'
      )
      .should('be.visible')

    cy.get('div[class*="SearchPage__ScHomeButton"]')
      .first()
      .contains('Go Home')
      .should('be.visible')
      .click()

    cy.log('#3 Verify URL of homepage after clicking GO HOME')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
