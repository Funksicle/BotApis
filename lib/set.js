// set variables through botrix fetch requests
// eg. !set timezone Asia/Kolkata
import { Route } from "./route.js";
import { uservariables } from "./uservariables.js";
import { setTimezone } from "./timezones.js";
import { setCurrency } from "./currency.js";
import { setWeatherLocation } from "./openweathermap.js";

function parseInput(request) {
    const index = request.indexOf(" ");
    if (index === -1)
        return [ request ];
    return [ request.slice(0, index), request.slice(index+1) ];
}

export const jackieSetValue = new Route("/jackieset", async function (req, res) {
    try {
        if (req.query["request"] === undefined)
            return res.end("Usage: !set variable value - eg. !set timezone Asia/Kolkata");
        const [ key, value ] = parseInput(req.query["request"]);
        switch(key.toLowerCase()) {
        case "timezone":
            return setTimezone(res, value);
        case "currency":
            return setCurrency(res, value);
        case "weather":
            return setWeatherLocation(res, value);
        default:
            if (!value) {
                const userVar = uservariables.sanitisedGet(key);
                if (!userVar)
                    return res.end(`There is no "${key}" variable set.`);
                return res.send(`The "${key}" variable contains: ${userVar}`);
            }
            uservariables.sanitisedSet(key, value);
            return res.end(`The "${key}" variable was set to: ${value}`);
        }
    } catch (err) {
        console.error(err);
    }
});