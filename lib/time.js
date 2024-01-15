import { webGet } from "./web.js";

export class JackieTime {
    constructor() {
        this.route = "/jackietime";
    }
    async callback(req, res) {
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
            console.error(err);
        }
    }
}