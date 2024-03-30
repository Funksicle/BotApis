import { Command, webfetch, logger } from "./deps.js";

function prepareDefinition(meanings) {
    let resp = "";
    for (let i = 0; i < meanings.length; i++) {
        const meaning = meanings[i];
        resp += `[${meaning.partOfSpeech}] ${meaning.definitions[0].definition} - `;
    }
    return resp.slice(0, -3);
}

new Command({
    command: "define",
    help: {
        description: "!define lets you look up words in a basic dictionary",
        syntax: "!define [word]",
        example: "!define butt"
    },
    args: {
        num: 1,
        regex: /([a-zA-Z]+)/
    },
    callback: async function (input) {
        try {
            const json = JSON.parse(await webfetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${input.args[1]}`));
            if (json.title !== undefined)
                return input.replyTo(json.title);
            input.replyTo(prepareDefinition(json[0].meanings));
        } catch (err) {
            logger.error(`Error in !${this.command} command -`, err);
        }
    }
});
