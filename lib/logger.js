const ts = () => {
    const time = new Date().toLocaleTimeString().toUpperCase();
    const pad = time.indexOf(":") === 1 ? "0" : "";
    return `${logger.colour.darkGrey}[${logger.colour.blue}${pad}${time}${logger.colour.darkGrey}]${logger.colour.reset}`;
}

const colourType = (type) => {
    switch (type) {
    case "RECV":
        return `${logger.colour.green}${logger.colour.bold}${type}${logger.colour.reset}`;
    case "SEND":
        return `${logger.colour.magenta}${logger.colour.italics}${logger.colour.bold}${type}${logger.colour.reset}`;
    case "ERR":
        return `${logger.colour.red}${logger.colour.bold}${type}${logger.colour.reset}`;
    default:
        return `${logger.colour.grey}${logger.colour.bold}${type}${logger.colour.reset}`;
    }
}

const log = (type, text, error) => {
    const line = `${ts()} ${logger.colour.darkGrey}[${colourType(type)}${logger.colour.darkGrey}]${logger.colour.white} ${text}`;
    if (type === " ERR")
        return console.error(line, error);
    if (typeof text === "object")
        return console.log(`${ts()} Object:`, text);
    console.log(line);
};

export const logger = {
    colour: {
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
    },
    info: text => log("INFO", text),
    error: (text, err) => log(" ERR", text, err),
    warn: text => log("WARN", text),
    debug: text => log("DEBG", text),
    send: text => log("SEND", text),
    recv: text => log("RECV", text)
};
