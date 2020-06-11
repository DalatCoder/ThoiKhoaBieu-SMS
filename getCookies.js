const fs = require("fs").promises;
const puppeteer = require("puppeteer-core");
require("dotenv").config();

const url = "http://online.dlu.edu.vn/Login";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle0",
  });
  console.log("Page loaded!!!");

  await page.type("#txtTaiKhoan", process.env.ID);
  await page.type("#txtMatKhau", process.env.PASS);
  await page.click(`input[type="submit"]`);

  const cookies = await page.cookies();
  await fs.writeFile("./cookies.json", JSON.stringify(cookies, null, 2));
  console.log("Cookies saved!!!");

  await browser.close();
})().catch((err) => console.log(err));
