import express from "express";
import { config } from "./lib/config.js";

const app = express();

app.get("/jackietime", async function (req, res) {
    try {
        if (req.query["tz"] === undefined || req.query["field"] === undefined)
            return console.error("No fields specified.");
        const location = req.query["tz"];
        const timeResponse = await webGet(`https://timeapi.io/api/Time/current/zone?timeZone=${location}`);
        const json = JSON.parse(timeResponse);
        const field = req.query["field"];
        if (field === "dateTime") {
            res.end(json[field].split("T").join(" ").split(".")[0]);
            return;
        }
        if (json[field] !== undefined) {
            res.end(json[field]);
            return;
        }
        const formattedDate = `${json.date} ${json.time}`
        res.end(formattedDate);
    } catch (err) {
        console.log(err);
    }
});

const server = app.listen(config.get("port"), function () {
    console.log(`Listening on port ${config.get("port")}`);
});

async function webGet(url) {
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        return text;
    } catch (err) {
        console.log(err);
    }
}