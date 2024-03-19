import { Route, webfetch } from "./deps.js";

function prepareDefinition(meanings) {
    let resp = "";
    for (let i = 0; i < meanings.length; i++) {
        const meaning = meanings[i];
        resp += `[${meaning.partOfSpeech}] ${meaning.definitions[0].definition} - `;
    }
    return resp.slice(0, -3);
}

export const jackieDictionary = new Route("/jackiedictionary", async function (req, res) {
    try {
        if (req.query["word"] === undefined)
            return console.error("No word provided to look up.");
        const json = JSON.parse(await webfetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${req.query["word"]}`));
        if (json.title !== undefined)
            return res.end(json.title);
        res.end(prepareDefinition(json[0].meanings));
    } catch (err) {
        console.error(err);
    }
});