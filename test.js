
let x = function () {}

setInterval(() => {
    console.log("Sekunde")
    x()
    console.log("Izpildits")
}, 1000)


setTimeout(()=> {
    x = function () {
        console.log("YEEEY STRADA TU ESI GENIJS")
    }
}, 3000)