describe('MOMCOM_D_01_Homepage', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify MOM.COM site is accesible including its logo and main module', () => {
    const XPATH_GETTING_PREGNANT_LINK = '(//ul)[1]/li[1]/a'
    const XPATH_GETTING_PREGNANT_SELECT = 'header > nav > div > div > ul > li:nth-child(1) > a'

    const XPATH_LOGO_IMG = '//img[@src="/static/media/logo-momcom.faee38e5.svg"]'
    const XPATH_LOGO_LINK = '(//nav//a)[1]'

    const XPATH_FEATURED_POST_IMG_LINK =
      '//div/div[1]/div[2]/div[1]/div/div[1]/div[1]/div/div/div[1]/a'
    const XPATH_FEATURED_SELECT =
      '#root > div > div > div > div:nth-child(1) > div > div > div > div > div > div > a'

    const XPATH_PARENT_SEE_MORE_BTN = '//div/div[1]/div[2]/div[1]/div/div[2]/div[2]/div[2]/a'
    const XPATH_PARENT_SEE_MORE_SELECT =
      '#root > div > div > div > div:nth-child(1) > div > div > div:nth-child(2) > div > a'

    const XPATH_MOM_LIFE_SEE_MORE_BTN = '//div/div[1]/div[2]/div[5]/div/div[2]/div[2]/a'
    const XPATH_MOM_LIFE_SEE_MORE_SELECT =
      '#root > div > div > div > div:nth-child(5) > div > div:nth-child(2) > div > a'

    // Declare an array for testing steps #2 to #4 loop
    const XPATH_ARRAY = [
      XPATH_GETTING_PREGNANT_LINK,
      XPATH_FEATURED_POST_IMG_LINK,
      XPATH_PARENT_SEE_MORE_BTN,
    ]

    let XPATH_ARRAY_SELECT = [
      XPATH_GETTING_PREGNANT_SELECT,
      XPATH_FEATURED_SELECT,
      XPATH_PARENT_SEE_MORE_SELECT,
      XPATH_MOM_LIFE_SEE_MORE_SELECT,
    ]

    // Declare an array for testing steps logs
    const LOG_ARRAY = [
      'Getting Pregnant',
      'Featured post',
      'SEE MORE parenting',
      'SEE MORE Mom life',
    ]

    //This loop is for checking that each element in the XPATH_ARRAY_SELECT is existed or not. If it does not existed, then that element in the XPATH_ARRAY will be removed from the list
    for (let a = 0; a < XPATH_ARRAY.length; a++) {
      const existent = Cypress.$(XPATH_ARRAY_SELECT[a])
      if (existent.length) {
        //If it found the element it will be here
        cy.log('found')
      } else {
        //If it does not found it will be here
        cy.log('not found')
        XPATH_ARRAY = XPATH_ARRAY.filter(item => item !== XPATH_ARRAY[a])
      }
    }

    // Loop for testing step #2 to #4
    for (let i = 0; i < XPATH_ARRAY.length; i++) {
      cy.log('#' + (i + 2) + ' Click on ' + LOG_ARRAY[i] + ' and verify URL')
      // Get URL of element and click on it
      cy.xpath(XPATH_ARRAY[i])
        .focus()
        .invoke('attr', 'href')
        .then(hrefValue => {
          cy.log(LOG_ARRAY[i] + ' URL >>> ', hrefValue)

          cy.xpath(XPATH_ARRAY[i]).then($ele => {
            cy.log($ele[0])
            if ($ele[0].hasAttribute('target', '_blank')) {
              cy.log('Come over here')
              cy.xpath(XPATH_ARRAY[i])
                .invoke('attr', 'href')
                .then(href => {
                  cy.request(href).should(response => {
                    expect(response.status).to.eq(200)
                  })
                })
            } else {
              cy.log('This does not have target __Blank')
              cy.xpath(XPATH_ARRAY[i]).click({ force: true })
              cy.url().should('eq', Cypress.config().baseUrl + encodeURI(hrefValue))
            }
          })
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
      cy.wait(5000)
      cy.xpath(XPATH_LOGO_IMG).should('be.visible')
      cy.xpath(XPATH_LOGO_LINK).click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    }

    // Click on see more momlife
    cy.log('#5 Click on SEE MORE momlife and verify URL')
    cy.xpath(XPATH_MOM_LIFE_SEE_MORE_BTN)
      .focus()
      .invoke('attr', 'href')
      .then(hrefValue => {
        cy.log('SEE MORE momlife URL >>> ', hrefValue)
        cy.xpath(XPATH_MOM_LIFE_SEE_MORE_BTN).click()
        cy.url().should('eq', Cypress.config().baseUrl + hrefValue)
      })

    // Back to homepage
    cy.log('back to homepage')
    cy.go('back').then(() => {
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      // Need to reload because the URL is not changed from previous URL
      cy.reload()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  })
})
