describe('MOMCOM_D_10_User_Access_Site', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify the user is able to access to the site properly', () => {
    const KEYWORD = 'spaceship'

    const CSS_SEARCH_ICON = 'button[class*="sharedStyles__ScIconButton"]'
    const CSS_SEARCH_INPUT = 'input[class*="NavbarDesktop__ScForwardRefSearchBox"]'

    const XPATH_LOGO_IMG = '//img[@src="/static/media/logo-momcom.faee38e5.svg"]'
    const XPATH_LOGO_LINK = '(//nav//a)[1]'

    const XPATH_FIRST_ARTICLE_LINK = '(//article[1]//a)[1]'
    const XPATH_RECOMMENDED_SECTION_LINK = '(//aside//a)[1]'
    const XPATH_AUTHOR_IMG_LINK = '(//a[contains(@href,"author")])[1]'

    // Declare an array for testing steps #3 to #5 loop
    const XPATH_ARRAY = [
      XPATH_FIRST_ARTICLE_LINK,
      XPATH_RECOMMENDED_SECTION_LINK,
      XPATH_AUTHOR_IMG_LINK,
    ]

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

    // Declare an array for testing steps logs
    const LOG_ARRAY = ['The 1st article of search page', 'Recommended section', 'Author image']

    // Loop for testing step #3 to #5
    for (let i = 0; i < XPATH_ARRAY.length; i++) {
      cy.log('#' + (i + 3) + ' Click on ' + LOG_ARRAY[i] + ' and verify URL')
      cy.wait(3000).window().scrollTo('bottom')
      // Get URL of element and click on it
      cy.wait(2000)
        .xpath(XPATH_ARRAY[i])
        .focus()
        .invoke('attr', 'href')
        .then((hrefValue) => {
          cy.log(LOG_ARRAY[i] + ' URL >>> ', hrefValue)
          // Reload before clicking on the recommended section.
          if (i == 1) {
            cy.reload()
          }
          cy.xpath(XPATH_ARRAY[i]).click({ force: true })
          cy.url().should('eq', Cypress.config().baseUrl + hrefValue)
        })
    }

    cy.log('#6 Click on VIEW ALL CONTRIBUTORS link and verify URL')
    cy.wait(2000)
      .get('a')
      .contains('VIEW ALL CONTRIBUTORS')
      .invoke('attr', 'href')
      .then((hrefValue) => {
        cy.log(' URL >>> ', hrefValue)
        cy.get('a').contains('VIEW ALL CONTRIBUTORS').click({ force: true })
        cy.url().should('eq', Cypress.config().baseUrl + hrefValue)
      })

    // Need to skip step #7 from the test script because the Navigation bar is hidden occasionally. If we do not skip this step, the test script will not be stable.
    // cy.log('#7 Click on mom.com logo and verify URL of homepage')
    // cy.xpath(XPATH_LOGO_IMG, { timeout: 3000 }).should('be.visible')
    // cy.xpath(XPATH_LOGO_LINK).click({ force: true })
    // cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
