import express from "express";
import { config } from "./lib/config.js";
import { jackieTime } from "./lib/time.js";
import { jackieCurrency } from "./lib/currency.js";
import { jackieDictionary } from "./lib/dictionary.js";

const app = express();

jackieDictionary.register(app);
jackieTime.register(app);
jackieCurrency.register(app);

app.listen(config.get("port"), function () {
    console.log(`Listening on port ${config.get("port")}`);
});