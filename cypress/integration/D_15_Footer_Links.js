describe('MOMCOM_D_15_Footer_Links', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify All company related links on the Footer', () => {
    const XPATH_FOOTER_ABOUT = '//a[@href="/about"]'
    const XPATH_FOOTER_TERMS = '//a[@href="https://www.wildskymedia.com/terms-of-service/"]'
    const XPATH_FOOTER_PRIVACY = '//a[@href="https://www.wildskymedia.com/privacy-policy/"]'
    const XPATH_FOOTER_CONTACT = '//a[@href="/contact"]'
    const XPATH_FOOTER_ADVERTISING = '//a[@href="mailto:sales@wildskymedia.com"]'

    const XPATH_FOOTER_MOMCOM = '//a[@href="https://mom.com"]'
    const XPATH_FOOTER_CAFEMOM = '//a[@href="https://www.cafemom.com/"]'
    const XPATH_FOOTER_ML = '//a[@href="https://www.mamaslatinas.com/"]'
    const XPATH_FOOTER_BABYNAME = '//a[@href="http://www.babynamewizard.com/"]'
    const XPATH_FOOTER_LT = '//a[@href="https://www.littlethings.com/"]'
    const XPATH_FOOTER_REVELIST = '//a[@href="https://www.revelist.com/"]'

    const LINKS_ARRAY = [
      XPATH_FOOTER_TERMS,
      XPATH_FOOTER_PRIVACY,
      XPATH_FOOTER_CONTACT,
      XPATH_FOOTER_ADVERTISING,
      XPATH_FOOTER_MOMCOM,
      XPATH_FOOTER_CAFEMOM,
      XPATH_FOOTER_ML,
      XPATH_FOOTER_BABYNAME,
      XPATH_FOOTER_LT,
      XPATH_FOOTER_REVELIST,
    ]

    const TEXT_ARRAY = [
      'TERMS',
      'PRIVACY',
      'CONTACT',
      'ADVERTISING',
      'MOM.COM',
      'CAFEMOM',
      'MAMÁSLATINAS',
      'BABY NAME WIZARD',
      'LITTLETHINGS',
      'REVELIST',
    ]

    cy.log('#2 Scroll down to a footer section and check all company related links')
    cy.xpath(XPATH_FOOTER_ABOUT)
      .contains('ABOUT')
      .scrollIntoView()

    cy.xpath(XPATH_FOOTER_ABOUT)
      .invoke('attr', 'href')
      .then(hrefValue => {
        cy.log('#3 Click About link')
        cy.xpath(XPATH_FOOTER_ABOUT)
          .contains('ABOUT')
          .click()
        cy.url().should('eq', Cypress.config().baseUrl + hrefValue)
      })

    cy.log('-Back to a homepage properly after clicking back button')
    cy.go('back')
    cy.reload()
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    cy.log('Scroll down to a footer section and check all company related links')
    cy.xpath(XPATH_FOOTER_ABOUT)
      .contains('ABOUT')
      .scrollIntoView()
    cy.log('wait for email subscription modal loading')
    cy.get('div', { timeout: 7000 }).then($div => {
      // If there is email subscription modal, it should be closed. We do not need to verify it.
      if ($div.hasClass('pf-widget-content')) {
        cy.xpath('//button[@value="Cancel"]').click({ force: true })
      }
    })

    // Loop for step #4 to #13
    for (let i = 0; i < LINKS_ARRAY.length; i++) {
      cy.log('#' + (i + 4) + ' Verify ' + TEXT_ARRAY[i] + ' link')
      cy.xpath(LINKS_ARRAY[i])
        .invoke('attr', 'href')
        .then(hrefValue => {
          // Skip verify target=_blank for mailto:
          if (i != 2 && i != 3) {
            cy.log('-Verify open new tab by *target=_blank* checking')
            cy.xpath(LINKS_ARRAY[i]).should('have.attr', 'target', '_blank')
            cy.log('-Verify request URL successfully')

            cy.request(hrefValue, { timeout: 7000 })
            cy.request('https://www.cafemom.com')
          }

          cy.log('-Verify the link contains text and displays correctly')
          cy.xpath(LINKS_ARRAY[i])
            .contains(TEXT_ARRAY[i])
            .should('be.visible')
          cy.log('---------------------------------------------------')
        })
    }
  })
})
