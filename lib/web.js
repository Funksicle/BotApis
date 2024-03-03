import { execFile } from "child_process";

export async function webfetch(url) {
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        return text;
    } catch (err) {
        console.log(err);
    }
}

export function webcurl(url) {
	return new Promise((resolve, reject) => {
		execFile("curl", [ "--compressed", "-sSL", url], null, (error, stdout, stderr) => {
			if (error) {
				if (error.message && error.message === "stdout maxBuffer exceeded") {
					console.log("> maxBuffer: "+stdout.length);
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