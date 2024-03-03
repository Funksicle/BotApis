import { webfetch } from "./web.js";
import { Route } from "./route.js";

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