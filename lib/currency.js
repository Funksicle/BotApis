import { config } from "./config.js";
import { webGet } from "./web.js";
import { DB } from "./db.js";

const currencies = new DB("currencies");

function getCurrency(code) {
    const currency = currencies.get(code.toUpperCase());
    return currency;
}

function isSupportedCurrency(code) {
    if (currencies.get(code.toUpperCase()) !== undefined)
        return true;
    return false;
}

function pluralOrNah(currency, n) {
    if (n === "1.00")
        return `${currency.symbol}${n} ${currency.name}`
    return `${currency.symbol}${n} ${currency.name_plural}`;
}

function prettyLine(response) {
    const index = response.lastIndexOf(", ");
    return `${response.slice(0, index)} or ${response.slice(index+2)}.`;
}

export class JackieCurrency {
    constructor() {
        this.route = "/jackiecurrency";
    }
    async callback(req, res) {
        try {
            // show results in AUD, GBP, USD, EUR and INR
            if (!isSupportedCurrency(req.query["from"]))
                return res.end(`${req.query["from"]} isn't a supported currency. Supported currency codes: ${currencies.getKeys(true)}`)
            const convertFrom = getCurrency(req.query["from"]);
            const amount = req.query["amount"] || 1;
            const result = JSON.parse(await webGet(`https://api.freecurrencyapi.com/v1/latest?apikey=${config.get("currencyapi_key")}&currencies=USD,INR,AUD,GBP,EUR&base_currency=${convertFrom.code}`));
            let response = `${pluralOrNah(convertFrom, amount)} is equal to `;
            for (const cur in result.data) {
                if (cur === convertFrom.code)
                    continue;
                const currency = currencies.get(cur);
                const converter = result.data[cur];
                const convertedAmount = (amount * converter).toFixed(currency.decimal_digits);
                response += `${pluralOrNah(currency, convertedAmount)}, `;
            }
            res.end(prettyLine(response.slice(0, -2)));
        } catch (err) {
            console.error(err);
        }
    }
}