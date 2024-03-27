import { Command, setConvertTo, setTimezone, setCurrency, setWeatherLocation, ChannelVariables } from "./deps.js";

new Command({
    command: "set",
    help: {
        description: "!set allows you to set user defined variables that other commands access.",
        syntax: "!set [variable] [value]",
        example: "!set currency JPY, !set convert USD,INR,AUD,GBP,EUR, !set weather Delhi, India"
    },
    args: {
        num: 2,
        regex: /([a-zA-Z0-9]+) ?(.*)?/
    },
    callback: async function (input) {
        try {
            const channelVariables = new ChannelVariables(input.channel);
            const [ key, value ] = [ input.args[1], input.args[2] ];
            switch(key.toLowerCase()) {
            case "timezone":
                return input.replyTo(setTimezone(channelVariables, value));
            case "weather":
                return input.replyTo(await setWeatherLocation(channelVariables, value));
            case "currency":
                return input.replyTo(setCurrency(channelVariables, value));
            case "convert":
                return input.replyTo(setConvertTo(channelVariables, value));
            default:
                if (!value) {
                    const userVar = channelVariables.get(key, true);
                    if (!userVar)
                        return input.replyTo(`There is no "${key}" variable set.`);
                    return input.replyTo(`The "${key}" variable contains: ${userVar}`);
                }
                channelVariables.set(key, value, true);
                input.replyTo(`The "${key}" variable was set to: ${value}`);
            }
        } catch (err) {
            logger.error(`Error in !${this.command} command -`, err);
        }
    }
});
