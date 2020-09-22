describe('MOMCOM_D_09_Article_Series', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  const ARTICLE_URL = '/baby/12218-late-vs-early-teething'
  const ARTICLE_REQUEST_URL = '12218-late-vs-early-teething'

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify series article page working properly', () => {
    const XPATH_LOGO_IN_ARTICLE = '//article/div[1]/div/img'
    const XPATH_SERIES_ARTICLE_01_IMG = '(//article)[2]//img'
    const XPATH_SERIES_ARTICLE_01_TITLE = '(//article)[2]//h3'
    const XPATH_SERIES_ARTICLE_01_LINK = '((//article)[2]//a)[1]'

    const XPATH_SERIES_ARTICLE_02_IMG = '(//article)[3]//img'
    const XPATH_SERIES_ARTICLE_02_TITLE = '(//article)[3]//h3'
    const XPATH_SERIES_ARTICLE_02_LINK = '((//article)[3]//a)[1]'

    // const XPATH_SEE_SERIES_BUTTON = '(//a[contains(@href,"/series/")])[last()]'
    const XPATH_LOGO_SERIES_PAGE = '(//img)[14]'

    let seriesLink01 = []
    let seriesLink02 = []

    let logoChecking = 0

    // Declare to store the series of recent article tab in browser
    let seriesPost

    // These variable values will be changed every loop
    let requestURL = []

    let seriesTitle
    let seriesSlug
    let seriesSponsoredBy
    let logoURLCheck
    let logoURL

    let seriesTitleToStr
    let seriesTitleToUpperCase
    let seriesSlugToStr

    cy.log('-Verify URL of series article')
    cy.visit(Cypress.config().baseUrl + ARTICLE_URL)
    cy.url().should('eq', Cypress.config().baseUrl + ARTICLE_URL)

    cy.log('-Verify Title is centered at the top of the page under the Category')
    cy.get('h1')
      .eq(0)
      .should('be.visible')

    for (let i = 0; i < 3; i++) {
      // Get the logo URL of Sponsor(series)
      cy.wrap(requestURL).then(() => {
        if (i === 0) {
          requestURL[0] = ARTICLE_REQUEST_URL
        }
        cy.log('Request for: ' + requestURL[i])
        // Get the series details of article
        cy.request(
          'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{postCollection(where:{slug:"' +
            requestURL[i] +
            '"}){items{series{title,slug,sponsoredBy,sponsorLogo{url}}}}}'
        ).then(response => {
          logoURLCheck = response.body.data.postCollection.items[0].series.sponsorLogo

          seriesSponsoredBy = response.body.data.postCollection.items[0].series.sponsoredBy
          cy.log('(sponsoredBy:) ', seriesSponsoredBy)

          seriesTitle = response.body.data.postCollection.items[0].series.title
          cy.log('(seriesTitle:)', seriesTitle)

          seriesSlug = response.body.data.postCollection.items[0].series.slug
          cy.log('(seriesSlug:)', seriesSlug)

          // Convert seriesTitle to String
          seriesTitleToStr = JSON.stringify(seriesTitle).split('"')

          // Convert seriesSlug to String
          seriesSlugToStr = JSON.stringify(seriesSlug).split('"')

          // i=0: Step #2 check logo and #3 check the 1st article of More from sereis section
          if (i === 0) {
            // To store the series of recent article tab in browser
            seriesPost = seriesSlug

            // If there are both of Sponsor Logo and SponsoredBy in series, "In Partnership with" and logo will display
            if (logoURLCheck != null && seriesSponsoredBy != null) {
              logoURL = response.body.data.postCollection.items[0].series.sponsorLogo.url
              cy.log('#2 Scroll down to the In Partnership')
              cy.get('span')
                .contains('In Partnership with')
                .scrollIntoView()
                .should('be.visible')

              cy.xpath(XPATH_LOGO_IN_ARTICLE)
                .invoke('attr', 'src')
                .then(srcValue => {
                  cy.log(' Logo URL >>> ', srcValue)
                  cy.log('-Verify URL of Sponsor logo in the article page')
                  cy.wrap(srcValue).should('eq', logoURL)
                })

              cy.log('-Verify Sponsor logo appear beside the In Partnership text')
              cy.xpath(XPATH_LOGO_IN_ARTICLE).should('be.visible')

              // If logoChecking = 1, we will verify logo in the series page (see step #4)
              logoChecking = 1
            }

            // Show warning when Test URL does NOT contain Sponsor logo and SponsoredBy
            if (seriesSponsoredBy === null || logoURLCheck === null) {
              cy.log('___*Warning!:* Test URL does NOT contain Sponsor logo and SponsoredBy.___')
              cy.log('___And skip Step #2 Scroll down to the In Partnership.___')
            }

            cy.log('#3 Scroll down to More from this series: section')
            cy.get('p')
              .contains('More from this series:')
              .scrollIntoView()
              .should('be.visible')
              .then(() => {
                cy.log('wait for email subscription modal loading')
                cy.get('div', { timeout: 7000 }).then($div => {
                  // If there is email subscription modal, it should be closed. We do not need to verify it.
                  if ($div.hasClass('pf-widget-content')) {
                    cy.xpath('//button[@value="Cancel"]').click({ force: true })
                  }
                })
              })

            // Convert seriesTitle to UpperCase
            seriesTitleToUpperCase = seriesTitleToStr[1].toUpperCase()
            cy.log('-Verify the series name displays under More from this series text')
            cy.contains(seriesTitleToUpperCase).should('be.visible')

            cy.xpath(XPATH_SERIES_ARTICLE_01_LINK)
              .invoke('attr', 'href')
              .then(hrefValue => {
                seriesLink01 = hrefValue.split('/')
                cy.log('The __1st article__ of More from sereis: ' + seriesLink01[2])
                requestURL.push(seriesLink01[2])
              })

            cy.log('-Verify the feature image and title of series article appear properly')
            cy.xpath(XPATH_SERIES_ARTICLE_01_IMG).should('be.visible')
            cy.xpath(XPATH_SERIES_ARTICLE_01_TITLE).should('be.visible')
          }

          // i=1: Step #3 check the 1st article of More from sereis section is the same series as this article and check the 2nd article of More from sereis section
          if (i === 1) {
            cy.log('-Verify __1st article__ is the same series as this article')
            cy.wrap(seriesSlug).should('eq', seriesPost)

            cy.xpath(XPATH_SERIES_ARTICLE_02_LINK)
              .invoke('attr', 'href')
              .then(hrefValue => {
                seriesLink02 = hrefValue.split('/')
                cy.log('The __2nd article__ of More from sereis: ' + seriesLink02[2])
                requestURL.push(seriesLink02[2])
              })
            cy.log('-Verify the feature image and title of series article appear properly')
            cy.xpath(XPATH_SERIES_ARTICLE_02_IMG).should('be.visible')
            cy.xpath(XPATH_SERIES_ARTICLE_02_TITLE).should('be.visible')
          }

          // i=1: Step #3 check the 2nd article of More from sereis section is the same series as this article and #4 Click SEE THIS SERIES > button
          if (i === 2) {
            cy.log('-Verify __2nd article__ is the same series as this article')
            cy.wrap(seriesSlug).should('eq', seriesPost)

            cy.log('-Verify there is SEE THIS SERIES button in DOM')
            cy.get('div')
              .contains('SEE THIS SERIES')
              .should('exist')

            const XPATH_SEE_SERIES_BUTTON = '(//footer//a[@href="/series/' + seriesSlug + '"])[2]'

            cy.xpath(XPATH_SEE_SERIES_BUTTON)
              .invoke('attr', 'href')
              .then(hrefValue => {
                cy.log(' URL >>> ', hrefValue)
                cy.log('-Verify URL of series in SEE THIS SERIES button')
                cy.wrap(hrefValue).should('eq', '/series/' + seriesSlugToStr[1])
                cy.log('#4 Click on SEE THIS SERIES button')
                cy.xpath(XPATH_SEE_SERIES_BUTTON).click({ force: true })
                cy.log('-Verify URL of series page')
                cy.url().should('eq', Cypress.config().baseUrl + hrefValue)
              })
              .then(() => {
                // If logoChecking = 1, we will verify logo in the series page
                if (logoChecking === 1) {
                  cy.wait(3000)
                    .xpath(XPATH_LOGO_SERIES_PAGE)
                    .invoke('attr', 'src')
                    .then(srcValue => {
                      cy.log(' Logo URL >>> ', srcValue)
                      cy.log(
                        '-Verify the sponsor logo of the series appear the same as the previous series article'
                      )
                      cy.wrap(srcValue).should('eq', logoURL)
                    })
                }
              })
          }
        })
      })
    }
  })
})
