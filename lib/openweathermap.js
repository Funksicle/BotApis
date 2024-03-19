import { webfetch, config, uservariables, Route } from "./deps.js";

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

function kmphToMph(k) {
    return (k / 1.60934).toFixed(1);
}

function mmToInches(mm) { // mm bop
    return (mm / 25.4).toFixed(2);
}
function celsiusToFahrenheit(c) {
    return (c * 9 / 5 + 32).toFixed(1);
}

export async function setWeatherLocation(res, weatherLocation) {
    const response = JSON.parse(await webfetch(`http://api.openweathermap.org/geo/1.0/direct?q=${weatherLocation}&limit=1&appid=${config.get("weatherapi_key")}`));
    console.log(response);
    if (!response.length)
        return res.end(`Couldn't find a location for "${weatherLocation}", maybe google it.`);
    const location = response[0];
    uservariables.set("weather", location);
    const state = location.state && location.state !== location.name ? `${location.state}, ` : "";
    res.end(`Weather location set to ${location.name}, ${state}${location.country}`);
}

async function getWeather() {
    const location = uservariables.get("weather");
    if (!location)
        throw new Error("No weather location is set!");
    const w = JSON.parse(await webfetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${config.get("weatherapi_key")}`));
    console.log(w);
    return weatherReport(w);
}

function weatherReport(w) {
    function itFellFromTheSkyReport(type, substance) {
        if (substance["1h"])
            return `${type}: ${substance["1h"]}mm (${mmToInches(substance["1h"])} inches) in the last hour`;
        if (substance["3h"])
            return `${type}: ${substance["3h"]}mm (${mmToInches(substance["3h"])} inches) over the last three hours`;
    }

    const temp = `Temperature: ${w.main.temp.toFixed(1)}°C (${celsiusToFahrenheit(w.main.temp)}°F)`;
    const feels = `Feels like: ${w.main.feels_like.toFixed(1)}°C (${celsiusToFahrenheit(w.main.feels_like)}°F)`;
    const humidity = `Humidity: ${w.main.humidity}%`;
    const wind = `Wind: ${w.wind.speed.toFixed(1)} km/h (${kmphToMph(w.wind.speed)} mph) ${getWindDirection(w.wind.deg)}`;
    const snow = w.snow ? itFellFromTheSkyReport("Snow", w.snow) : "";
    const rain = w.rain ? itFellFromTheSkyReport("Rain", w.rain) : "";
    const clouds = w.clouds && w.clouds.all > 0 ? `Cloud cover: ${w.clouds.all}%` : "";
    const conditions = `Conditions: ${w.weather.map(w => w.description).join(", ")}`;
    return [temp, feels, snow, rain, humidity, wind, clouds, conditions].filter(entry => entry !== undefined && entry.length).join(", ");
}

export const jackieOpenWeather = new Route("/jackieopenweather", async function (_, res) {
    try {
        const weather = await getWeather();
        console.log(weather);
        res.end(weather);
    } catch (err) {
        console.error(err);
    }
});