const fs = require("fs").promises;
const path = require("path");

const puppeteer = require("puppeteer-core");

const apiURL =
  "http://online.dlu.edu.vn/Home/DrawingStudentSchedule?StudentId=1812756&YearId=2019-2020&TermId=HK02&WeekId=20&t=0.7134213324920422";

const url = "http://online.dlu.edu.vn/Home/ClassStudentSchedules";

const crawler = () => {
  const sanitizeStringInput = (str) => {
    if (str.replace(/\n/g, "").length === 0) {
      return "Được nghỉ, xõa đê!!!!!";
    }

    const phrases = str.split("\n");
    const arr = [];
    arr.push(phrases[0], phrases[3], phrases[4], phrases[6]);

    return arr.join(". ").replace(/-/g, "");
  };

  const results = [];

  const table = document.querySelector("tbody");
  console.log(table);
  const rows = Array.from(table.querySelectorAll("tr")).slice(1); // Remove the first heading row

  for (const row of rows) {
    const obj = {};

    const heading = row.querySelector("th").innerText;
    obj["day"] = heading;

    obj["schedule"] = {};
    const schedule = obj["schedule"];

    const cells = Array.from(row.querySelectorAll("td"));
    let idx = 0;
    for (let ch of ["S", "C", "T"]) {
      schedule[ch] = sanitizeStringInput(cells[idx].innerText);
      idx++;
    }

    results.push(obj);
  }

  return results;
};

async function readCookies() {
  const cookiesString = await fs.readFile("./cookies.json");
  const cookies = JSON.parse(cookiesString);

  return cookies;
}

async function getSchedule(apiURL, cookies) {
  const browser = await puppeteer.launch({
    // headless: false,
    executablePath:
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);

  await page.goto(apiURL, {
    waitUntil: "networkidle0",
  });

  const results = await page.evaluate(crawler);

  browser.close();
  return results;
}

async function writeSchedule(schedule) {
  await fs.writeFile(
    path.join(__dirname, "schedule.json"),
    JSON.stringify(schedule),
    "utf-8"
  );
}

async function main() {
  const cookies = await readCookies();
  console.log("Cookies loaded!");

  const schedule = await getSchedule(url, cookies);
  console.log(schedule);

  await writeSchedule(schedule);
  console.log("Schedule saved!");
}

main().catch((err) => console.log(err));
