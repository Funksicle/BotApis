import express from "express";
import { config } from "./lib/config.js";
import { jackieTime, jackieVarTime } from "./lib/time.js";
import { jackieWeather } from "./lib/weather.js";
import { jackieCurrency, jackieVarCurrency } from "./lib/currency.js";
import { jackieDictionary } from "./lib/dictionary.js";
import { jackieUrbanDictionary } from "./lib/urbandictionary.js";
import { jackieSetValue } from "./lib/set.js";

const app = express();

jackieDictionary.register(app);
jackieUrbanDictionary.register(app);
jackieTime.register(app);
jackieVarTime.register(app);
jackieWeather.register(app);
jackieCurrency.register(app);
jackieVarCurrency.register(app);
jackieSetValue.register(app);

app.listen(config.get("port"), function () {
    console.log(`Listening on port ${config.get("port")}`);
});