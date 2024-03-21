import { existsSync, readFileSync, writeFileSync, logger } from "./deps.js";

export class DB {
    constructor(filename) {
        this.fn = `data/${filename}.json`;
        this.load();
    }

    load() {
        try {
            if (existsSync(this.fn)) {
                this.db = JSON.parse(readFileSync(this.fn));
            } else {
                this.db = {};
            }
        } catch (err) {
            logger.error(`Couldn't load ${this.fn}`, err);
        }
    }

    set(key, value, ignoreCase = false) {
        const k = ignoreCase ? this.findKey(key) : key;
        this.db[k] = value;
        this.save();
    }

    get(key, ignoreCase = false) {
        const k = ignoreCase ? this.findKey(key) : key;
        return this.db[k];
    }

    getAll() {
        return this.db;
    }

    getKeys(pretty = false) {
        if (pretty)
            return Object.keys(this.db).join(", ");
        return Object.keys(this.db);
    }

    findKey(key) {
        const lkey = key.toLowerCase();
        const keys = Object.keys(this.db);
        for (let i = 0; i < keys.length; i++)
            if (keys[i].toLowerCase() === lkey)
                return keys[i];
        return key;
    }

    remove(key, ignoreCase = false) {
        const k = ignoreCase ? this.findKey(key) : key;
        if (!this.db[k])
            return;
        delete this.db[k];
        this.save();
    }

    save() {
        console.log(`Saving ${this.fn} ..`);
        try {
            writeFileSync(this.fn, JSON.stringify(this.db, null, 2));
        } catch (err) {
            logger.error(`Couldn't save ${this.fn}`, err);
        }
    }
}
