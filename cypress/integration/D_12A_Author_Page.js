describe('MOMCOM_D_12A_Author_Page', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  const ARTICLE_URL = '/momlife/letter-from-the-editor-the-greatness-of-girls'

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify Author and Contributors page', () => {
    const XPATH_AUTHOR_NAME_LINK = '(//a[contains(@href,"/author/")])[2]'
    const XPATH_AUTHOR_CONTRIBUTOR_PAGE = '(//div[contains(@class,"font-small-body")][2]//a)[2]'
    const CSS_AUTHORS = 'div[class*="font-small-body"]'
    const XPATH_IG_ICON = '//a[contains(@aria-label,"InstagramCircle")]'

    const XPATH_ARRAY = [XPATH_AUTHOR_NAME_LINK, XPATH_AUTHOR_CONTRIBUTOR_PAGE]

    const LOG_ARRAY = ['in article page', 'in contributors page']

    let authorSlug
    let authorPostsTotal
    let authorId

    let totalAuthor

    let instagramURL

    let requestDate = new Date().toISOString()

    cy.log('Verify URL of article')
    cy.visit(Cypress.config().baseUrl + ARTICLE_URL)
    cy.url().should('eq', Cypress.config().baseUrl + ARTICLE_URL)

    // Loop for clicking on author and verifying the first load in author page
    // Step #2 to #4 when i=0
    // Step #5 to #6 when i=1
    for (let i = 0; i < XPATH_ARRAY.length; i++) {
      cy.log('Click on the author ' + LOG_ARRAY[i])
      cy.xpath(XPATH_ARRAY[i])
        .invoke('attr', 'href')
        .then((hrefValue) => {
          cy.log(' URL >>> ', hrefValue)
          authorSlug = hrefValue.split('/author/')
          cy.xpath(XPATH_ARRAY[i]).click({ force: true })
          cy.log('-Verify url of author')
          cy.url().should('eq', Cypress.config().baseUrl + hrefValue)
          cy.log(authorSlug[1])
        })
        .then(() => {
          // Get the author ID
          cy.request(
            'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{authorCollection(where:{slug:"' +
              authorSlug[1] +
              '"}){items{sys{id},instagramUrl,linkedFrom{postCollection{total}}}}}'
          ).then((response) => {
            authorId = response.body.data.authorCollection.items[0].sys.id
            instagramURL = response.body.data.authorCollection.items[0].instagramUrl
            cy.log('Author ID ' + authorId)
            cy.log('Author instagramURL ' + instagramURL)
          })
        })
        .then(() => {
          // Get the total posts
          cy.request(
            'https://mom.com/api/spaces/9l3tjzgyn9gr/environments/master/entries?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&content_type=post&include=1&fields.authors.sys.id=' +
              authorId +
              '&order=-fields.publishDate&limit=10&skip=0&fields.publishDate[lte]=' +
              requestDate
          ).then((response) => {
            // authorPostsTotal =
            //   response.body.data.authorCollection.items[0].linkedFrom.postCollection.total
            // instagramURL = response.body.data.authorCollection.items[0].instagramUrl
            cy.log('authorPostTotal restAPI: ' + response.body.total)
            authorPostsTotal = response.body.total

            cy.wait(5000)
            cy.log('-Verify the first load of author page')
            if (authorPostsTotal < 10) {
              cy.get('article').should('have.length', authorPostsTotal)
            } else {
              cy.get('article').should('have.length', 10)
            }
          })
        })
        .then(() => {
          // Step #3 Check social icon and #4 Click View All Contributors.
          // For steps #5, back to the loop i=1
          if (i === 0) {
            cy.log('-Verify the instagram icon (if available)')
            if (instagramURL != null) {
              cy.log(instagramURL)
              cy.xpath(XPATH_IG_ICON)
                .invoke('attr', 'href')
                .then((hrefValue) => {
                  cy.log('-Verify Request the IG successfully')
                  cy.wrap(hrefValue).should('eq', instagramURL)
                  cy.request(hrefValue)
                })
              cy.log('-Verify open new tab when clicking on the IG icon')
              cy.xpath(XPATH_IG_ICON).should('have.attr', 'target', '_blank')
            }

            cy.log('Click on VIEW ALL CONTRIBUTORS')
            cy.get('a')
              .contains('VIEW ALL CONTRIBUTORS')
              .invoke('attr', 'href')
              .then((hrefValue) => {
                cy.log(' URL >>> ', hrefValue)
                cy.get('a').contains('VIEW ALL CONTRIBUTORS').click()
                cy.log('-Verify url of contributors page')
                cy.url().should('eq', Cypress.config().baseUrl + hrefValue)
              })

            // Get the total of Author Index Page module
            cy.request(
              'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr/?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{authorIndexPageCollection{items{featureAuthorsCollection{total}}}}'
            ).then((response) => {
              totalAuthor =
                response.body.data.authorIndexPageCollection.items[0].featureAuthorsCollection.total

              cy.log('Total of Author Index Page >> ' + totalAuthor)

              // Calculate the fisrt load for contributors page
              totalAuthor = (Math.floor(totalAuthor / 6) + 1) * 6

              cy.log('Total of First Load >> ' + totalAuthor)

              cy.log('-Verify the first load of contributors page')
              cy.wait(3000).get(CSS_AUTHORS).should('have.length', totalAuthor)

              cy.log('-Verify the authors profile display on the first load')
              cy.get(CSS_AUTHORS).each(($el) => {
                cy.wrap($el).find('img').should('be.visible')
                cy.wrap($el).find('h3').should('be.visible')
              })

              // Verify the author image
              let authorImgCheck
              let authorImgURL
              cy.log(
                '-Verify the author image displays properly for the top authors in the contributor page'
              )
              for (let i = 1; i <= totalAuthor; i++) {
                cy.xpath('(//div[contains(@class,"font-small-body")][' + i + ']//a)[2]')
                  .invoke('attr', 'href')
                  .then((hrefValue) => {
                    cy.log(' URL >>> ', hrefValue)
                    authorSlug = hrefValue.split('/author/')
                    cy.log(authorSlug[1])
                  })
                  .then(() => {
                    // Get image url of author
                    cy.request(
                      'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{authorCollection(where:{slug:"' +
                        authorSlug[1] +
                        '"}){items{image{url}}}}'
                    ).then((response) => {
                      authorImgCheck = response.body.data.authorCollection.items[0].image
                      // If there is the author image, the author image should match the author url in contentful
                      if (authorImgCheck != null) {
                        authorImgURL = (
                          '' + response.body.data.authorCollection.items[0].image.url
                        ).split('https:')

                        cy.log(authorImgURL[1])
                        cy.log('-Verify author image #' + i)
                        cy.xpath('(//div[contains(@class,"font-small-body")][' + i + ']//img)')
                          .invoke('attr', 'src')
                          .then((hrefValue) => {
                            cy.log(' IMG URL >>> ', hrefValue)
                            cy.wrap(hrefValue).should('contain', authorImgURL[1])
                          })
                        // If there is no author image, the default author image should display
                      } else if (authorImgCheck === null) {
                        cy.log('-Verify author image #' + i)
                        cy.xpath('(//div[contains(@class,"font-small-body")][' + i + ']//img)')
                          .invoke('attr', 'src')
                          .then((hrefValue) => {
                            cy.log(' IMG URL >>> ', hrefValue)
                            cy.wrap(hrefValue).should(
                              'contain',
                              '/static/media/icon-author-placeholder.ac0b1375.svg'
                            )
                          })
                      }
                    })
                  })
              }
              //end loop "verify author image"
            })
          }

          // Step #6 Click back to a contributors page
          if (i === 1) {
            cy.log('Back to the contributors page and verify url')
            cy.go('back')
            // Need to reload because the URL is not changed from previous URL
            cy.reload()
            cy.url().should('eq', Cypress.config().baseUrl + '/author')
          }
        })
    }
  })
})
