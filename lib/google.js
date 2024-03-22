import { Command, googleSearch } from "./deps.js";

new Command({
    command: "g",
    security: {
        minLevel: 4,
    },
    help: {
        description: "!g lets you google things.",
        syntax: "!g [search terms]",
        example: "!g big booty bitches"
    },
    args: {
        num: 2,
        regex: /(.*)/
    },
    callback: async function (input) {
        const results = await googleSearch(input.args[1]);
        if (!results || results.notFound)
            return input.replyTo(`Google couldn't find "${input.args[1]}`);
        input.replyTo(`${results.items[0].title} ~ ${results.items[0].url} ~ ${results.items[0].content}`);
    }
});
