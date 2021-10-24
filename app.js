'use strict';

const puppeteer = require('puppeteer')
const fs = require('fs').promises
const cookieFile = 'cookies.json'

var cookies = false;

(async () => {

  try{
    cookies = await fs.readFile(cookieFile, "binary")
  }catch(err){
    console.log('error reading cookie file')
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36');

  if(cookies !== false){
    if(cookies.length < 1){
      console.log('empty cookies file')
      cookies = false;
    }else{
      let storedCookies
      try{
        storedCookies = JSON.parse(cookies)
      }catch(err){
        console.log('empty or invalid cookies')
        cookies = false;
      }
      page.setCookie(...storedCookies)
      console.log('setting cookies')
    }
  }else{
    console.log('no existing cookies')
  }

  await page.goto('https://www.redfin.com/CA/Beverly-Hills/1441-Angelo-Dr-90210/home/143179574')

  saveCookies(await page.cookies())

  const price = await page.evaluate(() => {

    let price = document.querySelectorAll('[data-rf-test-id="abp-homeinfo-homemainstats"] .statsValue')
    if(price.length < 1){
      console.error('failed to fetch price')
    }
    
    return price[0].innerHTML
  })

  if(price === false){
    console.log('error!')
  }else{
    console.log(price)
  }

  await browser.close()
})()

async function saveCookies(pageCookies){
    if(pageCookies.length < 1){
      return;
    }
    pageCookies.sort((a, b) => a.name.localeCompare(b.name));
    let cookieString = JSON.stringify(pageCookies)
    try{
      await fs.writeFile(cookieFile, cookieString)
    }catch(error){
      console.log('error writing cookie file')
    }
    
}