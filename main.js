import express from "express";
import { config, logger, commandCache } from "./lib/deps.js";
import "./lib/time.js";
import "./lib/set.js";
import "./lib/dictionary.js";
import "./lib/urbandictionary.js";
import "./lib/google.js";

const app = express();
const port = config.get("port") || 8980;

commandCache.forEach(cmd => cmd.register(app));

app.listen(port, () => logger.info(`Listening on ${config.get("host")}:${port}`));
