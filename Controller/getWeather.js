$(document).ready(() => {
    $("#weather_btn").click(() => {
        $("#weatherTableBody").html("")

        getWeather($("#cityInput").val()).then()
    });
})

async function getLocation(cityName) {
    let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${cityName}&key=AIzaSyDdVJ6zE0-ZSqncFEb2H9oJe-hn05-kMqg`);
    let data = await response.json();
    return data["results"][0]["geometry"]["location"];
}

async function getWeather(cityName) {
    let coordinates = await getLocation(cityName)

    let tempServ1 = []
    let tempServ2 = []
    let tempServ3 = []
    let tempConsensus = []

    let ventServ1 = []
    let ventServ2 = []
    let ventServ3 = []
    let ventConsensus = []

    let qualiteServ1 = []
    let qualiteServ2 = []
    let qualiteServ3 = []
    let qualiteConsensus = []

    let nameServ1
    let nameServ2
    let nameServ3
    let servConsensus

    let xValues = []
    for (let i = 0; i < 10; ++i) {
        console.log(i)
        xValues.push(new Date(Date.now()).toLocaleString())

        dataServ1 = await getCurrentWeatherOpenMeteo(coordinates.lat,coordinates.lng)
        dataServ2 = await getCurrentWeatherVisualCrossing(cityName)
        dataServ3 = await getCurrentWeatherBit(coordinates.lat,coordinates.lng)

        tempServ1.push(dataServ1["temperature"])
        tempServ2.push(dataServ2["temperature"])
        tempServ3.push(dataServ3["temperature"])

        ventServ1.push(dataServ1["vent"])
        ventServ2.push(dataServ2["vent"])
        ventServ3.push(dataServ3["vent"])

        qualiteServ1.push(dataServ1["tempsReponseServeur"])
        qualiteServ2.push(dataServ2["tempsReponseServeur"])
        qualiteServ3.push(dataServ3["tempsReponseServeur"])

        consensus = calculConsensus([dataServ1,dataServ2,dataServ3])

        tempConsensus.push(consensus["temperature"])
        ventConsensus.push(consensus["vent"])
        qualiteConsensus.push(consensus["tempsReponseServeur"])

        nameServ1 = dataServ1["serveur"]
        nameServ2 = dataServ2["serveur"]
        nameServ3 = dataServ3["serveur"]
        servConsensus = consensus["serveur"]


    }

    new Chart($("#chartTemp"), {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                data: tempServ1,
                borderColor: "red",
                label: nameServ1
            },{
                data: tempServ2,
                borderColor: "green",
                label: nameServ2
            },{
                data: tempServ3,
                borderColor: "blue",
                label: nameServ3
            },{
                data: tempConsensus,
                borderColor: "black",
                label: servConsensus
            }]
        },
        options: {}
    });

    new Chart($("#chartVent"), {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                data: ventServ1,
                borderColor: "red",
                label: nameServ1
            },{
                data: ventServ2,
                borderColor: "green",
                label: nameServ2
            },{
                data: ventServ3,
                borderColor: "blue",
                label: nameServ3
            },{
                data: ventConsensus,
                borderColor: "black",
                label: servConsensus
            }]
        },
        options: {}
    });

    new Chart($("#chartQualite"), {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                data: qualiteServ1,
                borderColor: "red",
                label: nameServ1
            },{
                data: qualiteServ2,
                borderColor: "green",
                label: nameServ2
            },{
                data: qualiteServ3,
                borderColor: "blue",
                label: nameServ3
            },{
                data: qualiteConsensus,
                borderColor: "black",
                label: servConsensus
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