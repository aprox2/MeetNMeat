const socket = io('/')
const StrangerVideo = document.getElementById('stranger-video')
const OwnVideo = document.getElementById('own-video')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
const max_clients = 2
let current_clients = 1
let peer_clients = 1
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(true, video, userVideoStream)
        })
        call.on('close', () => {
            video.remove()
        })
    })

    socket.on('user-connected', (userId, test) => {
        console.log("Connected User")
        connectToNewUser(userId, stream)
    })

})

socket.on('send-text', txt=>{
    append_msg(false, txt)
})

socket.on('user-disconnected', userId => {
    console.log("Close: "+ userId);
    if (peers[userId])
        peers[userId].close()
})


myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
    console.log("Opened")
})

function append_msg(isSender, txt){
    let commentField = document.getElementById("msg-field")
    let tag = document.createElement("div");
    tag.className = "msg-line"
    tag.style.backgroundColor = isSender ? "white" : "lightgray"
    commentField.appendChild(tag)
    let user = document.createElement("div")
    user.className = "msg-user"
    let person = document.createElement("p")
    person.textContent = isSender ? 'You:' : "Stranger:"
    person.style.color = isSender ? "red" : "blue"
    user.appendChild(person)
    tag.appendChild(user)
    let text = document.createElement("div")
    text.className = "msg-text"
    let textField = document.createElement("p")
    textField.textContent = txt
    text.appendChild(textField)
    tag.appendChild(text)
}

function connectToNewUser(userId, stream){
    console.log("Calling")
    const call = myPeer.call(userId, stream)
    console.log("Called")
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(false, video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    peers[userId] = call
}

function send_text(){
    let inputField = document.getElementById("msg-input")
    const input = inputField.value
    inputField.value = ""
    socket.emit('room-text', ROOM_ID, input)
    append_msg(true, input)
}


function addVideoStream(isOwn, video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    if (video.srcObject === undefined)
        return
    if (isOwn)
        OwnVideo.append(video)
    else
        StrangerVideo.append(video)
    // videoGrid.append(video)
}