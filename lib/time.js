import { webfetch } from "./web.js";
import { Route } from "./route.js";
import { uservariables } from "./uservariables.js";

export const jackieTime = new Route("/jackietime", async function (req, res) {
    try {
        if (req.query["tz"] === undefined || req.query["field"] === undefined)
            return console.error("No fields specified.");
        const location = req.query["tz"];
        const timeResponse = await webfetch(`https://timeapi.io/api/Time/current/zone?timeZone=${location}`);
        const json = JSON.parse(timeResponse);
        const date = new Date(Date.parse(json["dateTime"]));
        const field = req.query["field"];
        if (field === "dateTime")
            return res.end(`${json[field].split("T")[0]}, ${date.toLocaleTimeString()}`);
        if (field === "ampm")
            return res.end(date.toLocaleTimeString());
        if (json[field] !== undefined)
            return res.end(json[field]);
        const formattedDate = `${json.date} ${json.time}`
        res.end(formattedDate);
    } catch (err) {
        console.error(err);
    }
});

// same but use time from our uservariable
export const jackieVarTime = new Route("/jackievartime", async function (req, res) {
    try {
        const timezone = uservariables.get("timezone");
        if (!timezone)
            return res.end("You need to set the timezone - !set timezone Asia/Kolkata, for example. The API uses IANA Timezone codes so you need to google which one applies.");
        const timeResponse = await webfetch(`https://timeapi.io/api/Time/current/zone?timeZone=${timezone}`);
        const location = uservariables.get("location");
        const time = new Date(Date.parse(JSON.parse(timeResponse)["dateTime"])).toLocaleTimeString();
        if (location)
            return res.end(`It is ${time} in ${location}.`);
        return res.end(`It is ${time}.`);
    } catch (err) {
        console.error(err);
    }
});