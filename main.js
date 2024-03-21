import express from "express";
import { config, logger, commandCache } from "./lib/deps.js";
import "./lib/time.js";
import "./lib/set.js";
import "./lib/dictionary.js";
import "./lib/urbandictionary.js";

const app = express();

commandCache.forEach(cmd => cmd.register(app));

app.listen(config.get("port"), () => logger.info(`Listening on ${config.get("host")}:${config.get("port")}`));
