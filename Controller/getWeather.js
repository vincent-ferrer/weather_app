

function getLocation(cityName) {
    return (0,0);
}

async function getWeather(latitude, longitude) {
    let response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=43.23&longitude=5.44&hourly=temperature_2m");
    let data = await response.text();
    console.log(data);
}