import { webfetch, Route, DB, uservariables, getValidTimezone, findSimilarTimezones } from "./deps.js";

const customTimeZones = new DB("customtimezones");

function getTime(timeZone) {
    return new Intl.DateTimeFormat("en-US", { timeStyle: "short", timeZone }).format(new Date());
}

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
        const timeZone = uservariables.get("timezone");
        if (!timeZone)
            return res.end("You need to set the timezone - !set timezone Asia/Kolkata, for example. The API uses IANA Timezone codes so you need to google which one applies.");
        const location = uservariables.get("location");
        if (location)
            return res.end(`It is ${getTime(timeZone)} in ${location}.`);
        return res.end(`It is ${getTime(timeZone)}.`);
    } catch (err) {
        console.error(err);
    }
});

// !tz add India Asia/Kolkata (location, IANA TimeZone)
// !tz remove India
// !tz default India <- how to determine Jackie's TZ
// !tz list
const tzCommand = {
    "add": (location, tz) => {
        const timeZone = getValidTimezone(tz);
        if (!timeZone)
            return `"${tz}" isn't a valid IANA timezone code, you may need to google. Here's a list that contained "${tz}": ${findSimilarTimezones(tz).join(", ")}`;
        customTimeZones.set(location, { location, tz, default: false }, true);
        return `Set ${location}'s timezone to ${timeZone}.`;
    },
    "remove": (location) => {
        const timeZone = customTimeZones.get(location, true);
        if (!timeZone)
            return `There is no "${location}" timezone set.`;
        customTimeZones.remove(location, true);
        return `Removed ${location} from the timezones list.`;
    },
    "default": (location) => {
        const timeZone = customTimeZones.get(location, true);
        if (!timeZone)
            return `There is no "${location}" timezone to be set as default.`;
        // set all the others to false
        const timeZones = customTimeZones.getAll();
        for (const tz in timeZones)
            timeZones[tz].default = false;
        timeZone.default = true;
        customTimeZones.set(location, timeZone, true);
        return `Set ${location} as the default timezone.`;
    },
    "list": () => {
        const sortedByDefault = arr => arr.sort((a, b) => (!a.default && b.default) ? 1 : (!b.default && a.default) ? -1 : 0);
        const timeZones = customTimeZones.getAll();
        const tzList = sortedByDefault(Object.keys(timeZones).map(tz => timeZones[tz]));
        const list = {};
        for (let i = 0; i < tzList.length; i++) {
            const tz = tzList[i];
            list[tz.tz] = list[tz.tz] || [];
            list[tz.tz].push(tz.location);
        }
        console.log(list);
        return Object.keys(list).map(tz => `${list[tz].join(", ")} -> ${getTime(tz)}`).join(" - ");
    }
};

export const jackieTz = new Route("/jackietz", function (req, res) {
    function findArguments(line) {
        const quoteReg = /([^ ]+) "([^"]+)" ?(.*)?/;
        const singleQuoteReg = /([^ ]+) '([^']+)' ?(.*)?/;
        const normalReg = /([^ ]+) ([^ ]+) ?(.*)?/;
        const reg = quoteReg.exec(line) || singleQuoteReg.exec(line) || normalReg.exec(line);
        if (!reg)
            throw new Error(`"${line}" didn't match any of the regexes.`);
        return [ reg[1].toLowerCase(), reg[2], reg[3] ];
    }

    try {
        if (!req.query["args"])
            return res.end("Arguments required: [add/remove/default/list] [alias] [[timezone]]")
        if (req.query["args"].toLowerCase() === "list")
            return res.end(tzCommand["list"]());
        const [ command, location, tz ] = findArguments(req.query["args"]);
        res.end(tzCommand[command](location, tz));
    } catch (err) {
        console.error(err);
        res.end(`Huh? What's a "${req.query["args"]}"?`);
    }
});