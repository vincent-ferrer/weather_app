$(document).ready(() => {
    console.log("ready");
    $("#weather_btn").click(() => {
        getLocation($("#cityInput").val()).then(data => getWeather(data.lat, data.lng, 1));
        createWeatherTable()
    });
})

async function getLocation(cityName) {
    let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${cityName}&key=AIzaSyDdVJ6zE0-ZSqncFEb2H9oJe-hn05-kMqg`);
    let data = await response.json();
    return data["results"][0]["geometry"]["location"];
}

async function getWeather(latitude, longitude, nbServeur) {
    meteo = getCurrentWeatherOpenMeteo(latitude,longitude).then(
        data => console.log(data)
    )
}

async function getCurrentWeatherOpenMeteo(latitude, longitude) {
    // let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`);
    let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Europe%2FBerlin`)
    let data = await response.json();
    return data['current_weather'];
}

let tableHeaders = ["Temperature", "vent", "API"]

const tableDiv = $("#weatherTable")

function createWeatherTable() {
    while(tableDiv.firstChild) tableDiv.removeChild(tableDiv.firstChild);

    let weatherTable = document.createElement('table')
    weatherTable.className = "weatherTable"

    let weatherTableHeader = document.createElement('thead')
    weatherTableHeader.className = "weatherTableHeader"

    let weatherTableHeaderRow = document.createElement('tr')
    weatherTableHeaderRow.className = "weatherTableHeaderRow"

    tableHeaders.forEach(header => {
        let tableHeader = document.createElement('th')
        tableHeader.innerHTML = header
        weatherTableHeaderRow.append(tableHeader)
    })

    weatherTableHeader.append(weatherTableHeaderRow)
    weatherTable.append(weatherTableHeader)

    let weatherTableBody = document.createElement('tbody')
    weatherTableBody.className = "weatherTableBody"
    weatherTable.append(weatherTableBody)

    tableDiv.append(weatherTable)
}