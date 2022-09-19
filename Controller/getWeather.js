$(document).ready(() => {
    console.log("ready");
    $("#weather_btn").click(() => {
        createWeatherTable()

        getWeather($("#cityInput").val(), 2).then(data => fillWeatherTable(data))
    });
})

async function getLocation(cityName) {
    let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${cityName}&key=AIzaSyDdVJ6zE0-ZSqncFEb2H9oJe-hn05-kMqg`);
    let data = await response.json();
    return data["results"][0]["geometry"]["location"];
}

async function getWeather(cityName, nbServeur) {
    let data = []
    let coordinates = await getLocation(cityName)
    console.log(coordinates)

    data.push(await getCurrentWeatherOpenMeteo(coordinates.lat,coordinates.lng))
    data.push(await getCurrentWeatherVisualCrossing(cityName))
    data.push(await getCurrentWeatherBit(coordinates.lat,coordinates.lng))

    console.log(data)
    return data
}

async function getCurrentWeatherOpenMeteo(latitude, longitude) {
    // let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`);
    let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Europe%2FBerlin`)
    let data = await response.json();

    return {
        temperature: data["current_weather"]["temperature"],
        vent: data["current_weather"]["windspeed"],
        serveur: "open-meteo"
    }
}

async function getCurrentWeatherVisualCrossing(cityName) {
    let response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityName}?unitGroup=metric&key=LLBEM9ZL9N349DP3EGU5UB522&contentType=json`)
    let data = await response.json();

    return {
        temperature: data["currentConditions"]["temp"],
        vent: data["currentConditions"]["windspeed"],
        serveur: "weather visualcrossing"
    }
}

async function getCurrentWeatherBit(latitude, longitude) {
    let response = await fetch(`https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&key=92e7dcd0cafc46c7b3c2b3e19c93c3e4`)
    let data = await response.json();

    return {
        temperature: data["data"][0]["temp"],
        vent: data["data"][0]["wind_spd"]*3.6, // m/s -> km/h
        serveur: "weather bit"
    }
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
    weatherTableBody.id = "weatherTableBody"
    weatherTable.append(weatherTableBody)

    tableDiv.append(weatherTable)
}

function fillWeatherTable(data) {
    const weatherTableBody = $("#weatherTableBody")

    data.forEach(data => {
        let weatherRow = document.createElement('tr')
        weatherRow.className = "weatherRow"

        let temp = document.createElement('td')
        temp.innerText = data["temperature"]

        let wind = document.createElement('td')
        wind.innerText = data["vent"]

        let api = document.createElement('td')
        api.innerText = data["serveur"]

        weatherRow.append(temp, wind, api)
        weatherTableBody.append(weatherRow)
    })
}