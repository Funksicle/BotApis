export class Route {
    constructor(path, callback) {
        this.path = path;
        this.callback = callback;
    }
    register(app) {
        app.get(this.path, this.callback);
    }
}