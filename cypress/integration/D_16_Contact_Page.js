describe('MOMCOM_D_16_Contact_Page', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  function RANDOM_STRING() {
    var randomtext = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

    for (var i = 0; i < 10; i++)
      randomtext += possible.charAt(Math.floor(Math.random() * possible.length))

    return randomtext
  }

  const XPATH_FOOTER_CONTACT = '//a[@href="/contact"]'
  const SELECT_A_CONTACT = '//select[@name="contactCategory"]'
  const SUBJECT_FIELD = '//input[@name="subject"]'
  const NAME_FIELD = '//input[@name="fullName"]'
  const EMAIL_FIELD = '//input[@name="email"]'
  const PHONE_FIELD = '//input[@name="phone"]'
  const COMMENT_SECTION = '//textarea[@name="question"]'
  const SUBMIT_BUTTON = '//button[@type="submit"]'

  const faker = require('faker')

  //This part will generate the Data randomly
  const randomString = RANDOM_STRING() //This will generate random strings for  10 characters
  const randomName = faker.name.firstName() //This will randomly generate people first name
  const randomSurname = faker.name.lastName() //This will randomely generate people last name
  const randomSentence = faker.lorem.sentences(2) //This will randomly generate 2 sentences from Lorem
  const randomEmail = faker.internet.email() //This will randomly generate email address with the correct format
  const randomPhoneNumber = faker.phone.phoneNumberFormat() //This will randomly generate 10 digits phone number
  const randomParagraph = faker.lorem.paragraphs(3) //This will randomly generate 3 Paragraphs

  const CONTACT_LIST = [
    'General Inquiry',
    'Editorial',
    'Technical Support',
    'Careers',
    'Business, Partnerships & Advertising',
    'Press',
    'Rights & Licensing',
  ]

  //Sections below are created for making a function to group up the repeated scripts
  Cypress.Commands.add('VALID_SUBJECT', () => {
    cy.xpath(SUBJECT_FIELD)
      .click({ force: true })
      .type('[TEST] >> ' + randomSentence) //This will input sentences in Subject field randomly
  })

  Cypress.Commands.add('VALID_NAME', () => {
    cy.xpath(NAME_FIELD)
      .click({ force: true })
      .type(randomName + ' ' + randomSurname)
  })

  Cypress.Commands.add('VALID_EMAIL', () => {
    cy.xpath(EMAIL_FIELD).click({ force: true }).clear().type(randomEmail) //This will input email randomly

    //This will verify the Help Text <div> under email field should not exist in DOM
    cy.xpath(EMAIL_FIELD).parent().find('div').should('not.exist')
  })

  Cypress.Commands.add('VALID_PHONE_NUMBER', () => {
    cy.xpath(PHONE_FIELD).click({ force: true }).type(randomPhoneNumber)
  })

  Cypress.Commands.add('VALID_COMMENTS', () => {
    cy.xpath(COMMENT_SECTION).click({ force: true }).type(randomParagraph)
  })

  it('Verify the contact page', () => {
    cy.log('# Navigate to Contact page from Homepage')
    cy.window().scrollTo('bottom')
    cy.xpath(XPATH_FOOTER_CONTACT)
      .invoke('attr', 'href')
      .then((href) => {
        cy.xpath(XPATH_FOOTER_CONTACT).click()
        cy.url().should('eq', Cypress.config().baseUrl + href)
        cy.get('h1').invoke('text').should('eq', 'Contact Us')
      })

    cy.log('# Verify the Select a contact field')
    cy.xpath(SELECT_A_CONTACT + '/ option').each(($li, index) => {
      cy.wrap($li)
        .invoke('text')
        .then((text) => {
          cy.wrap(text).should('eq', CONTACT_LIST[index])
          cy.wrap($li)
            .invoke('attr', 'value')
            .then((value) => {
              cy.window().scrollTo('top')
              cy.xpath(SELECT_A_CONTACT).select(text).should('have.value', value)
            })
        })
    })

    cy.log('# Verify HELP Text under the Subject field')
    cy.xpath(SUBJECT_FIELD).click({ force: true })
    cy.get('h1').click()
    cy.xpath(SUBJECT_FIELD)
      .parent()
      .find('div')
      .invoke('text')
      .should('eq', 'Please include a subject.')

    //EMAIL FIELD
    cy.log('# Verify HELP Text under the E-mail field')
    cy.xpath(EMAIL_FIELD).click({ force: true })
    cy.get('h1').click()
    cy.xpath(EMAIL_FIELD)
      .parent()
      .find('div')
      .invoke('text')
      .should('eq', 'Please enter a valid e-mail address.')

    cy.log('# Verify enter INVALID email in the email field')
    cy.xpath(EMAIL_FIELD).click({ force: true }).type(randomString)

    cy.get('div', { timeout: 7000 }).then(($div) => {
      // If there is consent pop then, it will click on GOT IT!
      if ($div.hasClass('pf-widget-container')) {
        cy.get('button[value="Cancel"]').click()
      }
    })

    cy.wait(1000)
    cy.xpath(EMAIL_FIELD)
      .parent()
      .find('div')
      .invoke('text')
      .should('eq', 'Please enter a valid e-mail address.')

    //Phone Field
    cy.log('# Verify enter string on Phone field')
    cy.xpath(PHONE_FIELD).click({ force: true }).type(randomString)

    cy.xpath(PHONE_FIELD).invoke('attr', 'value').should('be.empty')

    //Comment field
    cy.log('# Verify Help Text under Comments field')
    cy.xpath(COMMENT_SECTION).click({ force: true })
    cy.get('h1').click()
    cy.xpath(COMMENT_SECTION)
      .parent()
      .find('div')
      .invoke('text')
      .should('eq', 'Please enter your comments or questions.')

    cy.log('# Verify that it should not allow to submit if required field still remain')
    cy.log('# Leave Subject field as blank')
    cy.reload()
    cy.xpath(SUBJECT_FIELD).click({ force: true })
    cy.get('h1').click()

    cy.VALID_NAME()
    cy.VALID_EMAIL()
    cy.VALID_COMMENTS()
    cy.xpath(SUBMIT_BUTTON).should('be.disabled')

    cy.log('# Leave Email field as blank')
    cy.reload()
    cy.VALID_SUBJECT()
    cy.VALID_NAME()

    cy.xpath(EMAIL_FIELD).click({ force: true })
    cy.get('h1').click()

    cy.VALID_COMMENTS()
    cy.xpath(SUBMIT_BUTTON).should('be.disabled')

    cy.log('# Leave Comments field as blank')
    cy.reload()
    cy.VALID_SUBJECT()
    cy.VALID_NAME()
    cy.VALID_EMAIL()

    cy.xpath(COMMENT_SECTION).click({ force: true })
    cy.get('h1').click()
    cy.xpath(SUBMIT_BUTTON).should('be.disabled')

    cy.log('# Valid case with all fields are input')
    cy.reload()
    cy.VALID_SUBJECT()
    cy.VALID_NAME()
    cy.VALID_EMAIL()
    cy.VALID_PHONE_NUMBER()
    cy.VALID_COMMENTS()

    cy.xpath(SUBMIT_BUTTON).should('be.enabled').click({ force: true })

    cy.get('h2[class*="ContactUsSubmitResult__ScThankyouHeader"]')
      .invoke('text')
      .should('equal', 'Thanks for reaching out!')
    cy.get('p[class*="ContactUsSubmitResult__ScThankyouContent"]')
      .invoke('text')
      .should(
        'eq',
        "Your message has been successfully submitted. We'll review your email and get back to you shortly."
      )
  })
})
