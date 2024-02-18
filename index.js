import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import { scheduleJob } from 'node-schedule';
import * as PImage from "pureimage";
import * as fs from "fs";
import { load } from 'cheerio';
const token = '6859608057:AAG3EZftJueg75tl_CqCGZ6DvyKSW4q2PQA';

const url = 'https://myfin.by/currency/gomel';
const ID = -1002024472497;


const bot = new TelegramBot(token, { polling: true });
const path = "out.png";
var fnt = PImage.registerFont(
    "ss-m.ttf",
    "Source Sans Pro",
);
fnt.loadSync();

scheduleJob({ second: 10 }, async () => {

    const img1 = PImage.make(1920, 1080);

    const ctx = img1.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1920, 1080);

    ctx.fillStyle = "#000000";
    ctx.font = "48pt 'Source Sans Pro'";
    ctx.lineWidth = 5;

    const rows = await getData();

    ctx.fillText('Банк', 50, 50)
    ctx.fillText('Покупает', 800, 50)
    ctx.fillText('Продает', 1600, 50)

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(100, 50);
    ctx.stroke();

    ctx.font = "36pt 'Source Sans Pro'";
    rows.forEach(({ bank, usdBuy, usdSell }, index) => {
        ctx.fillText(bank, 50, 50 * (index + 2))
        ctx.fillText(String(usdBuy), 800, 50 * (index + 2))
        ctx.fillText(String(usdSell), 1600, 50 * (index + 2))
    })

    await PImage.encodePNGToStream(img1, fs.createWriteStream(path))
    bot.sendPhoto(ID, path);

})

async function getData() {
    try {
        const { data } = await axios.get(url);
        const $ = load(data);

        const table = $('[data-row-type="default"]').map((_, el) => {
            const [bank, usdBuy, usdSell, eurBuy, eurSell, rubBuy, rubSell] = $(el).children().map((i, el) => $(el).text()).get()
            return { bank: bank.trim(), usdSell: parseFloat(usdSell), usdBuy: parseFloat(usdBuy), eurSell: parseFloat(eurSell), eurBuy: parseFloat(eurBuy), rubSell: parseFloat(rubSell), rubBuy: parseFloat(rubBuy) };
        }).get();
        table.sort((a, b) => a.usdSell - b.usdSell)

        return table
    } catch (error) {
        console.error(`Error fetching the URL: ${error.message}`);
    }
}
