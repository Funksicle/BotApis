const express = require("express");
const app = express();
app.get("/jackietime", async function (req, res) {
    try {
        const timeResponse = await webGet("https://timeapi.io/api/Time/current/zone?timeZone=Japan");
        const json = JSON.parse(timeResponse);
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            const query = queries[0];
            if (query === "dateTime") {
                res.end(json[query].split("T").join(" ").split(".")[0]);
                return;
            }
            if (json[queries[0]] !== undefined) {
                res.end(json[queries[0]]);
                return;
            }
        }
        const formattedDate = `${json.date} ${json.time}`
        res.end(formattedDate);
    } catch (err) {
        console.log(err);
    }
});

const server = app.listen(8081, function () {
    // console.log(server.address());
    // console.log("Listening on http://%s:%s", host, port);
});

async function webGet(url) {
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        return text;
    } catch (err) {
        console.log(err);
    }
}