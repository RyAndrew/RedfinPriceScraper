'use strict';

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const fs = require('fs').promises;

(async () => {
  let cookieFile = 'cookies.json'
  let url = 'https://www.redfin.com/CA/Beverly-Hills/1441-Angelo-Dr-90210/home/143179574'

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  //await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36');

  readCookies(cookieFile, page)

  await page.goto(url)
  await page.waitForTimeout(3000);

  writeCookies(cookieFile, await page.cookies())

  const price = await page.evaluate(() => {

    let price = document.querySelectorAll('[data-rf-test-id="abp-homeinfo-homemainstats"] .statsValue')
    if(price.length < 1){
      console.error('failed to fetch price')
    }
    
    return price[0].innerHTML
  })

  //await page.screenshot({ path: 'screenshot.png', fullPage: true });

  if(price === false){
    console.log('error!')
  }else{
    console.log(price)
  }

  await browser.close()
})()

async function writeCookies(cookieFile, pageCookies){
  if(pageCookies.length < 1){
    return;
  }
  pageCookies.sort((a, b) => a.name.localeCompare(b.name));
  try{
    await fs.writeFile(cookieFile, JSON.stringify(pageCookies))
  }catch(error){
    console.log('error writing cookie file')
  }
    
}

async function readCookies(cookieFile, page){
  let cookies = false;
  try{
    cookies = await fs.readFile(cookieFile, "binary")
  }catch(err){
    console.log('error reading cookie file')
  }

  if(cookies === false){
    console.log('no existing cookies')
    return
  }
  if(cookies.length < 1){
    console.log('empty saved cookies file')
    return
  }

  let storedCookies
  try{
    storedCookies = JSON.parse(cookies)
  }catch(err){
    console.log('empty or invalid saved cookies')
    return
  }
  page.setCookie(...storedCookies)
  console.log('using saved cookies')
    
}
