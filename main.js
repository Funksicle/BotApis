import express from "express";
import { config } from "./lib/config.js";
import { jackieTime } from "./lib/time.js";
import { jackieWeather } from "./lib/weather.js";
import { jackieCurrency } from "./lib/currency.js";
import { jackieDictionary } from "./lib/dictionary.js";
import { jackieUrbanDictionary } from "./lib/urbandictionary.js";
import { jackieTesting } from "./lib/testing.js";

const app = express();

jackieDictionary.register(app);
jackieUrbanDictionary.register(app);
jackieTime.register(app);
jackieWeather.register(app);
jackieCurrency.register(app);
jackieTesting.register(app);

app.listen(config.get("port"), function () {
    console.log(`Listening on port ${config.get("port")}`);
});