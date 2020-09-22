describe('MOMCOM_M_01_Homepage', () => {
  beforeEach(() => {
    cy.visitSiteOnMobile()
  })

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify MOM.COM site is accesible including its logo and main module', () => {
    const XPATH_GETTING_PREGNANT_LINK = '//nav[1]//a[@href="/getting-pregnant"]'

    const XPATH_LOGO_IMG = '//img[@src="/static/media/logo-momcom.faee38e5.svg"]'
    const XPATH_LOGO_LINK = '(//nav//a)[1]'

    const XPATH_FEATURED_POST_IMG_LINK =
      '//div/div[1]/div[2]/div[1]/div/div[1]/div[1]/div/div/div[1]/a'
    const XPATH_PARENT_TOPIC = '//a[normalize-space()="PARENTING"]'
    const XPATH_HAPPY_TOPIC = '//a[normalize-space()="HAPPY, KIND, AND CONFIDENT"]'

    const XPATH_HAMBURGER_BUTTON = '(//button)[1]'

    // Declare an array for testing steps #2 to #4 loop
    const XPATH_ARRAY = [
      XPATH_GETTING_PREGNANT_LINK,
      XPATH_FEATURED_POST_IMG_LINK,
      XPATH_PARENT_TOPIC,
    ]

    // Declare an array for testing steps logs
    const LOG_ARRAY = ['Getting Pregnant', 'Featured post', 'Parenting topic ']

    let tagNameEncode

    cy.log('click on the hamburger menu')
    cy.xpath(XPATH_HAMBURGER_BUTTON).click()

    // Loop for testing step #2 to #4
    for (let i = 0; i < XPATH_ARRAY.length; i++) {
      cy.log('#' + (i + 2) + ' Click on ' + LOG_ARRAY[i] + ' and verify URL')
      // Get URL of element and click on it
      cy.xpath(XPATH_ARRAY[i])
        .focus()
        .invoke('attr', 'href')
        .then(hrefValue => {
          cy.log(LOG_ARRAY[i] + ' URL >>> ', hrefValue)
          cy.xpath(XPATH_ARRAY[i]).click()
          cy.url().should('eq', Cypress.config().baseUrl + hrefValue)
        })
        .then(() => {
          cy.log('wait for email subscription modal loading')
          cy.get('div', { timeout: 7000 }).then($div => {
            // If there is email subscription modal, it should be closed. We do not need to verify it.
            if ($div.hasClass('pf-widget-content')) {
              cy.xpath('//button[@value="Cancel"]').click({ force: true })
            }
          })
        })

      // Click mom.com logo
      cy.log('click on mom.com logo and back to homepage')
      cy.xpath(XPATH_LOGO_IMG).should('be.visible')
      cy.xpath(XPATH_LOGO_LINK).click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    }

    // Click on Happy, Kind, and Confident topic
    cy.log('wait for email subscription modal loading')
    cy.get('div', { timeout: 7000 }).then($div => {
      // If there is email subscription modal, it should be closed. We do not need to verify it.
      if ($div.hasClass('pf-widget-content')) {
        cy.xpath('//button[@value="Cancel"]').click({ force: true })
      }
    })
    cy.log('#5 Click on Happy, Kind, and Confident topic and verify URL')
    cy.xpath(XPATH_HAPPY_TOPIC)
      .focus()
      .invoke('attr', 'href')
      .then(hrefValue => {
        cy.log('Happy, Kind, and Confident URL >>> ', hrefValue)
        cy.xpath(XPATH_HAPPY_TOPIC).click()
        hrefValue = hrefValue.split('/tag/')
        tagNameEncode = encodeURIComponent(hrefValue[1].trim())
        cy.url().should('eq', Cypress.config().baseUrl + '/tag/' + tagNameEncode)
      })

    // Back to homepage
    cy.log('back to homepage')
    cy.go('back').then(() => {
      // Need to reload because the URL is not changed from previous URL
      cy.reload()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })

    cy.log('#6 Click on mom.com logo in homepage and verify URL should not be changed')
    cy.xpath(XPATH_LOGO_IMG).should('be.visible')
    cy.xpath(XPATH_LOGO_LINK).click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
