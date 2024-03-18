import { config } from "./config.js";
import { webfetch } from "./web.js";
import { DB } from "./db.js";
import { Route } from "./route.js";
import { uservariables } from "./uservariables.js";

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

export function setCurrency(res, currencyCode) {
    function prettyCurrency(c) {
        const symbol = c.symbol !== c.code ? c.symbol : "";
        return `${symbol}${c.code} - ${c.name_plural}`;
    }

    if (!currencyCode) {
        const currentCurrency = uservariables.get("currency");
        if (!currentCurrency)
            return res.end(`No currency is set, set one! For example, the code for Japanese Yen is JPY, so you do !set currency JPY - supported currency codes: ${currencies.getKeys(true)}.`);
        return res.end(`The currency code is set to ${prettyCurrency(currentCurrency)}.`);
    }

    if (!isSupportedCurrency(currencyCode))
        return res.end(`"${currencyCode}" is not a supported currency code, you may need to google it. Supported currency codes: ${currencies.getKeys(true)}.`);

    const currency = getCurrency(currencyCode);
    uservariables.set("currency", currency);
    res.end(`The currency was set to ${prettyCurrency(currency)}.`);
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
    return `${response.slice(0, index)} or ${response.slice(index + 2)}.`;
}

function validCurrencyOrDefaults(currencyCodes = "USD,INR,AUD,GBP,EUR") {
    // silently remove any currencies we don't support
    const codes = currencyCodes.split(",");
    const valid = [];
    for (let i = 0; i < codes.length; i++) {
        const code = codes[i].toUpperCase();
        const currency = currencies.get(code);
        if (currency !== undefined && !valid.includes(code)) // no duplicates
            valid.push(code);
    }
    return valid.join(",");
}

export const jackieVarCurrency = new Route("/jackievarcurrency", async function (req, res) {
    try {
        const currency = uservariables.get("currency");
        if (!currency)
            return res.end(`You need to !set currency [CURRENCYCODE] - eg. for Japanese Yen: !set currency JPY. Supported currency codes: ${currencies.getKeys(true)}`);
        const validCurrencies = validCurrencyOrDefaults(req.query["to"]);
        const amount = req.query["amount"] || 1;
        if (!validCurrencies.includes(",") && validCurrencies === currency.code)
            return res.end(`Congratulations, you have converted ${amount} ${currency.name_plural} to ${amount} ${currency.name_plural} ...`);
        const result = JSON.parse(await webfetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${config.get("currencyapi_key")}&currencies=${validCurrencies}&base_currency=${currency.code}`));
        let response = `${pluralOrNah(currency, amount)} is equal to `;
        for (const cur in result.data) {
            if (cur === currency.code)
                continue;
            const c = currencies.get(cur);
            const converter = result.data[cur];
            const convertedAmount = (amount * converter).toFixed(c.decimal_digits);
            response += `${pluralOrNah(c, convertedAmount)}, `;
        }
        res.end(prettyLine(response.slice(0, -2)));
    } catch (err) {
        console.error(err);
    }
});

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