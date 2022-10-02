$(document).ready(() => {
    $("#weather_btn").click(() => {
        $("#weatherTableBody").html("")

        getWeather($("#cityInput").val(), $("#APIKEYInput").val()).then(data => createCharts(data))
    });
})

async function getWeather(cityName, ApiKey) {
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

        let response = await fetch(`http://https://protected-fortress-74874.herokuapp.com/getweather?cityName=${cityName}&uuid=${ApiKey}`)
        console.log(response);
        let data = await response.json();
        console.log({data})

        jsonValue["tempServ1"].push(data[0]["temperature"])
        jsonValue["tempServ2"].push(data[1]["temperature"])
        jsonValue["tempServ3"].push(data[2]["temperature"])

        jsonValue["ventServ1"].push(data[0]["vent"])
        jsonValue["ventServ2"].push(data[1]["vent"])
        jsonValue["ventServ3"].push(data[2]["vent"])

        jsonValue["qualiteServ1"].push(data[0]["tempsReponseServeur"])
        jsonValue["qualiteServ2"].push(data[1]["tempsReponseServeur"])
        jsonValue["qualiteServ3"].push(data[2]["tempsReponseServeur"])

        consensus = calculConsensus([data[0],data[1],data[2]])

        jsonValue["tempConsensus"].push(consensus["temperature"])
        jsonValue["ventConsensus"].push(consensus["vent"])
        jsonValue["qualiteConsensus"].push(consensus["tempsReponseServeur"])

        jsonValue["nameServ1"] = data[0]["serveur"]
        jsonValue["nameServ2"] = data[1]["serveur"]
        jsonValue["nameServ3"] = data[2]["serveur"]
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
