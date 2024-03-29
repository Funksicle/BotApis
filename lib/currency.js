import { config, webfetch, DB, Command, ChannelVariables, logger } from "./deps.js";

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

function prettyCurrency(c) {
    const symbol = c.symbol !== c.code ? c.symbol : "";
    return `${symbol}${c.code} - ${c.name_plural}`;
}

export function setCurrency(channelVariables, currencyCode) {
    if (!currencyCode) {
        const currentCurrency = channelVariables.get("currency");
        if (!currentCurrency)
            return `No currency is set, set one! For example, the code for Japanese Yen is JPY, so you do !set currency JPY - supported currency codes: ${currencies.getKeys(true)}.`;
        return `The currency code is set to ${prettyCurrency(currentCurrency)}.`;
    }

    if (!isSupportedCurrency(currencyCode))
        return `"${currencyCode}" is not a supported currency code, you may need to google it. Supported currency codes: ${currencies.getKeys(true)}.`;

    const currency = getCurrency(currencyCode);
    channelVariables.set("currency", currency);
    return `The currency was set to ${prettyCurrency(currency)}.`;
}

export function setConvertTo(channelVariables, providedCurrencies) {
    const providedList = providedCurrencies.replace(/ /g, "").split(",");
    const valid = [];
    for (let i = 0; i < providedList.length; i++) {
        const currency = providedList[i];
        if (isSupportedCurrency(currency))
            valid.push(currency.toUpperCase())
    }
    if (!valid.length)
        return `None of the currencies you provided were valid. Supported currency codes: ${currencies.getKeys(true)}`;
    channelVariables.set("convert", valid.join(","));
    return `The currencies to convert to were set to ${valid.map(c => prettyCurrency(getCurrency(c))).join(", ")}`;
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

new Command({
    command: "convert",
    help: {
        description: "!convert converts one currency to a list of other currencies. Like Japanese Yen to Indian Rupees, US Dollars, and Australian Dollarydoos. See !set currency to set the current currency.",
        syntax: "!convert [amount]",
        example: "!convert 500"
    },
    args: {
        num: 1,
        regex: /([0-9]+)/ // we can let it do !convert AMOUNT CURRENCYCODE in the future, busy on other clean up right now. 2024-03-21
    },
    callback: async function (input) {
        try {
            const channelVariables = new ChannelVariables(input.channel);
            const amount = input.args[1];
            const currency = channelVariables.get("currency");
            if (!currency)
                return input.reply(`You need to !set currency [CURRENCYCODE] - eg. for Japanese Yen: !set currency JPY. Supported currency codes: ${currencies.getKeys(true)}`);
            const convertTo = channelVariables.get("convert");
            if (!convertTo)
                return input.reply(`You need to !set convert [List of currencies to convert to] - eg. !set convert USD,GBP,AUD,INR,EUR - Supported currency codes: ${currencies.getKeys(true)}`);
            const result = JSON.parse(await webfetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${config.get("currencyapi_key")}&currencies=${convertTo}&base_currency=${currency.code}`));
            let response = `${pluralOrNah(currency, amount)} is equal to `;
            for (const cur in result.data) {
                if (cur === currency.code)
                    continue;
                const c = currencies.get(cur);
                const converter = result.data[cur];
                const convertedAmount = (amount * converter).toFixed(c.decimal_digits);
                response += `${pluralOrNah(c, convertedAmount)}, `;
            }
            input.reply(prettyLine(response.slice(0, -2)));
        } catch (err) {
            logger.error(`Error in !${this.command} command -`, err);
        }
    }
});
