//  Amazon Purchasing Bot
//  © Christian Coduri - 2022


const puppeteer = require('puppeteer')

const urlTarget = ""
const mailAmazon = ""
const pswAmazon = ""

const refreshRate = 3000
const purchasePrice = 50.00


async function initBrowser(){
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null})
    const page = await browser.newPage()
    await page.goto(urlTarget, { waitUntil: 'networkidle2' })
    return page
}

async function getPrice(page){
    //return await page.$eval(".a-offscreen", element => element.innerText)
    //return await page.$eval("span[class='a-offscreen']", element => element.innerText)
    return await page.evaluate(()=> document.querySelector(".a-offscreen").innerText)
}

async function monitoringPrice(page){
    while(parseFloat(await getPrice(page)) > purchasePrice){
        await page.waitForTimeout(refreshRate)
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
    }
}

async function addToCart(page){
    await page.$eval("#add-to-cart-button", element => element.click())
}

async function login(page){
    await page.waitForSelector("input[name='proceedToRetailCheckout']")
    await page.$eval("input[name='proceedToRetailCheckout']", element => element.click())

    await page.waitForSelector('#ap_email')
    await page.type("#ap_email", mailAmazon)
    await page.$eval("input[id='continue']", element => element.click())   //document.querySelector("input[id='continue']").click()

    await page.waitForSelector('#ap_password')
    await page.type("#ap_password", pswAmazon)

    await page.$eval("#signInSubmit", element => element.click())
}

async function orderAndPay(page){
    await page.waitForSelector("#bottomSubmitOrderButtonId")
    await page.$eval("#bottomSubmitOrderButtonId", element => element.click())
}


async function doAllThings(){
    const page = await initBrowser()

    await page.$eval("#sp-cc-accept", element => element.click())  // Chiudo finestra cookie

    await monitoringPrice(page)
    console.log("Prezzo OK")

    await addToCart(page)
    console.log("Articolo aggiunto al carrello")

    await login(page)
    console.log("Login effettuato con successo")

    await orderAndPay(page)
    console.log("Articolo ordinato!")
}

doAllThings()