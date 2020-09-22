///GLOBAL Variable
describe('MOMCOM_D_06_Article_Page', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  //Will be executed everytimes that URL has changed
  cy.on('url:changed', (newUrl) => {
    //Prevent the lytic popup after visiting the post
    cy.get('div', { timeout: 7000 }).then(($div) => {
      if ($div.hasClass('pf-widget-content')) {
        cy.get('div').find('button[class="pf-widget-close"]').click({ force: true })
      }
    })
  })

  //Function for covert Date format to YYYY-MM-DD
  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join('-')
  }

  function formatDate_reduct_date(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + (d.getDate() - 1),
      year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join('-')
  }

  const HEADER_SECTION = '//article/header'
  const AUTHOR_IMG = '//a[contains(@href, "/author")] // img'
  const BREAD_CRUMP = '//header/div[1]'
  const POST_TITLE = '//header/h1'
  const PUBLISHDATE = '(//div[contains(@class, "font-description")] // span)[1]'
  const TAG_SECTION = '(//footer/div[2]/div)[1]'
  const ARTICLE_ON_TAG_PAGE = 'div[class="GridList__ScGridWrapper-sc-2rlzc8-0 gMaVeF"]'
  const ARTICLE_IN_TRENDING = '//div[2]/aside[1]/div[2]/div'
  const EN_BUTTON = '//li[normalize-space()="EN"]'

  it('Verify NORMAL ARTICLE page working properly', () => {
    let publishdatetwo
    let ARTICLE_SLUG

    var isoDate = new Date().toISOString()

    cy.request(
      'https://mom.com/api/spaces/9l3tjzgyn9gr/environments/master/entries?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&include=1&limit=5&content_type=post&order=-fields.publishDate&fields.publishDate%5Blte%5D=' +
        isoDate +
        '&fields.tags[exists]=true&fields.postType=article&fields.updatedDate[exists]=false'
    ).then((response) => {
      cy.log(response)
      cy.log('above it the response')

      // const POST_SLUG = response.body.data.postCollection.items[0].slug
      const POST_SLUG = response.body.items[0].fields.slug
      // const POST_CATEGORY = response.body.data.postCollection.items[0].mainCategory.slug
      const POST_CATEGORY = response.body.items[0].fields.displayMainCategorySlug
      ARTICLE_SLUG = '/' + POST_CATEGORY + '/' + POST_SLUG

      cy.log('# Navigate to article:')
      cy.visit(Cypress.config().baseUrl + ARTICLE_SLUG)

      cy.log(' ')
      cy.log('# Verify current URL display the article that queried from the GraphQL')
      cy.url().should('be.equal', Cypress.config().baseUrl + ARTICLE_SLUG)

      cy.log(' ')
      cy.log('# Verify Header Section')
      cy.xpath(HEADER_SECTION, { timeout: 10000 })
        .children()
        .then(($elemt) => {
          cy.request(
            'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{postCollection(where:{slug:"' +
              POST_SLUG +
              '"}){items{mainCategory{slug},title,authorsCollection{items{name}},featuredImage{url}}}}'
          ).then((response) => {
            let head_response = response.body.data.postCollection.items[0]

            //Compare title and Author name with the data in GraphQL
            cy.log(' ')
            cy.log('# Verify title of the article and author name between frontend and GraphQL')

            cy.wrap($elemt)
              .should('contain', head_response.title)
              .and('contain', head_response.authorsCollection.items[0].name)

            //Compare image url in the element with the graphQL
            cy.log(' ')
            cy.log('# Verify Feature Image between frontend and GraphQL')
            let image_url = ('' + head_response.featuredImage.url).split('https:')
            cy.wrap($elemt[3].innerHTML).should('contain', image_url[1])

            //Compare category on the href of bread crump
            cy.log(' ')
            cy.log('# Verify Bread Crump displays Main Category')
            cy.wrap($elemt[0].baseURI).should('contain', head_response.mainCategory.slug)

            //Verify bread crump is aligned at center
            cy.log(' ')
            cy.log('# Verify bread crump is aligned center')
            cy.xpath(BREAD_CRUMP, { timeout: 6000 })
              .invoke('css', 'text-align')
              .should('eq', 'center')

            //Verify bread crump is navigated to the same category
            cy.log(' ')
            cy.log('# Verify bread crump is navigated to correct Category')
            cy.xpath(BREAD_CRUMP, { timeout: 6000 })
              .find('a')
              .eq(0)
              .invoke('text')
              .then((categoryname) => {
                cy.xpath(BREAD_CRUMP, { timeout: 6000 }).find('a').eq(0).click()

                cy.get('h1', { timeout: 6000 }).invoke('text').should('eq', categoryname).go('back')
              })

            //Verify Title is aligned at center
            cy.log(' ')
            cy.log('# Verify title of the article is aligned center')
            cy.xpath(POST_TITLE, { timeout: 6000 })
              .invoke('css', 'text-align')
              .should('eq', 'center')

            //Verify PublishDate and Author section
            cy.request(
              'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{postCollection(limit:1,where:{slug:"' +
                POST_SLUG +
                '"}){items{publishDate,authorsCollection{items{name,image{url}}}}}}'
            ).then((response) => {
              const AUTHOR_QL =
                response.body.data.postCollection.items[0].authorsCollection.items[0]
              const POST_PUB_DATE = response.body.data.postCollection.items[0].publishDate

              cy.log(' ')
              cy.log(POST_PUB_DATE.slice(-13, -11))
              cy.log('#Verify the Author image')
              if (AUTHOR_QL.image === null) {
                cy.xpath(AUTHOR_IMG)
                  .invoke('attr', 'src')
                  .should('contain', 'icon-author-placeholder')
              } else {
                // cy.xpath(AUTHOR_IMG)
                //   .invoke('attr', 'src')
                //   .should('contain', AUTHOR_QL.image.url)
              }

              cy.log(' ')
              cy.log('#Verify the author name between frontend and GraphQL to match')
              cy.xpath(HEADER_SECTION)
                .find('a[href*="/author/"]')
                .invoke('text')
                .should('contains', AUTHOR_QL.name)

              cy.log(' ')
              cy.log('#Verify the publish Date between frontend and GraphQL to match')
              cy.xpath(PUBLISHDATE)
                .invoke('text')
                .then((publishdateone) => {
                  publishdatetwo = publishdateone
                  //Convert object from graphQL to String then, get only the date
                  if (POST_PUB_DATE.slice(-13, -11) > 17) {
                    cy.log('more than 17')
                    //Change date format from MMM DD, YYYY to YYYY-MM-DD
                    let publish_from_frontend = formatDate_reduct_date(publishdateone.slice(-12))
                    cy.log(publishdateone.slice(-12))
                    const publish_from_graphQL = JSON.stringify(POST_PUB_DATE).slice(1, 11)
                    cy.wrap(publish_from_graphQL).should('eq', publish_from_frontend)
                  } else {
                    cy.log('less than 17')
                    //Change date format from MMM DD, YYYY to YYYY-MM-DD
                    let publish_from_frontend = formatDate(publishdateone.slice(-12))
                    cy.log(publishdateone.slice(-12))
                    //Convert object from graphQL to String then, get only the date
                    const publish_from_graphQL = JSON.stringify(POST_PUB_DATE).slice(1, 11)
                    cy.wrap(publish_from_graphQL).should('eq', publish_from_frontend)
                  }
                })

              cy.log(' ')
              cy.log('# Check the author is linked to the correct page after it is clicked')
              cy.xpath(HEADER_SECTION).find('a[href*="/author/"] > div').click()

              cy.get('h1', { timeout: 6000 }).eq(0).invoke('text').should('eq', AUTHOR_QL.name)
              cy.url().should('include', '/author/').go('back')

              // check tag exist or not
              const existent = Cypress.$(
                '#root > div > div > div > article > div > div > footer > div > div > span'
              )
              if (existent.length) {
                //If it found the element it will be here
                cy.log('found')

                cy.log(' ')
                cy.log('# Check tag section')
                cy.xpath(TAG_SECTION)
                  .scrollIntoView()
                  .find('span')
                  .eq(0)
                  .invoke('text')
                  .then((tagname) => {
                    cy.xpath(TAG_SECTION).find('span').eq(0).click()

                    cy.log(' ')
                    cy.log(
                      '# Check that tag is navigated to the correct page with the same tag name'
                    )
                    cy.get('h1', { timeout: 8000 }).eq(0).invoke('text').should('eq', tagname)

                    //Have encoded the tag before comparing with the current url
                    cy.url().should(
                      'eq',
                      Cypress.config().baseUrl + '/tag/' + encodeURIComponent(tagname)
                    )

                    // let UTCDate = new Date().toISOString()
                    cy.log(' ')
                    cy.log('# Verify article is existed in Tag Index page')
                    cy.get('article')
                      .find('a[href*="' + ARTICLE_SLUG + '"]')
                      //This parents is div tag under the <article>S
                      .parents(ARTICLE_ON_TAG_PAGE)
                      .then((parent) => {
                        cy.wrap(parent)

                        cy.log(' ')
                        cy.log(
                          '# Check that the title and publish date is the same as Article Page'
                        )
                        cy.wrap(parent)
                          .should('contain', head_response.title)
                          .and('contain', publishdatetwo)

                        cy.log(' ')
                        cy.log(
                          '# Check that the image is the same as Featured image in Article Page'
                        )
                        cy.wrap(parent)
                          .find('img')
                          .invoke('attr', 'src')
                          .should('contain', image_url[1])
                          .go('back')
                      })

                    // cy.log(' ')
                    // cy.log('# Verify Trending Stoties section is appearing 4 articles')
                    // cy.scrollTo('bottom')
                    // cy.contains('MOST POPULAR', {
                    //   timeout: 7000,
                    // }).scrollIntoView()
                    // cy.xpath(ARTICLE_IN_TRENDING)
                    //   .its('length')
                    //   .should('eq', 4)
                  })
              }
            })
          })
        })
    })
  })
})
