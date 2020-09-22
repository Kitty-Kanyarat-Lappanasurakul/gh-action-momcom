describe('MOMCOM_D_02_Search', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  it('Verify Search function with valid keyword and search result page', () => {
    const KEYWORD = 'spaceship'

    const CSS_SEARCH_ICON = 'button[class*="sharedStyles__ScIconButton"]'
    const CSS_SEARCH_INPUT = 'input[class*="NavbarDesktop__ScForwardRefSearchBox"]'
    const XPATH_ARTICLE_LINK = '//article/div/div/div/a'

    // To store article URLs in search result page
    let articleLinkArray = []

    // To store duplicate articles in search result page
    let findDuplicatesArray = []

    // Declare function for finding duplicated article
    let findDuplicates = (arr) => arr.filter((item, index) => arr.indexOf(item) != index)

    // To store title/url/body of the 1st article in search result page
    let articleTitle
    let articleURL
    let articleBody

    // Click search icon #2
    cy.get(CSS_SEARCH_ICON).click()

    // Verify search box appear with "Search" text and type keyword #2
    cy.log('#2 Verify search box appear with "Search" text and type keyword')
    cy.get(CSS_SEARCH_INPUT).invoke('attr', 'placeholder').should('eq', 'Search')

    // Type keyword in search box
    cy.get(CSS_SEARCH_INPUT).type(KEYWORD)

    // Click search #2
    cy.get(CSS_SEARCH_ICON).click()

    // Assert search result page url #2
    cy.log('#2 Verify URL of Search results page')
    cy.url().should('eq', Cypress.config().baseUrl + '/search/' + KEYWORD)

    // Article list on the first load must have 10 articles #2
    cy.log('#2 Verify Article list on the first load must have 10 articles')

    cy.wait(2000).get('article').should('have.length', 10)

    // Verify Image, Category, Title in <article> should display
    cy.log(
      '#2 Verify Image, Category, Title in <article> should display for 10 first load articles'
    )
    cy.get('article').each(($el, index) => {
      cy.log('<article> #', index + 1)
      cy.wrap($el).within(() => {
        cy.get('img').should('be.visible')
        cy.get('div[class*="font-description"]').should('be.visible')
        cy.get('h2').should('be.visible')
      })
    })

    // Scroll down to see more articles load
    cy.window().scrollTo('bottom').wait(3000)
    cy.get('div').then(($div) => {
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
      .then((count) => {
        // Verify when load more, <article> should less than or equal to 20
        cy.log('Verify <article> count after load more: ', count)
        cy.expect(count).to.be.lessThan(21)

        // Verify heading in search result page
        cy.log('Verify heading in search result page')
        cy.get('h1').should('contain', count + ' results for "' + KEYWORD + '"')
      })
    // Get article URL from image in <article> element
    cy.xpath(XPATH_ARTICLE_LINK)
      .each(($el, index) => {
        cy.wrap($el)
          .invoke('attr', 'href')
          .then((hrefValue) => {
            // hrefValue is article URL and it will be stored to articleLinkArray[]
            articleLinkArray[index] = hrefValue
            cy.log('Article URL [' + (index + 1) + '] >>> ', articleLinkArray[index])
          })
      })
      .then(() => {
        // Verify duplicate article
        cy.log('URL Array lenght:', articleLinkArray.length)
        cy.log('Verify duplicate article')
        findDuplicatesArray = findDuplicates(articleLinkArray)
        cy.log('#3 Verify no duplicate article in search result page', findDuplicatesArray)
        // Expect duplicate array is empty
        cy.wrap(findDuplicatesArray).should('be.empty')
      })
      .then(() => {
        // Click the 1st article link
        cy.get('article').eq(0).find('a').eq(0).click()

        // Verify the 1st article URL after clicking on the 1st article in search result page
        cy.log('Verify the current URL after clicking on the 1st article in search result page')
        cy.url().should('eq', Cypress.config().baseUrl + articleLinkArray[0])
      })

    // Request swiftype api in order to verify the keyword match with the result
    cy.request(
      'https://search-api.swiftype.com/api/v1/public/engines/search.json?engine_key=Uu_6FQyNSbnkFVns7QBe&&q=' +
        KEYWORD +
        '&filters[page][type][]=post&page=1&per_page=10'
    ).then((response) => {
      // Verify url/title/body in article must match with the keyword
      // .includes() will return True or False
      articleURL = response.body.records.page[0].url.toLowerCase().includes(KEYWORD)
      articleTitle = response.body.records.page[0].title.toLowerCase().includes(KEYWORD)
      articleBody = response.body.records.page[0].body.toLowerCase().includes(KEYWORD)
      cy.log('keyword in url checking >> ' + articleURL)
      cy.log('keyword in title checking >> ' + articleTitle)
      cy.log('keyword in body checking >> ' + articleBody)

      // Verify the 1st article URL should be equal to the URL in swiftype response
      cy.log('Verify the 1st article URL should be equal to the URL in swiftype response')
      cy.wrap(response.body.records.page[0].url).should(
        'eq',
        Cypress.config().baseUrl + articleLinkArray[0]
      )

      // Verify one of url/title/body in article must match with the keyword
      cy.log('#4 Verify url/title/body in article must match with the keyword')
      cy.wrap(articleTitle || articleURL || articleBody).should('be.true')
    })
  })
})
