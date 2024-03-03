import { webcurl } from "./web.js"; // open-meteo doesn't like fetch on AWS. no idea why, use curl
import { Route } from "./route.js";

function getWindDirection(windDegree) {
    const directions = [
        'N', 'NNE', 'NE', 'ENE', 'E',
        'ESE', 'SE', 'SSE', 'S',
        'SSW', 'SW', 'WSW', 'W',
        'WNW', 'NW', 'NNW', 'N'
    ];

    const index = Math.floor((windDegree + 11.25) / 22.5);
    return directions[index % 16];
}

function celsiusToFahrenheit(n) {
    return (n * 9 / 5 + 32).toFixed(1);
}

function kmphToMph(n) {
    return (n / 1.60934).toFixed(2);
}

function metricToOld(n) {
    const inches = n / 2.54;
    const feet = Math.floor(inches / 12);
    const remainingInches = (inches % 12).toFixed(2);

    if (feet === 0)
        return `${remainingInches} inches`;
    return `${feet} feet and ${remainingInches} inches`;
}

function prettyTime(t) {
    const time = new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (time[0] === "0")
        return time.slice(1);
    return time;
}

export const jackieWeather = new Route("/jackieweather", async function (req, res) {
    try {
        if (req.query["lat"] === undefined || req.query["long"] === undefined || req.query["location"] === undefined)
            return res.end("Error: You need to provide lat, long and location. Lat and long need to be accurate, google it. Location is flavour text. Subscribe to JackieDL on kick!");
        const lat = req.query["lat"];
        const long = req.query["long"];
        const location = req.query["location"];
        const url = encodeURI(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,cloud_cover,wind_speed_10m,wind_direction_10m&timezone=auto&forecast_days=1`);
        const weatherResponse = await webcurl(url);
        const json = JSON.parse(weatherResponse);
        console.log(JSON.stringify(json, null, 2));
        if (json.error)
            return res.end(`Error: ${json.reason}`);
        const time = prettyTime(json.current.time);
        const temperature = `At ${time} in ${location}, it is ${json.current.temperature_2m}${json.current_units.temperature_2m} (${celsiusToFahrenheit(json.current.temperature_2m)}°F), `;
        const feelsLike = json.current.apparent_temperature !== json.current.temperature_2m ? `but it feels like ${json.current.apparent_temperature}${json.current_units.apparent_temperature} (${celsiusToFahrenheit(json.current.apparent_temperature)}°F), ` : "";
        const humidity = `with a humidity of ${json.current.relative_humidity_2m}${json.current_units.relative_humidity_2m}. `;
        const windDirection = getWindDirection(json.current.wind_direction_10m);
        const murricaWind = `(${kmphToMph(json.current.wind_speed_10m)} mph)`;
        const wind = `wind: ${json.current.wind_speed_10m} ${json.current_units.wind_speed_10m} ${murricaWind} ${windDirection}, `;
        const cloudCover = json.current.cloud_cover > 0 ? `${json.current.cloud_cover}${json.current_units.cloud_cover} cloud cover, ` : "clear skies, ";
        const rain = json.current.rain > 0 ? `${json.current.rain}${json.current_units.rain} (${metricToOld(json.current.rain)} inches) of rain, ` : "";
        const showers = json.current.showers > 0 ? `${json.current.showers}${json.current_units.showers} (${metricToOld(json.current.showers)} inches), ` : "";
        const snow = json.current.snowfall > 0 ? `${json.current.snow}${json.current_units.snowfall} (${metricToOld(json.current.snowfall)} of snow, ` : "";
        res.end(`${temperature}${feelsLike}${humidity}${wind}${cloudCover}${rain}${showers}${snow}`.slice(0, -2));
    } catch (err) {
        console.error(err);
    }
});