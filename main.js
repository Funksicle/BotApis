import express from "express";
import {
    config,
    jackieVarTime,
    jackieTime,
    jackieTz,
    jackieVarCurrency,
    jackieOpenWeather,
    jackieDictionary,
    jackieUrbanDictionary,
    jackieSetValue
} from "./lib/deps.js";

const app = express();

jackieDictionary.register(app);
jackieUrbanDictionary.register(app);
jackieVarTime.register(app);
jackieTime.register(app);
jackieTz.register(app);
jackieOpenWeather.register(app);
jackieVarCurrency.register(app);
jackieSetValue.register(app);

app.listen(config.get("port"), function () {
    console.log(`Listening on port ${config.get("port")}`);
});