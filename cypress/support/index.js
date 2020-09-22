// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// Alternatively you can use CommonJS syntax:
// require('./commands')
import './commands'
import 'cypress-xpath'

const addContext = require('mochawesome/addContext')

Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    const screenshotFileName = `${runnable.parent.title} -- ${test.title} (failed).png`
    addContext({ test }, `assets/${Cypress.spec.name}/${screenshotFileName}`)
  }
})

// Prevent error originated from our application code, not from Cypress.
Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})

Cypress.Commands.add('visitSite', () => {
  Cypress.config('viewportWidth')
  Cypress.config('viewportHeight')

  const CSS_PRIVACY_MODAL = 'div[class="ot-sdk-row banner-group"]'
  const CSS_GOT_IT_BUTTON = 'button[id="onetrust-accept-btn-handler"]'

  // visit MOMCOM Site #1
  cy.log('#1 Go to mom.com Site')
  cy.visit('/')

  cy.get('div', { timeout: 7000 }).then(($div) => {
    // If there is consent pop then, it will click on GOT IT!
    if ($div.hasClass('ot-sdk-row banner-group')) {
      cy.get(CSS_GOT_IT_BUTTON).click()
      cy.get(CSS_PRIVACY_MODAL).should('not.be.visible')
    }
  })
})

Cypress.Commands.add('visitSiteOnMobile', () => {
  cy.viewport('iphone-6+')

  const CSS_PRIVACY_MODAL = 'div[class="ot-sdk-row banner-group"]'
  const CSS_GOT_IT_BUTTON = 'button[id="onetrust-accept-btn-handler"]'

  // visit MOM.COM #1
  cy.log('#1 Go to MOM.COM')
  cy.visit('/')

  cy.get('div', { timeout: 7000 }).then(($div) => {
    // If there is consent pop then, it will click on GOT IT!
    if ($div.hasClass('ot-sdk-row banner-group')) {
      cy.get(CSS_GOT_IT_BUTTON).click({ force: true })
      cy.get(CSS_PRIVACY_MODAL).should('not.be.visible')
    }
  })
})
