import { config, logger } from "./deps.js";

const ARGUMENT_ERRORS = {
    REGEX: "Incorrect syntax"
};

const helpCache = {};
export const commandCache = [];

class Help {
    constructor(command, helpOptions) {
        this.command = helpOptions.command;
        this.description = helpOptions.description;
        this.example = helpOptions.example;
        this.syntax = helpOptions.syntax;
        helpCache[command] = this;
    }
    message(err) {
        const error = err ? `${err} ~ ` : "";
        const syntax = this.syntax ? ` Syntax: ${this.syntax}` : "";
        const example = this.example ? ` Example: ${this.example}` : "";
        return `${error}${this.description}${syntax}${example}`;
    }
}

class CommandArguments {
    constructor(argOptions) {
        if (!argOptions)
            return;
        this.num = argOptions.num; // num is a MAXIMUM amount of args, used to inform the endpoint creator about whether to use v1 or variable
        this.regex = argOptions.regex;
    }
    parse(input, args) {
        if (!args || !args.length || !this.num)
            return;
        if (this.regex === undefined) {
            input.args = args.split(" ");
            return;
        }
        let reg;
        if (!Array.isArray(this.regex)) {
            reg = this.regex.exec(args);
            if (!reg)
                input.error = ARGUMENT_ERRORS.REGEX;
            else
                input.args = reg;
            return;
        }
        for (let i = 0; i < this.regex.length; i++) {
            reg = this.regex[i].exec(args);
            if (!reg)
                continue;
            input.args = reg;
            return;
        } // no matches, must be wrong syntax
        input.error = ARGUMENT_ERRORS.REGEX;
    }
}

function trimLength(text) {
    if (text.length > 500)
        return `${text.slice(0, 496)}...`;
    return text;
}

class Input {
    constructor(req, res, args) {
        this._req = req;
        this._res = res;
        this.channel = req.query["channel"];
        this.sender = req.query["sender"];
        this.level = req.query["level"];
        if (args)
            args.parse(this, req.query["args"]);
    }
    reply(text) {
        const trimmedText = trimLength(text);
        logger.send(`[#${this.channel}] -> ${trimmedText}`);
        this._res.end(trimmedText);
    }
    replyTo(text) {
        const trimmedText = trimLength(text);
        logger.send(`[#${this.channel}] -> ${trimmedText}`);
        this._res.end(`@${this.sender} ${trimmedText}`);
    }
}

export class Command {
    constructor(commandOptions) {
        this.command = commandOptions.command;
        this.help = new Help(this.command, commandOptions.help);
        this.args = new CommandArguments(commandOptions.args);
        this.callback = commandOptions.callback;
        this.path = `/jackie${this.command}`;
        this._createEndpoint();
        commandCache.push(this);
    }
    _createEndpoint() {
        const port = config.get("port") === 80 ? "" : `:${config.get("port")}`;
        const args = !this.args || !this.args.num ? "" : this.args.num > 1 ? "&args=$(variable)" : "&args=$(v1)";
        this.endpoint = `${config.get("host")}${port}${this.path}?channel=$(channel)&sender=$(sender)&level=$(level)${args}`;
    }
    register(app) {
        app.get(this.path, this.cb);
        logger.info(`Registered the ${this.command} command!\n   !addcom ${this.command} fetch[${this.endpoint}]`);
    }
    cb = (req, res) => { // arrow function to get around this/that fuckery
        try {
            const input = new Input(req, res, this.args);
            logger.recv(`[#${input.channel}] <@${input.sender}> !${this.command} ${input.args ? input.args[0] : ""}`);
            if (input.error)
                return input.replyTo(this.help.message(input.error));
            this.callback(input);
        } catch (err) {
            logger.error(`Error in ${this.command}`, err);
        }
    }
}

new Command({
    command: "help",
    help: { description: "!help provides command usage information.", example: "!help timezone" },
    args: { num: 1, regex: /([a-zA-Z]+)/ },
    callback: function (input) {
        if (!input.args || !input.args.length) // must be testing, botrix wont allow this
            return input.replyTo("What? You can't do no args.");
        const command = input.args[1].toLowerCase();
        if (!helpCache[command])
            return input.replyTo(`There is no "${input.args[1]}" command, available commands: ${Object.keys(helpCache).join(", ")}`);
        input.replyTo(helpCache[command].message());
    }
});
