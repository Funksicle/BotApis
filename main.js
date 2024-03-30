import { commandCache, config, TurtleServer } from "./lib/deps.js";
import "./lib/time.js";
import "./lib/set.js";
import "./lib/dictionary.js";
import "./lib/urbandictionary.js";
import "./lib/google.js";
// import "./lib/aichat.js";

const turtleServer = new TurtleServer(config.get("port"));

commandCache.forEach(turtleServer.register);
