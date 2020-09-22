describe('MOMCOM_D_17_Footer_Social_Icons', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify All social icon is able to acess to the site properly', () => {
    const XPATH_FOOTER_FB = '//a[@aria-label="Facebook"]'
    const XPATH_FOOTER_TWITTER = '//a[@aria-label="Twitter"]'
    const XPATH_FOOTER_PINTEREST = '//a[@aria-label="Pinterest"]'
    const XPATH_FOOTER_IG = '//a[@aria-label="Instagram"]'
    const XPATH_FOOTER_YOUTUBE = '//a[@aria-label="Youtube"]'

    const LINKS_ARRAY = [
      XPATH_FOOTER_FB,
      XPATH_FOOTER_TWITTER,
      XPATH_FOOTER_PINTEREST,
      XPATH_FOOTER_IG,
      XPATH_FOOTER_YOUTUBE,
    ]

    const TEXT_ARRAY = ['Facebook', 'Twitter', 'Pinterest', 'Instragram', 'Youtube']

    const URL_ARRAY = [
      'https://www.facebook.com/momdotcomofficial',
      'https://twitter.com/Momdotcom',
      'https://www.pinterest.com/momdotcomofficial/',
      'https://www.instagram.com/momdotcom/',
      'https://www.youtube.com/channel/UC030WRHQCV3ZG5GZdjUCRbw',
    ]

    cy.log('-Scroll down to a footer section and check all links')
    cy.xpath(XPATH_FOOTER_FB).scrollIntoView()

    cy.log('wait for email subscription modal loading')
    cy.get('div', { timeout: 7000 }).then($div => {
      // If there is email subscription modal, it should be closed. We do not need to verify it.
      if ($div.hasClass('pf-widget-content')) {
        cy.xpath('//button[@value="Cancel"]').click({ force: true })
      }
    })

    // Loop for step #2 to #6
    for (let i = 0; i < LINKS_ARRAY.length; i++) {
      cy.log('#' + (i + 1) + ' Verify ' + TEXT_ARRAY[i] + ' icon link')
      cy.xpath(LINKS_ARRAY[i])
        .invoke('attr', 'href')
        .then(hrefValue => {
          cy.log('-Verify URL is correct as expected')
          cy.wrap(hrefValue).should('eq', URL_ARRAY[i])
          cy.log('-Verify open new tab by *target=_blank* checking')
          cy.xpath(LINKS_ARRAY[i]).should('have.attr', 'target', '_blank')
          cy.log('-Verify request URL successfully')
          cy.request(hrefValue)
          cy.log('---------------------------------------------------')
        })
    }
  })
})
