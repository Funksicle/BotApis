// set variables through botrix fetch requests
// eg. !set timezone Asia/Kolkata
import { Route } from "./route.js";
import { uservariables } from "./uservariables.js";

export const jackieSetValue = new Route("/jackieset", async function (req, res) {
    try {
        if (req.query["request"] === undefined)
            return res.end("Usage: !set variable value - eg. !set timezone Asia/Kolkata");
        const request = req.query["request"];
        if (!request.includes(" ")) { // someone did !set variable, with no arg, so show them the contents if it exists
            const variable = uservariables.sanitisedGet(request);
            if (variable !== undefined)
                return res.end(`The "${request}" variable contains: ${variable}`);
            return res.end(`There is no "${request}" variable set.`);
        }
        const [ key, value ] = [ request.slice(0, request.indexOf(" ")), request.slice(request.indexOf(" ")+1) ];
        uservariables.sanitisedSet(key, value);
        res.end(`"${key}" was set to: ${value}`);
    } catch (err) {
        console.error(err);
    }
});