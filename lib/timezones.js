import { readFileSync } from "fs";
import { uservariables } from "./uservariables.js";

const timezones = JSON.parse(readFileSync("data/timezones.json"));

function getValidTimezone(timezone) {
    const tz = timezone.toLowerCase();
    for (let i = 0; i < timezones.length; i++)
        if (timezones[i].toLowerCase() === tz)
            return timezones[i];
}

function findSimilarTimezones(searchTerm) {
    let similar = [];
    const st = searchTerm.toLowerCase();
    for (let i = 0; i < timezones.length; i++) {
        const tz = timezones[i].toLowerCase();
        if (tz.includes(st))
            similar.push(timezones[i]);
    }
    return similar;
}

export function setTimezone(res, timezone) {
    const tz = getValidTimezone(timezone);
    if (tz) {
        uservariables.set("timezone", tz);
        return res.end(`TimeZone was updated to "${tz}".`);
    } // wasn't valid, return a search or tell them to google
    const similarTimezones = findSimilarTimezones(timezone);
    if (similarTimezones.length)
        return res.end(`"${timezone}" isn't a valid IANA timezone code, you may need to google. Here's a list that contained "${timezone}": ${similarTimezones.join(", ")}`);
    return res.end(`"${timezone}" is not a valid IANA timezone code, please google it. Thank you come again.`);
}