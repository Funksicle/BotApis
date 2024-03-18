import { Route } from "./route.js";

export const jackieTesting = new Route("/jackietesting", async function (req, res) {
    try {
        if (req.query["request"] === undefined)
            return console.error("No request provided.");
        console.log(req.query);
    } catch (err) {
        console.error(err);
    }
});