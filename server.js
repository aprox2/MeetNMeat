const express = require('express')
const sender = require('./sender');
const amqp = require('amqplib/callback_api')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4: uuidV4} = require('uuid')
const path = require('path')
const async = require("async");
let matched = []
let disconnected = []

//Database connection
const dbString = 'mongodb://localhost:27017/db'


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/node_views'))
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.render('main', {myId: uuidV4()})        //Vajag pectam parbaudit vai nevar but duplikati
})

app.get('/call', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/call/:room', (req, res) => {
    res.render('room', {roomId: req.params.room })
})
let emitter = function () {return false}

let connected_users = [] //temp

//Socket stuff
io.on('connection', socket => {

    //Video conferences kods
    socket.on('join-room', (roomId, userId) => {
        console.log(`Joined :  ${userId}  Room : ${roomId}`)
        connected_users.push(userId)
        console.log("Connected user :")
        console.log(connected_users)
        socket.join(roomId)
        setTimeout(() => {      //Nepieciešams, lai pagaiditu peer klasi script.js
            socket.broadcast.to(roomId).emit('user-connected', userId)
        }, 500)



        socket.on('room-text', (roomId, str) => {
            socket.broadcast.to(roomId).emit('send-text', str)
        })

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })

    //Matchosanas rinda
    socket.on('join-queue', (userId) => {

        //Ielikt queue

        disconnected = disconnected.filter(discUser => discUser !== userId)

        send_to_rabbit(userId)

        socket.on('disconnect', () => {
            //Uz iziesanu ieliek saraksta, ar kuru izfiltres visus
            // console.log(`Disconnected   ${userId}`)
            disconnected.push(userId)
        })
        emitter = (user1, user2, room) => {
            io.emit('joined-queue', user1, user2, room)
            return true
        }

    })
})
//Ble shady, kas ja matched list ir parak gars un nepaspej attirit listu laika
setInterval(() =>{
    if (matched.length > 0){
        const initial = matched.length
        for (let i = 0; i<initial; i++) {
            const match = matched.shift()
            const users = match.split(",")
            const room = uuidV4()
            const res = users.filter(user => !disconnected.includes(user))
            if (res.length === 2) {
                emitter(users[0], users[1], room)
            } else {
                res.forEach(user => send_to_rabbit(user))
            }
        }
        disconnected = []
    }
}, 300)

async function send_to_rabbit(id){
    await sender.send(id)
}


//Dabu matchus caur Rabbitmq
amqp.connect('amqp://localhost', (connError, connection) => {
    if(connError) throw connError;
    connection.createChannel((channelError, channel) => {
        if(channelError) throw channelError;
        const QUEUE = 'matchedQueue'
        channel.assertQueue(QUEUE, {
            durable: false
        });
        channel.consume(QUEUE, (msg) => {
            // console.log(`pair receiver   ${msg.content.toString()}`)
            matched.push(msg.content.toString())
        }, {
            noAck: true
        })
    })
})

let pair ={}
amqp.connect('amqp://localhost', (connError, connection) => {
    if(connError) throw connError;
    connection.createChannel((channelError, channel) => {
        if(channelError) throw channelError;
        const QUEUE = 'matchQueue'
        channel.assertQueue(QUEUE, {
            durable: false
        });
        channel.consume(QUEUE, (msg) => {
            console.log(`msg receiver   ${msg.content.toString()}`)
            pair[msg.content.toString()] = 1
            if(Object.keys(pair).length > 1){
                const match = [
                    Object.keys(pair)[0],
                    Object.keys(pair)[1]
                ]
                delete pair[Object.keys(pair)[0]]
                delete pair[Object.keys(pair)[0]]
                console.log(`pushing in  ${match}`)
                matched.push(match.toString())
            }
        }, {
            noAck: true
        })
    })
})

server.listen(3000)