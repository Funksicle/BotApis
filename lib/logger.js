const colour = {
    white: "\x1b[97m",
    darkGrey: "\x1b[90m",
    grey: "\x1b[37m",
    red: "\x1b[91m",
    green: "\x1b[92m",
    yellow: "\x1b[93m",
    blue: "\x1b[94m",
    magenta: "\x1b[95m",
    cyan: "\x1b[96m",
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    light: "\x1b[2m",
    italics: "\x1b[3m",
    underline: "\x1b[4m"
};

const ts = () => `${colour.darkGrey}[${colour.blue}${new Date().toLocaleTimeString()}${colour.darkGrey}]${colour.reset}`;

const colourType = (type) => {
    switch (type) {
    case "RECV":
        return `${colour.green}${colour.bold}${type}${colour.reset}`;
    case "SEND":
        return `${colour.magenta}${colour.italics}${colour.bold}${type}${colour.reset}`;
    case "ERR":
        return `${colour.red}${colour.bold}${type}${colour.reset}`;
    default:
        return `${colour.grey}${colour.bold}${type}${colour.reset}`;
    }
}

const log = (type, text, error) => {
    const line = `${ts()} ${colour.darkGrey}[${colourType(type)}${colour.darkGrey}]${colour.white} ${text}`;
    if (type === " ERR")
        return console.error(line, error);
    if (typeof text === "object")
        return console.log(`${ts()} Object:`, text);
    console.log(line);
};

export const logger = {
    info: text => log("INFO", text),
    error: (text, err) => log(" ERR", text, err),
    warn: text => log("WARN", text),
    debug: text => log("DEBG", text),
    send: text => log("SEND", text),
    recv: text => log("RECV", text)
};
