describe('MOMCOM_D_05_Category_SubCategory', () => {
  beforeEach(() => {
    cy.visitSite()
  })

  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })

  const MAIN_CATE_NAV = '//div/header/nav/div/div/ul/li/a'
  const SUB_CATE_NAV = '//div/header/nav/div/div/ul/li/ul'
  const SUB_CATE_BUTT = 'a[data-slug]'

  var isoDate = new Date().toISOString()

  it('Verify Subcategories on nav bar and Sub Categories button in the Category Page', () => {
    cy.request(
      'https://graphql.contentful.com/content/v1/spaces/9l3tjzgyn9gr/environments/master?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&query=query{categoryCollection{items{title,isPrimaryCategory,sys{id}}}}'
    ).then(response => {
      cy.wrap(response.body.data.categoryCollection.items).each(($li, index) => {
        cy.log('This is category >> ' + $li.title)
        cy.log('This is isPrimary >>>' + $li.isPrimaryCategory)
        let cate_id = $li.sys.id
        if ($li.isPrimaryCategory === true) {
          cy.log('This is Main Cate')
          cy.request(
            'https://mom.com/api/spaces/9l3tjzgyn9gr/environments/master/entries?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&content_type=post&include=1&fields.mainCategory.sys.id=' +
              cate_id +
              '&sys.id[nin]=&order=-fields.publishDate&limit=10&skip=0&fields.publishDate[lte]=' +
              isoDate
          ).then(response => {
            cy.log(response)
            cy.wrap(response.status).should('eq', 200)
          })
        } else {
          cy.log('This is sub Cate')
          cy.request(
            'https://mom.com/api/spaces/9l3tjzgyn9gr/environments/master/entries?access_token=1wNApzdgTuDomDUVawIO9n5JaShP2Q2MwwI5oxtqT8c&content_type=post&include=1&fields.relatedCategories.sys.id=' +
              cate_id +
              '&sys.id[nin]=&order=-fields.publishDate&limit=10&skip=0&fields.publishDate[lte]=' +
              isoDate
          ).then(response => {
            cy.log(response)
            cy.wrap(response.status).should('eq', 200)
          })
        }
      })
    })

    cy.xpath(MAIN_CATE_NAV, { timeout: 7000 })
      .its('length')
      .then(cateNum => {
        for (let i = 0; i < cateNum; i++) {
          if (i === 6 || i === 7) {
            //This IF is to stop running when it runs to the last to tab in Navigation bar due to these two are the special one
            break
          } else {
            cy.log(
              '#' +
                (i + 1) +
                ' Check set of Sub categories between on the Navigation bar and in the Main Category page'
            )
            cy.xpath(MAIN_CATE_NAV, { timeout: 7000 })
              .eq(i)
              .click()
              .get(SUB_CATE_BUTT, { timeout: 7000 })
              .invoke('text')
              .then(subcatebutt => {
                cy.log(subcatebutt)
                cy.xpath(SUB_CATE_NAV)
                  .eq(i)
                  .invoke('text')
                  .then(Subcatelist => {
                    cy.log(Subcatelist)
                    expect(Subcatelist).to.eq(subcatebutt)
                  })
              })
          }

          cy.xpath(SUB_CATE_NAV, { timeout: 7000 })
            .eq(i)
            .find('li')
            .its('length')
            .then(subNum => {
              for (let j = 0; j < subNum; j++) {
                cy.log(
                  '#' +
                    (i + 1) +
                    ' Verify that Sub category buttons are not displayed in the Sub Category page'
                )
                cy.xpath(MAIN_CATE_NAV, { timeout: 7000 })
                  .eq(i)
                  .trigger('mouseover')
                  .xpath(SUB_CATE_NAV, { timeout: 7000 })
                  .eq(i)
                  .find('li')
                  .eq(j)
                  .click()
                  .get('h1', { timeout: 5000 })
                cy.get(SUB_CATE_BUTT).should('not.exist')
                cy.xpath(MAIN_CATE_NAV, { timeout: 7000 })
                  .eq(i)
                  .trigger('mouseout')
              }
            })
          cy.log('*********************')
        }
      })
  })
})
