import { createServer } from "node:http";
import { logger } from "./deps.js";

export class TurtleServer {
    constructor(port) {
        this.paths = {};
        this.port = port;
        this.server = createServer(this._requestHandler).listen(this.port);
    }
    get(path, callback) {
        this.paths[path] = callback;
    }
    register = (cmd) => {
        this.paths[cmd.path] = cmd.cb;
        logger.info(`Registered the ${logger.colour.bold}${cmd.command}${logger.colour.reset} command!\n   !editcom ${cmd.command} fetch[${cmd.endpoint}]`);
    };
    _requestHandler = (_req, res) => {
        function parseQuery(query) {
            const ret = {};
            query.split("&").map(kv => {
                const [ key, value ] = kv.split("=");
                ret[key] = value;
            });
            return ret;
        }
        const [ path, queryString ] = decodeURI(_req.url).split("?");
        const query = parseQuery(queryString);
        if (this.paths[path])
            this.paths[path](query, res);
    };
}
