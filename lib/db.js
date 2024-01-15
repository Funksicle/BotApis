import { existsSync, readFileSync, writeFileSync } from "fs";

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
            console.error(err);
        }
    }

    set(key, value) {
        this.db[key] = value;
        this.save();
    }

    get(key) {
        return this.db[key];
    }

    getKeys(pretty=false) {
        if (pretty)
            return Object.keys(this.db).join(", ");
        return Object.keys(this.db);
    }


    remove(key) {
        delete this.db[key];
        this.save();
    }

    save() {
        console.log(`Saving ${this.fn} ..`);
        try {
            writeFileSync(this.fn, JSON.stringify(this.db, null, 2));
        } catch (err) {
            console.error(err);
        }
    }
}