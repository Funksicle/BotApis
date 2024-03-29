import { ChannelVariables, getValidTimezone, findSimilarTimezones, Command, logger } from "./deps.js";

function getTime(timeZone) {
    return new Intl.DateTimeFormat("en-US", { timeStyle: "short", timeZone }).format(new Date());
}

new Command({
    command: "timezone",
    help: {
        description: "!timezone allows you to add, remove or set default timezones to show when !time is used.",
        syntax: "!timezone [add/remove/default/list] [[name] [[IANA TimeZone code]]] - if the name has spaces, surround it in quotes.",
        example: "!timezone add Funk Australia/Perth, !timezone add Gizmo Europe/London, !timezone remove Funk, !timezone list, !timezone default Gizmo - default is used to show that time first in the list."
    },
    args: {
        num: 3,
        regex: [
            /(add) "([^"]+)" ([^ ]+)/i,     // add "Western Australia" Australia/Perth
            /(add) '([^']+)' ([^ ]+)/i,     // add 'Western Australia' Australia/Perth
            /(add) ([^ ]+) ([^ ]+)/i,       // add India Asia/Kolkata
            /(default|remove) "([^"]+)"/i,  // remove "Western Australia"
            /(default|remove) '([^']+)'/i,  // remove 'Western Australia'
            /(default|remove) ([^ ]+)/i,    // remove India
            /(default|list)/i               // default, list
        ]
    },
    callback: function (input) {
        try {
            if (!input.args || !input.args.length)
                return input.replyTo(`How bored are you, testing this again? ${this.help.message()}`);
            const tzDB = new ChannelVariables(input.channel, "timezones");
            const [ command, location, tz ] = [ input.args[1].toLowerCase(), input.args[2], input.args[3] ];
            switch (command) {
            case "add": {
                const timeZone = getValidTimezone(tz);
                if (!timeZone)
                    return input.reply(`"${tz}" isn't a valid IANA timezone code, you may need to google. Here's a list that contained "${tz}": ${findSimilarTimezones(tz).join(", ")}`);
                tzDB.set(location, { location, tz, default: false }, true);
                return input.reply(`Set ${location}'s timezone to ${timeZone}.`);
            }
            case "remove": {
                const timeZone = tzDB.get(location, true);
                if (!timeZone)
                    return input.reply(`There is no "${location}" timezone set.`);
                tzDB.remove(location, true);
                return input.reply(`Removed ${location} from the timezones list.`);
            }
            case "default": {
                const timeZone = tzDB.get(location, true);
                if (!timeZone)
                    return input.reply(`There is no "${location}" timezone to be set as default.`);
                // set all the others to false
                const timeZones = tzDB.getAll();
                for (const tz in timeZones)
                    timeZones[tz].default = false;
                timeZone.default = true;
                tzDB.set(location, timeZone, true);
                return input.reply(`Set ${location} as the default timezone.`);
            }
            case "list": {
                const sortedByDefault = arr => arr.sort((a, b) => (!a.default && b.default) ? 1 : (!b.default && a.default) ? -1 : 0);
                const timeZones = tzDB.getAll();
                const tzList = sortedByDefault(Object.keys(timeZones).map(tz => timeZones[tz]));
                const list = {};
                for (let i = 0; i < tzList.length; i++) {
                    const tz = tzList[i];
                    list[tz.tz] = list[tz.tz] || [];
                    list[tz.tz].push(tz.location);
                }
                return input.reply(Object.keys(list).map(tz => `${list[tz].join(", ")} -> ${getTime(tz)}`).join(" - "));
            }
            }
        } catch (err) {
            logger.error(`Error in !${this.command} command -`, err);
        }
    }
});

new Command({
    command: "time",
    help: {
        description: "!time shows you the time in all of the timezones you've added with !timezone",
        example: "!time"
    },
    callback: function (input) {
        try {
            const tzDB = new ChannelVariables(input.channel, "timezones");
            const sortedByDefault = arr => arr.sort((a, b) => (!a.default && b.default) ? 1 : (!b.default && a.default) ? -1 : 0);
            const timeZones = tzDB.getAll();
            if (!Object.keys(timeZones).length)
                return input.reply(`There are no timezones set, add some! See !help timezone`);
            const tzList = sortedByDefault(Object.keys(timeZones).map(tz => timeZones[tz]));
            const list = {};
            for (let i = 0; i < tzList.length; i++) {
                const tz = tzList[i];
                list[tz.tz] = list[tz.tz] || [];
                list[tz.tz].push(tz.location);
            }
            input.reply(Object.keys(list).map(tz => `${list[tz].join(", ")} -> ${getTime(tz)}`).join(" - "));
        } catch (err) {
            logger.error(`Error in !${this.command} command -`, err);
        }
    }
});
