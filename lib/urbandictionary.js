// http://api.urbandictionary.com/v0/define?term=

import { Route } from "./route.js";
import { webfetch } from "./web.js";

function findHighestThumbsUp(results) {
    let result;
    for (let i = 0; i < results.length; i++) {
        if (!result || results[i]["thumbs_up"] > result["thumbs_up"])
            result = results[i];
    }
    return result;
}

function sanitise(text) {
    let response = text
        .replace(/\n/g, " ")
        .replace(/\r/g, "")
        .replace(/  /g, " ")
        .replace(/\[|\]/g, "");
    return response;
}

export const jackieUrbanDictionary = new Route("/jackieurbandictionary", async function (req, res) {
    try {
        if (req.query["term"] === undefined)
            return console.error("No word provided to look up.");
        const json = JSON.parse(await webfetch(`http://api.urbandictionary.com/v0/define?term=${req.query["term"]}`));
        if (!json["list"].length)
            return res.end(`There is no entry for "${req.query["term"]}".`);
        const result = findHighestThumbsUp(json["list"]);
        const definition = sanitise(result.definition);
        // don't bother putting an example in if the definition is huge
        const example = result.example.length > 0 && definition.length < 350 ? ` - example: ${sanitise(result.example)}` : "";
        const response = `${result.word}: ${definition}${example}`.replace(/  /g, " ");
        res.end(response.length > 499 ? response.slice(0, 499) : response);
    } catch (err) {
        console.error(err);
    }
});