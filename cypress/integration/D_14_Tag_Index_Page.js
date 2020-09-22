describe('MOMCOM_D_14_Tag_Index_Page', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  const articleURL = '/baby/12218-late-vs-early-teething'
  const articleRequestURL = '"12218-late-vs-early-teething"'

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify tag index page working properly', () => {
    const XPATH_TAG_LINK = '(//a[contains(@href,"/tag/")])[1]'
    const XPATH_TAG_LINKS = '//a[contains(@href,"/tag/")]'
    const XPATH_LINE_TAG_PAGE = '//img[contains(@src,"/static/media/line-pink")]'

    const XPATH_ARTICLE_LINK = '//article/div/div/div/a'
    const XPATH_FIRST_ARTICLE_LINK = '(//article/div/div/div/a)[1]'

    const XPATH_FB_SHARE_BUTTON = '(//footer//button)[1]'

    // To store article URLs in search result page
    let articleLinkArray = []

    // To store duplicate articles in search result page
    let findDuplicatesArray = []

    let tagName
    let tagNameEncode
    let totalPostTagPage

    let requestDate = new Date().toISOString()

    cy.log('Verify URL of article')
    cy.visit(Cypress.config().baseUrl + articleURL)
    cy.url().should('eq', Cypress.config().baseUrl + articleURL)

    // Scroll to see the tag
    cy.log('#2 Scroll down to the tag keyword')
    cy.xpath(XPATH_TAG_LINK)
      .scrollIntoView()
      .should('be.visible')

    // Get the tags in the post
    cy.request(
      'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{postCollection(where:{slug:' +
        articleRequestURL +
        '}){items{tags}}}'
    ).then(response => {
      cy.log(response.body.data.postCollection.items[0].tags[0])

      tagName = response.body.data.postCollection.items[0].tags[0]
      cy.log('-Verify the tag name displays in the article correctly')
      cy.xpath(XPATH_TAG_LINK)
        .invoke('text')
        .should('eq', tagName)

      tagNameEncode = encodeURIComponent(tagName.trim())

      cy.log('Click on the tag name in the article page')
      cy.xpath(XPATH_TAG_LINK).click()
      cy.log('-Verify URL appear https://mom.com/tag/[tag keyword]')
      cy.url().should('eq', Cypress.config().baseUrl + '/tag/' + tagNameEncode)

      cy.log('-Tag keyword appear at top left of the page with underline.')
      cy.wait(3000)
        .get('h1')
        .contains(tagName)
        .should('be.visible')

      cy.xpath(XPATH_LINE_TAG_PAGE).should('be.visible')

      cy.request(
        'https://mom.com/api/spaces/9l3tjzgyn9gr/environments/master/entries?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&content_type=post&include=1&fields.tags=' +
          tagNameEncode +
          '&fields.publishDate[lte]=' +
          requestDate
      ).then(response => {
        totalPostTagPage = response.body.total

        cy.log('-Verify the first load articles in the tag page')
        if (totalPostTagPage < 10) {
          cy.get('article').should('have.length', totalPostTagPage)
          cy.log('-Skip step #3 because the article totals less than 10')
        } else {
          cy.get('article').should('have.length', 10)

          cy.log('#3 Scroll down to see more articles load')
          cy.window()
            .scrollTo('bottom')
            .wait(6000)
          cy.get('div').then($div => {
            // If there is you might like modal, it should be closed. We do not need to verify it.
            if ($div.hasClass('pf-widget-content')) {
              cy.xpath('//button[@class="pf-widget-close"]').click({
                force: true,
              })
            }
          })
          // Count <article> after load more
          cy.wait(3000)
            .get('article')
            .its('length')
            .then(count => {
              // Verify when load more, <article> should less than or equal to 20
              cy.log('Verify <article> count after load more: ', count)
              cy.wrap(count).should('eq', 20)
            })
        }
      })
    })
    // .then(() => {
    // Get the total posts in the tag
    // })
    // .then(() => {
    cy.xpath(XPATH_ARTICLE_LINK)
      .each(($el, index) => {
        cy.wrap($el)
          .invoke('attr', 'href')
          .then(hrefValue => {
            // hrefValue is article URL and it will be stored to articleLinkArray[]
            articleLinkArray[index] = hrefValue
            cy.log('Article URL [' + index + '] >>> ', articleLinkArray[index])
          })
      })
      // })
      .then(() => {
        // Declare function for finding duplicated article
        let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)

        // Verify duplicate article
        cy.log('URL Array lenght:', articleLinkArray.length)
        cy.log('-Verify duplicate article')
        cy.log('>>>>>>>' + articleLinkArray)
        findDuplicatesArray = findDuplicates(articleLinkArray)
        cy.wrap(findDuplicatesArray).should('be.empty')

        cy.log('#4 Click the 1st article in the tag page')
        cy.xpath(XPATH_FIRST_ARTICLE_LINK).click()

        // Scroll to see the tag
        cy.xpath(XPATH_FB_SHARE_BUTTON)
          .scrollIntoView()
          .should('be.visible')

        cy.log('-Verify the tag displays in this article')
        cy.xpath(XPATH_TAG_LINKS)
          .contains(tagName)
          .should('be.visible')
      })
  })
})
