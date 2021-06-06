let socket = io('/');
let socket_on = false
let button = document.getElementById('join-btn')
let checkbox = document.getElementById('checkbox-check')
let checkboxText = document.getElementById('checkbox-terms')
let meeting = false

function disconnect(){
    socket.disconnect()
    socket_on = false
    meeting = false
    button.innerText = "Meat Someone"
}

function join(){
    if (!checkbox.checked) {
        checkboxText.style.color = "red"
        return
    }
    socket.connect()
    meeting = true
    socket.emit('join-queue', USER_ID)
}

let i = 0
let text = [
    "Meating.",
    "Meating..",
    "Meating..."
]
console.log(button)
setInterval(() => {
  if (meeting){
      button.innerText = text[i]
      i++
      if (i >= 3){
          i = 0
      }
  }
},500)

socket.on('joined-queue', (user, user2, room) => {
    console.log("USER_ID: ", USER_ID)
    console.log(user)
    console.log(user2)
    if (USER_ID === user || USER_ID === user2) {
        console.log("WORKED")
        window.location.href = `/call/${room}`;
    }
})

function test(){
    socket.emit('get-queue')
}

setInterval(function() {
    socket.emit('get-pairs')
},3000);