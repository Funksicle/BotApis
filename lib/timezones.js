import { readFileSync } from "./deps.js";

const timezones = JSON.parse(readFileSync("data/timezones.json"));

export function getValidTimezone(timezone) {
    const tz = timezone.toLowerCase();
    for (let i = 0; i < timezones.length; i++)
        if (timezones[i].toLowerCase() === tz)
            return timezones[i];
}

export function findSimilarTimezones(searchTerm) {
    let similar = [];
    const st = searchTerm.toLowerCase();
    for (let i = 0; i < timezones.length; i++) {
        const tz = timezones[i].toLowerCase();
        if (tz.includes(st))
            similar.push(timezones[i]);
    }
    return similar;
}

export function setTimezone(channelVariables, timezone) {
    if (!timezone) {
        const tz = channelVariables.get("timezone");
        if (!tz)
            return "You need to provide a valid IANA timezone code. For example, Thailand's timezone is \"Asia/Bangkok\", and not simply \"Thailand\". Others are sometimes just the country name, like Japan. Google it!";
        return `The timezone is currently set to ${tz}.`;
    }
    const tz = getValidTimezone(timezone);
    if (tz) {
        channelVariables.set("timezone", tz);
        return `The timezone was set to ${tz}.`;
    } // wasn't valid, return a search or tell them to google
    const similarTimezones = findSimilarTimezones(timezone);
    if (similarTimezones.length)
        return `"${timezone}" isn't a valid IANA timezone code, you may need to google. Here's a list that contained "${timezone}": ${similarTimezones.join(", ")}`;
    return `"${timezone}" is not a valid IANA timezone code, please google it. Thank you come again.`;
}