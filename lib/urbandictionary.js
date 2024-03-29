import { Command, webfetch, logger } from "./deps.js";

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
        .replace(/\n\r|\n|  /g, " ")
        .replace(/\[|\]/g, "");
    return response;
}

new Command({
    command: "ud",
    help: {
        description: "!ud looks up words or phrases on UrbanDictionary. Be careful, it returns UNFILTERED user supplied content.",
        syntax: "!ud [word or phrase]",
        example: "!ud seppo"
    },
    args: {
        num: 2,
        regex: /(.*)/
    },
    callback: async function (input) {
        try {
            const json = JSON.parse(await webfetch(`http://api.urbandictionary.com/v0/define?term=${input.args[1]}`));
            if (!json["list"].length)
                return input.replyTo(`There is no entry for "${input.args[1]}".`);
            const result = findHighestThumbsUp(json["list"]);
            const definition = sanitise(result.definition);
            // don't bother adding an example in if the definition is huge
            const example = result.example.length > 0 && definition.length < 350 ? ` - example: ${sanitise(result.example)}` : "";
            const response = `${result.word}: ${definition}${example}`.replace(/  /g, " ");
            input.replyTo(response.length > 499 ? response.slice(0, 499) : response);
        } catch (err) {
            logger.error(`Error in !${this.command} command -`, err);
        }
    }
});
