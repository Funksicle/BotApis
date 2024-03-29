import { commandCache, turtleServer } from "./lib/deps.js";
import "./lib/time.js";
import "./lib/set.js";
import "./lib/dictionary.js";
import "./lib/urbandictionary.js";
import "./lib/google.js";
// import "./lib/aichat.js";

commandCache.forEach(turtleServer.register);
