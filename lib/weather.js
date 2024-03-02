// ttps://api.open-meteo.com/v1/forecast?latitude=35.6854&longitude=139.7531&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,cloud_cover,wind_speed_10m,wind_direction_10m&timezone=Asia%2FTokyo&forecast_days=1

import { webGet } from "./web.js";
import { Route } from "./route.js";

export const jackieWeather = new Route("/jackieweather", async function (req, res) {
    try {
        if (req.query["lat"] === undefined || req.query["long"] === undefined || req.query["tz"] == undefined)
            return console.error("Missing a required field.");
        const lat = req.query["lat"];
        const long = req.query["long"];
        const tz = encodeURIComponent(req.query["tz"]);
        const weatherResponse = await webGet(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,cloud_cover,wind_speed_10m,wind_direction_10m&timezone=${tz}&forecast_days=1`);
        const json = JSON.parse(weatherResponse);
        const temperature = `Temperature: ${json.current.temperature_2m}${json.current_units.temperature_2m}, `;
        const feelsLike = `Feels like: ${json.current.apparent_temperature}${json.current_units.apparent_temperature}, `;
        const humidity = `Humidity: ${json.current.relative_humidity_2m}${json.current_units.relative_humidity_2m}, `
        const wind = `Wind: ${json.current.wind_speed_10m}${json.current_units.wind_speed_10m}, Wind direction: ${json.current.wind_direction_10m}${json.current_units.wind_direction_10m}, `;
        const cloudCover = `Cloud cover: ${json.current.cloud_cover}${json.current_units.cloud_cover}, `;
        const rain = json.current.rain > 0 ? `Rain: ${json.current.rain}${json.current_units.rain}, ` : "";
        const showers = json.current.showers > 0 ? `Showers: ${json.current.showers}${json.current_units.showers}, ` : "";
        const snow = json.current.snowfall > 0 ? `Snow: ${json.current.snow}${json.current_units.snowfall}, ` : "";
        res.end(`${temperature}${feelsLike}${humidity}${wind}${cloudCover}${rain}${showers}${snow}`.slice(0, -2));
    } catch (err) {
        console.error(err);
    }
});