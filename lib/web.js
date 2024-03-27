import { execFile } from "child_process";
import { config, logger } from "./deps.js";

export async function webfetch(url) {
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        return text;
    } catch (err) {
        console.log(err);
    }
}

export async function webpost(url, data) {
	const args = [
        "-X", "POST",
		"-d", JSON.stringify(data),
        "-H", "accept: application/json",
		"-H", "Content-Type: application/json",
		"-sSL", "--compressed"
	];
	try {
        // console.log(url, args);
		// return JSON.parse(await webcurl(url, args));
        const output = await webcurl(url, args);
        console.log(output);
        return output;
	} catch (err) {
		console.log(`Failed POST (${url}, ${data})`, err);
	}
}

export function webcurl(url, args = [ "--compressed", "-sSL"]) {
    return new Promise((resolve, reject) => {
        execFile("curl", args.concat(encodeURI(url)), null, (error, stdout, stderr) => {
            if (error) {
                if (error.message && error.message === "stdout maxBuffer exceeded") {
                    console.log("> maxBuffer: " + stdout.length);
                    return resolve(stdout);
                }
                switch (error.code) {
                case "ENOENT":
                    console.error("You need to install curl on the system.");
                    return reject(new Error("curl is not installed."));
                case 6: // DNS error, let stderr reject it
                    break;
                case 60:
                    return reject(new Error("Failed SSL verification."));
                default:
                    return reject(error);
                }
            }
            if (stderr.length)
                return reject(new Error(stderr.replace(/\n|\t|\r|curl: /g, "")));
            resolve(stdout);
        });
    });
}

export async function googleSearch(term, maxResults = 1) {
    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${config.get("googleapi_key")}&cx=002465313170830037306:5cfvjccuofo&num=${maxResults || 1}&prettyPrint=false&q=${term.trim()}`;
        const g = JSON.parse(await webfetch(url));
        if (g.error)
            throw new Error(`[web.googleSearch]: ${g.error.message}`);
        if (g.queries.request[0].totalResults === "0")
            return { notFound: true };
        return {
            items: g.items.map(item => {
                return {
                    title: item.title.replace(/ +/g, " "),
                    url: item.link,
                    content: String(item.snippet).replace(/[\x01\n\t\r]/g, "")
                };
            })
        };
    } catch (err) {
        logger.error(`Failed to google "${term}"`, err);
    }
}
