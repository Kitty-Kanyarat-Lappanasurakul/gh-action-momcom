describe('MOMCOM_D_04_Category', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  //This is Production
  const MAIN_CATE_NAV = '//div/header/nav/div/div/ul/li/a'
  const BANNER_IMAGE = '//div/div[1]/div[2]/div[1]/div[1]/div[2]/img'
  const BANNER_SECTION = '(//div/div[1]/div[2]/div[1]/div[1])[1]'
  const ENVIRONMENT = 'master'

  it('Verify Main Categories on Navigation bar is navigated and display banner image correctly', () => {
    let SRC_BANNER_IMAGE

    cy.log('Count the items in Nav bar')
    cy.xpath(MAIN_CATE_NAV, { timeout: 5000 })
      .its('length')
      .then(cateNavNum => {
        //Do space in the log
        cy.log('')
        for (let c = 0; c < cateNavNum; c++) {
          cy.log('')
          cy.log('Prevent the Subscription mail and You Might Like popup')
          cy.get('div', { timeout: 7000 }).then($div => {
            if ($div.hasClass('pf-widget-content')) {
              cy.get('div')
                .find('button[class="pf-widget-close"]')
                .click({ force: true })
            }
          })
          cy.log('')
          cy.log('# Get the attribute href of each Main Category on Nav bar ')
          cy.xpath(MAIN_CATE_NAV, { timeout: 5000 })
            .eq(c)
            .invoke('attr', 'href')
            .then(href => {
              cy.log(href)
              if (href.includes('.mom.com/')) {
                cy.log('Do nothing because it will open new tab')
              } else {
                cy.log('')
                cy.log('# Get the text in H1 on the Category page')
                cy.xpath(MAIN_CATE_NAV, { timeout: 5000 })
                  .eq(c)
                  .click()
                  .get('h1')
                  .invoke('text')
                  .then(MainCate => {
                    cy.log('')
                    cy.log('#' + (c + 1) + ' Click ' + MainCate + ' Menu on Nav bar')
                    cy.xpath(BANNER_SECTION).then($img => {
                      //$img[0] means convert jQuery element to HTML element then . children will let it display all children under the $img[0]
                      //The reason why to make length < 2 because when banner image does not set up the div element on frontend will not display and it causes the children under the $img[0] has only 1 child
                      cy.log($img[0].children)
                      if ($img[0].children.length < 2) {
                        SRC_BANNER_IMAGE = 'Do nothing'
                        cy.log('No Banner image')
                      } else {
                        cy.log('')
                        cy.log('# Get the Banner image in the Category page')
                        cy.xpath(BANNER_IMAGE, { timeout: 5000 })
                          .invoke('attr', 'src')
                          .then(src => {
                            //Cut the unnecessary parameters from the image URL which got from attribute src
                            SRC_BANNER_IMAGE = src.split('?')
                            cy.url().then(url => {
                              cy.wait(2000)
                                .get('article')
                                .its('length')
                                .then(numArt => {
                                  if (url.includes('/series/')) {
                                    cy.log('')
                                    cy.log('#' + (c + 1) + ' Check ' + MainCate + ' Banner image')
                                    cy.request(
                                      'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr/environments/' +
                                        ENVIRONMENT +
                                        '?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{seriesCollection(where:{title:' +
                                        '"' +
                                        MainCate +
                                        '"' +
                                        '}){items{title,bannerImage{url}}}}'
                                    ).then(response => {
                                      var img_banner =
                                        response.body.data.seriesCollection.items[0].bannerImage.url
                                      expect(SRC_BANNER_IMAGE[0]).to.equal(img_banner)
                                    })
                                    cy.log('')
                                    cy.log(
                                      '#' + (c + 1) + ' Check articles first load for ' + MainCate
                                    )
                                    cy.request(
                                      'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr/environments/' +
                                        ENVIRONMENT +
                                        '?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{seriesCollection(where:{title:' +
                                        '"' +
                                        MainCate +
                                        '"' +
                                        '}){items{linkedFrom{postCollection{total}}}}}'
                                    ).then(response => {
                                      var numPosts =
                                        response.body.data.seriesCollection.items[0].linkedFrom
                                          .postCollection.total
                                      cy.log('')
                                      cy.log(
                                        '# Compare the first load articles between Frontand and Backend'
                                      )
                                      if (numPosts < 10) {
                                        expect(numArt).to.equal(numPosts)
                                      } else {
                                        expect(numArt).to.equal(10)
                                      }
                                    })
                                  } else {
                                    cy.log('')
                                    cy.log('#' + (c + 1) + ' Check ' + MainCate + ' Banner image')
                                    cy.request(
                                      'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr/environments/' +
                                        ENVIRONMENT +
                                        '?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{categoryCollection(where:{title:' +
                                        '"' +
                                        MainCate +
                                        '"' +
                                        '}){items{title,bannerImage{url}}}}'
                                    ).then(response => {
                                      var items =
                                        response.body.data.categoryCollection.items[0].bannerImage
                                          .url

                                      expect(SRC_BANNER_IMAGE[0]).to.equal(items)
                                    })
                                    cy.log('')
                                    cy.log(
                                      '#' + (c + 1) + ' Check articles first load for ' + MainCate
                                    )
                                    cy.request(
                                      'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr/environments/' +
                                        ENVIRONMENT +
                                        '?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{categoryPageCollection(where:{name:' +
                                        '"' +
                                        MainCate +
                                        '"' +
                                        '}){items{featurePostCollection{total, items{title}}}}}'
                                    ).then(response => {
                                      let featuredPosts = response.body.data.categoryPageCollection
                                      let keepTitle = []

                                      cy.log(
                                        '# Verify the first load articles on frontend which include the featured posts'
                                      )
                                      if (
                                        featuredPosts.items[0] === undefined ||
                                        featuredPosts.items[0].featurePostCollection === undefined
                                      ) {
                                        cy.get('article')
                                          .its('length')
                                          .should('be.lte', 10)
                                      } else {
                                        cy.wrap(featuredPosts.items[0].featurePostCollection.items)
                                          .its('length')
                                          .then(fixNum => {
                                            cy.log('This is fix num ' + fixNum)
                                            for (let a = 0; a < fixNum; a++) {
                                              cy.log(
                                                featuredPosts.items[0].featurePostCollection.items[
                                                  a
                                                ].title
                                              )

                                              //Add the featured post article into the array
                                              keepTitle.push(
                                                featuredPosts.items[0].featurePostCollection.items[
                                                  a
                                                ].title
                                              )
                                            }
                                            //This part will group the duplicate title to display only one
                                            let uniques = [...new Set(keepTitle)]

                                            //Count the article on frontend and sum with the featured post
                                            cy.get('article')
                                              .its('length')
                                              .should('be.lte', uniques.length + 10)
                                          })
                                      }
                                    })
                                  }
                                })
                            })
                          })
                      }
                    })
                  })
              }
            })
        }
      })
  })
})
