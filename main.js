import express from "express";
import { config } from "./lib/config.js";
import { JackieTime } from "./lib/time.js";
import { JackieCurrency } from "./lib/currency.js";

const app = express();
const jackieTime = new JackieTime();
const jackieCurrency = new JackieCurrency();

app.get(jackieTime.route, jackieTime.callback);
app.get(jackieCurrency.route, jackieCurrency.callback);

app.listen(config.get("port"), function () {
    console.log(`Listening on port ${config.get("port")}`);
});