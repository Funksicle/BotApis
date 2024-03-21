import { DB } from "./deps.js";

export class ChannelVariables {
    constructor(channel, fn = "variables") {
        this.channel = channel;
        this.db = new DB(`${channel}_${fn}`);
    }
    get(key, ignoreCase = false) {
        return this.db.get(key, ignoreCase);
    }
    set(key, ignoreCase = false) {
        return this.db.set(key, ignoreCase);
    }
    remove(key, ignoreCase = false) {
        return this.db.remove(key, ignoreCase);
    }
    getAll() {
        return this.db.getAll();
    }
    getKeys() {
        return this.db.getKeys();
    }
}
