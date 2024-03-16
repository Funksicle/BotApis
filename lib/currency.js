import { config } from "./config.js";
import { webfetch } from "./web.js";
import { DB } from "./db.js";
import { Route } from "./route.js";

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
    if (index === -1)
        return `${response}.`;
    return `${response.slice(0, index)} or ${response.slice(index+2)}.`;
}

function validCurrencyOrDefaults(currencyCodes = "USD,INR,AUD,GBP,EUR") {
    // silently remove any currencies we don't support
    const codes = currencyCodes.split(",");
    let valid = "";
    for (let i = 0; i < codes.length; i++) {
        const code = codes[i].toUpperCase();
        const currency = currencies.get(code);
        if (currency !== undefined)
            valid += `${code},`;
    }
    return valid.slice(0,-1);
}

export const jackieCurrency = new Route("/jackiecurrency", async function (req, res) {
    try {
        if (!isSupportedCurrency(req.query["from"]))
            return res.end(`${req.query["from"]} isn't a supported currency. Supported currency codes: ${currencies.getKeys(true)}`)
        const validCurrencies = validCurrencyOrDefaults(req.query["to"]);
        const convertFrom = getCurrency(req.query["from"]);
        const amount = req.query["amount"] || 1;
        const result = JSON.parse(await webfetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${config.get("currencyapi_key")}&currencies=${validCurrencies}&base_currency=${convertFrom.code}`));
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
});