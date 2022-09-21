$(document).ready(() => {
    $("#weather_btn").click(() => {
        $("#weatherTableBody").html("")

        getWeather($("#cityInput").val()).then(data => createCharts(data))
    });
})

async function getLocation(cityName) {
    let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${cityName}&key=AIzaSyDdVJ6zE0-ZSqncFEb2H9oJe-hn05-kMqg`);
    let data = await response.json();
    return data["results"][0]["geometry"]["location"];
}

async function getWeather(cityName) {
    let coordinates = await getLocation(cityName)

    let jsonValue = {
        dates: [],
        tempServ1: [],
        tempServ2: [],
        tempServ3: [],
        tempConsensus: [],
        ventServ1: [],
        ventServ2: [],
        ventServ3: [],
        ventConsensus: [],
        qualiteServ1: [],
        qualiteServ2: [],
        qualiteServ3: [],
        qualiteConsensus: [],
        nameServ1: "",
        nameServ2: "",
        nameServ3: "",
        servConsensus: ""
    }


    for (let i = 0; i < 10; ++i) {
        console.log(i)
        jsonValue["dates"].push(new Date(Date.now()).toLocaleString())

        dataServ1 = await getCurrentWeatherOpenMeteo(coordinates.lat,coordinates.lng)
        dataServ2 = await getCurrentWeatherVisualCrossing(cityName)
        dataServ3 = await getCurrentWeatherBit(coordinates.lat,coordinates.lng)

        jsonValue["tempServ1"].push(dataServ1["temperature"])
        jsonValue["tempServ2"].push(dataServ2["temperature"])
        jsonValue["tempServ1"].push(dataServ3["temperature"])

        jsonValue["ventServ1"].push(dataServ1["vent"])
        jsonValue["ventServ2"].push(dataServ2["vent"])
        jsonValue["ventServ3"].push(dataServ3["vent"])

        jsonValue["qualiteServ1"].push(dataServ1["tempsReponseServeur"])
        jsonValue["qualiteServ2"].push(dataServ2["tempsReponseServeur"])
        jsonValue["qualiteServ3"].push(dataServ3["tempsReponseServeur"])

        consensus = calculConsensus([dataServ1,dataServ2,dataServ3])

        jsonValue["tempConsensus"].push(consensus["temperature"])
        jsonValue["ventConsensus"].push(consensus["vent"])
        jsonValue["qualiteConsensus"].push(consensus["tempsReponseServeur"])

        jsonValue["nameServ1"] = dataServ1["serveur"]
        jsonValue["nameServ2"] = dataServ2["serveur"]
        jsonValue["nameServ3"] = dataServ3["serveur"]
        jsonValue["servConsensus"] = consensus["serveur"]

    }
    return jsonValue;
}

function createCharts(jsonValue) {
    new Chart($("#chartTemp"), {
        type: "line",
        data: {
            labels: jsonValue["dates"],
            datasets: [{
                data: jsonValue["tempServ1"],
                borderColor: "red",
                label: jsonValue["nameServ1"]
            },{
                data: jsonValue["tempServ2"],
                borderColor: "green",
                label: jsonValue["nameServ2"]
            },{
                data: jsonValue["tempServ3"],
                borderColor: "blue",
                label: jsonValue["nameServ3"]
            },{
                data: jsonValue["tempConsensus"],
                borderColor: "black",
                label: jsonValue["servConsensus"]
            }]
        },
        options: {}
    });

    new Chart($("#chartVent"), {
        type: "line",
        data: {
            labels: jsonValue["dates"],
            datasets: [{
                data: jsonValue["ventServ1"],
                borderColor: "red",
                label: jsonValue["nameServ1"]
            },{
                data: jsonValue["ventServ2"],
                borderColor: "green",
                label: jsonValue["nameServ2"]
            },{
                data: jsonValue["ventServ3"],
                borderColor: "blue",
                label: jsonValue["nameServ3"]
            },{
                data: jsonValue["ventConsensus"],
                borderColor: "black",
                label: jsonValue["servConsensus"]
            }]
        },
        options: {}
    });

    new Chart($("#chartQualite"), {
        type: "line",
        data: {
            labels: jsonValue["dates"],
            datasets: [{
                data: jsonValue["qualiteServ1"],
                borderColor: "red",
                label: jsonValue["nameServ1"]
            },{
                data: jsonValue["qualiteServ2"],
                borderColor: "green",
                label: jsonValue["nameServ2"]
            },{
                data: jsonValue["qualiteServ3"],
                borderColor: "blue",
                label: jsonValue["nameServ3"]
            },{
                data: jsonValue["qualiteConsensus"],
                borderColor: "black",
                label: jsonValue["servConsensus"]
            }]
        },
        options: {}
    });
}

async function getCurrentWeatherOpenMeteo(latitude, longitude) {
    let tempsRep = Date.now();
    let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Europe%2FBerlin`)
    let data = await response.json();
    tempsRep = Math.floor(Date.now() - tempsRep);

    return {
        temperature: data["current_weather"]["temperature"],
        vent: data["current_weather"]["windspeed"],
        serveur: "open-meteo",
        tempsReponseServeur: tempsRep
    }
}

async function getCurrentWeatherVisualCrossing(cityName) {
    let tempsRep = Date.now();
    let response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityName}?unitGroup=metric&key=LLBEM9ZL9N349DP3EGU5UB522&contentType=json`)
    let data = await response.json();
    tempsRep = Math.floor(Date.now() - tempsRep);
    return {
        temperature: data["currentConditions"]["temp"],
        vent: data["currentConditions"]["windspeed"],
        serveur: "weather visualcrossing",
        tempsReponseServeur: tempsRep
    }
}

async function getCurrentWeatherBit(latitude, longitude) {
    let tempsRep = Date.now();
    let response = await fetch(`https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&key=92e7dcd0cafc46c7b3c2b3e19c93c3e4`)
    let data = await response.json();
    tempsRep = Math.floor(Date.now() - tempsRep);
    return {
        temperature: data["data"][0]["temp"],
        vent: data["data"][0]["wind_spd"]*3.6, // m/s -> km/h
        serveur: "weather bit",
        tempsReponseServeur: tempsRep
    }
}

function calculConsensus(datas) {
    temp = 0;
    vent = 0;
    qualiteServ = 0

    datas.forEach(datas=>{
        temp += datas["temperature"]
        vent += datas["vent"]
        qualiteServ += datas["tempsReponseServeur"]
    })

    temp = temp/datas.length
    vent = vent/datas.length
    qualiteServ = qualiteServ/datas.length

    return {
        temperature: temp,
        vent: vent,
        serveur: "consensus",
        tempsReponseServeur: qualiteServ
    }
}