describe('MOMCOM_D_07_Article_Video', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  const articleURL = '/entertainment/cate-blanchett-bernadette-movie'

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify video article page working properly', () => {
    const XPATH_DISPLAYED_CATEGORY = '(//article//a)[1]'
    const XPATH_DATE = '(//article//header//span)[1]'
    const XPATH_AUTHOR_IMG_LINK = '(//article//header//a[contains(@href,"author")])[last()]'

    const CSS_PLAY_VIDEO_BUTTON = 'div[class="jw-icon jw-icon-display jw-button-color jw-reset"]'
    const CSS_VIDEO_TIMER = 'div[class="jw-icon jw-icon-inline jw-text jw-reset jw-text-elapsed"]'
    const CSS_PAUSE_VIDEO_BUTTON = 'div[class="jw-icon jw-icon-display jw-button-color jw-reset"]'

    let startTime
    let pauseTime

    cy.log('Verify URL of video page')
    cy.visit(Cypress.config().baseUrl + articleURL)
    cy.url().should('eq', Cypress.config().baseUrl + articleURL)

    cy.log('Verify Category appear centered at the top of the page')
    cy.xpath(XPATH_DISPLAYED_CATEGORY).should('be.visible')

    cy.log('Verify Title is centered at the top of the page under the Category')
    cy.get('h1')
      .eq(0)
      .should('be.visible')

    cy.log('Verify Published/Updated date appears underneath the title')
    cy.xpath(XPATH_DATE).should('be.visible')

    cy.log('Verify Author name appears underneath the title')
    cy.xpath(XPATH_AUTHOR_IMG_LINK).should('be.visible')

    cy.log('Verify JW player at the featured image position appear underneath the author')
    cy.get('video')
      .eq(0)
      .should('be.visible')

    cy.log('Verify the play video button should display before clicking on it')
    cy.get(CSS_PLAY_VIDEO_BUTTON).should('be.visible')

    // Get time from the video before clicking on the play button
    cy.get(CSS_VIDEO_TIMER)
      .invoke('text')
      .then(time => {
        startTime = time
      })

    cy.log('#2 Click on the play video button')
    cy.get(CSS_PLAY_VIDEO_BUTTON).click()

    cy.log('Verify the play button should NOT appear after clicking on it')
    cy.get(CSS_PLAY_VIDEO_BUTTON).should('not.be.visible')

    cy.wait(5000)
    cy.get(CSS_VIDEO_TIMER)
      .invoke('text')
      .then(time => {
        cy.log('Verify the current time of video should NOT be equal to the start time')
        cy.wrap(time).should('not.eq', startTime)
      })

    cy.log('#3 Click on the pause video button')
    cy.get(CSS_PAUSE_VIDEO_BUTTON)
      .click({
        force: true,
      })
      .then(() => {
        // Get time from the video after clicking on the pause button
        cy.get(CSS_VIDEO_TIMER)
          .invoke('text')
          .then(time => {
            pauseTime = time
          })

        cy.wait(3000)
        cy.get(CSS_VIDEO_TIMER)
          .invoke('text')
          .then(time => {
            cy.log('Verify the time is NOT changed after clicking the pause button')
            cy.wrap(time).should('eq', pauseTime)
          })
      })
  })
})
