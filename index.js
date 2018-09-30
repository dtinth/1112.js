// @ts-check
const { step, action, pending } = require('prescript')
const puppeteer = require('puppeteer')

function getPage(state) {
  /** @type {import('puppeteer').Page} */
  const page = state.page
  return page
}
async function retry(f, n = 3) {
  let error
  for (let i = 0; i < n; i++) {
    try {
      return await f()
    } catch (e) {
      error = e
    }
  }
  throw error
}

step('Open browser', () =>
  action(async state => {
    state.browser = await puppeteer.launch({
      headless: false
    })
  })
)
step('Go to 1112.com', () =>
  action(async state => {
    /** @type {import('puppeteer').Browser} */
    const browser = state.browser
    const page = await browser.newPage()
    await page.goto('https://1112.com')
    state.page = page
  })
)
step('Select "Meat Deluxe"', () =>
  action(async state => {
    const page = getPage(state)
    await retry(async () => {
      await page.click('.pizza-widget-option-list')
      await page.waitForSelector('img[src$="Meat-Deluxe.png"]', {
        timeout: 2000
      })
      await page.click('img[src$="Meat-Deluxe.png"]')
    })
  })
)
step('Add to cart', () =>
  action(async state => {
    const page = getPage(state)
    await retry(async () => {
      await page.click('.btn.add-to-cart')
      await page.waitForFunction(
        () => {
          return +document.querySelector('#cart .item-count').textContent === 1
        },
        { timeout: 3000 }
      )
    })
  })
)
step('Checkout', () =>
  action(async state => {
    const page = getPage(state)
    await page.click('#cart .item-count')
    await page.waitForSelector('.checkout .btn')
    await page.click('.checkout .btn')
  })
)
step('Log in', () =>
  action(async state => {
    const page = getPage(state)
    const config = JSON.parse(
      require('fs').readFileSync(process.env.HOME + '/.pizza.json', 'utf8')
    )
    const email = config.email
    const password = config.password
    await page.waitForSelector('#signin')
    await page.type('input[name="username"]', email)
    await page.type('input[name="password"]', password)
    await page.click('.login-btn')
  })
)
step('Click the next button', () =>
  action(async state => {
    const page = getPage(state)
    await page.waitForSelector('[ng-click="toPayment()"]')
    await page.click('[ng-click="toPayment()"]')
  })
)
step('Place order', () =>
  action(async state => {
    const page = getPage(state)
    const config = JSON.parse(
      require('fs').readFileSync(process.env.HOME + '/.pizza.json', 'utf8')
    )
    const address = config.address
    await page.waitForSelector('[title="'+ address +'"]', {
      timeout: 5000
    })
    await page.waitForSelector('.placeorder-btn')
    await page.click('.placeorder-btn')
  })
)
step('Close browser', () =>
  action(async state => {
    /** @type {import('puppeteer').Browser} */
    const browser = state.browser
    browser.close()
  })
)
