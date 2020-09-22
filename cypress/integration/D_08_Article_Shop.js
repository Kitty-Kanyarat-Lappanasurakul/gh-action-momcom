describe('MOMCOM_D_08_Article_Shop', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  const articleURL = '/baby/best-baby-hair-styling-products-accessories'
  const articleRequestURL = '"best-baby-hair-styling-products-accessories"'

  // Prevent error originated from our application code, not from Cypress.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  let commaNumber = data => {
    return data.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
  }

  // Declare function to fix the decimal places of price
  let fixedPrice = price => {
    // return (Math.floor(price * 100) / 100).toFixed(2)
    const priceString = !Number.isInteger(price)
      ? price.toString().substring(0, price.toString().indexOf('.') + 3)
      : (price += '.00')

    const priceParts = String(priceString).split('.')
    priceParts[0] = commaNumber(priceParts[0])

    //Check a length of the decimal if there is 1 then add 0 for display
    if (priceParts[1]) {
      priceParts[1] = priceParts[1].length === 1 ? (priceParts[1] += '0') : priceParts[1]
    }
    return priceParts.join('.')
  }

  it('Verify shop article page working properly', () => {
    const XPATH_FIRST_PRODUCT = '(//section//section)[1]'
    const XPATH_SLIDE_IMG = '(//section//section//img)[1]'
    const XPATH_SLIDE_TITLE = '(//section//section//h2)[1]'
    const XPATH_SLIDE_PRICE = '(//section//section//span)[1]'

    const XPATH_STORE_NAME_LINK = '((//section//section)[1]//span//a)'
    const XPATH_SHOP_BUTTON_LINK = '((//section//section)[1]//a[normalize-space()="SHOP"])'

    const XPATH_COUNT_NUMBER = '//section//div[contains(@class,"font-description")]'

    cy.log('Verify URL of shoppable article')
    cy.visit(Cypress.config().baseUrl + articleURL)
    cy.url().should('eq', Cypress.config().baseUrl + articleURL)

    // Get the gallery slide (product slide and media slide) details of this post
    cy.request(
      'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{postCollection(where:{slug:' +
        articleRequestURL +
        '}){items{gallerySlidesCollection(limit:50){total,items{... on ProductSlide{title,slug,price,storeName,productLink,image{url}},... on MediaSlide{title,slug,image{url}}}}}}}'
    ).then(response => {
      // All test steps below will verify the 1st product slide
      cy.log('#2 Scroll down to the product slide (gallery slide)')
      cy.xpath(XPATH_FIRST_PRODUCT)
        .scrollIntoView()
        .should('be.visible')

      cy.log('-Verify url of product slide')
      cy.wait(3000)
        .url()
        .should(
          'eq',
          Cypress.config().baseUrl +
            articleURL +
            '/' +
            response.body.data.postCollection.items[0].gallerySlidesCollection.items[0].slug
        )

      // If there is an image of product slide, we will verify an image URL is correct.
      if (
        response.body.data.postCollection.items[0].gallerySlidesCollection.items[0].image != null
      ) {
        cy.log('-Verify Image of product slide should display')
        cy.xpath(XPATH_SLIDE_IMG)
          .invoke('attr', 'src')
          .should(
            'contain',
            response.body.data.postCollection.items[0].gallerySlidesCollection.items[0].image.url
          )
        cy.xpath(XPATH_SLIDE_IMG).should('be.visible')
      }

      cy.log('-Verify Title of product slide should display')
      cy.xpath(XPATH_SLIDE_TITLE)
        .invoke('text')
        .should(
          'eq',
          response.body.data.postCollection.items[0].gallerySlidesCollection.items[0].title
        )

      cy.log('-Verify Price and Store name of product slide should display')
      cy.xpath(XPATH_SLIDE_PRICE)
        .invoke('text')
        .should(
          'eq',
          '$' +
            fixedPrice(
              response.body.data.postCollection.items[0].gallerySlidesCollection.items[0].price
            ) +
            ' from ' +
            response.body.data.postCollection.items[0].gallerySlidesCollection.items[0].storeName
        )

      cy.log('#3 Verify Product link (Store name) of product slide should display')
      cy.xpath(XPATH_STORE_NAME_LINK)
        .invoke('attr', 'href')
        .should(
          'eq',
          response.body.data.postCollection.items[0].gallerySlidesCollection.items[0].productLink
        )

      cy.log('-Verify open new tab when clicking on the store name')
      cy.xpath(XPATH_STORE_NAME_LINK).should('have.attr', 'target', '_blank')

      cy.log('#4 Verify Product link (SHOP button) of product slide should display')
      cy.xpath(XPATH_SHOP_BUTTON_LINK)
        .invoke('attr', 'href')
        .should(
          'eq',
          response.body.data.postCollection.items[0].gallerySlidesCollection.items[0].productLink
        )

      cy.log('-Verify open new tab when clicking on the SHOP button')
      cy.xpath(XPATH_SHOP_BUTTON_LINK).should('have.attr', 'target', '_blank')

      cy.log('-Verify a product link request is success')
      cy.request(
        response.body.data.postCollection.items[0].gallerySlidesCollection.items[0].productLink
      )

      cy.log('#5 Verify gallery slide counting number located on the top left of the slide')
      cy.xpath(XPATH_COUNT_NUMBER).each(($el, index) => {
        cy.wrap($el)
          .invoke('text')
          .should(
            'eq',
            index +
              1 +
              '/' +
              response.body.data.postCollection.items[0].gallerySlidesCollection.total
          )
        cy.wrap($el).should('be.visible')
      })
    })
  })
})
