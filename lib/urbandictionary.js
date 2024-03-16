// http://api.urbandictionary.com/v0/define?term=

import { Route } from "./route.js";
import { webfetch } from "./web.js";

function sortByThumbsUp(results) {
    let best = 0;
    let result;
    for (let i = 0; i < results.length; i++) {
        const thumbs = results[i]["thumbs_up"];
        if (thumbs > best) {
            best = thumbs;
            result = results[i];
        }
    }
    return result;
}

function sanitise(text) {
    return text.replace(/\n|\r\n|\t/g, " ");
}

export const jackieUrbanDictionary = new Route("/jackieurbandictionary", async function (req, res) {
    try {
        if (req.query["term"] === undefined)
            return console.error("No word provided to look up.");
        const json = JSON.parse(await webfetch(`http://api.urbandictionary.com/v0/define?term=${req.query["term"]}`));
        if (!json["list"].length)
            return res.end(`There is no entry for "${req.query["term"]}".`);
        const result = sortByThumbsUp(json["list"]);
        res.end(`${result.word}: ${sanitise(result.definition)} - example: ${sanitise(result.example)}`);
    } catch (err) {
        console.error(err);
    }
});