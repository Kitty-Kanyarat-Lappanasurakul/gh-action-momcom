describe('MOMCOM_D_11_FB_Share_Button', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  const ARTICLE_URL = '/entertainment/tori-roloff-second-child-guilt'
  const CATEGORY_REQUEST_URL = 'entertainment'
  const ARTICLE_REQUEST_URL = 'tori-roloff-second-child-guilt'

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify FB share button', () => {
    const XPATH_FB_SHARE_BUTTON = '(//footer//button)[1]'
    let facebookURL

    cy.log('Verify URL of article')
    cy.visit(Cypress.config().baseUrl + ARTICLE_URL)
    cy.url().should('eq', Cypress.config().baseUrl + ARTICLE_URL)

    cy.log('#2 Scroll down to FB share button and verify a facebook button displays')
    cy.xpath(XPATH_FB_SHARE_BUTTON)
      .scrollIntoView()
      .should('be.visible')

    // Declare function to get url that send to window.open
    const winSetLocationHrefStub = url => {
      facebookURL = url
    }
    cy.log(
      '#3 Verify a new window should open(as a pop-up) with a correct url after clicking FB share button'
    )

    // Stub to verify the method "open" is called for window (window.open)
    // window.open will take the user to a new window as a pop-up
    cy.window().then(win => {
      cy.stub(win, 'open', winSetLocationHrefStub).as('winPromptStubReturnNonNull')
    })

    // Click on FB share button
    cy.xpath(XPATH_FB_SHARE_BUTTON).click()

    // Verify the stub above is called after clicking on FB share button
    cy.get('@winPromptStubReturnNonNull')
      .should('be.calledOnce')
      .then(() => {
        cy.wrap(facebookURL).should(
          'contain',
          'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fmom.com%2F' +
            CATEGORY_REQUEST_URL +
            '%2F' +
            ARTICLE_REQUEST_URL
        )
        cy.log('Result >> FB URL is correct after clicking FB share button')
      })
  })
})
