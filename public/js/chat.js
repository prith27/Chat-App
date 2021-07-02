const socket=io()

//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton= $messageForm.querySelector('#submit')
const $locationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//Options
const { username,room}=Qs.parse(location.search,{ ignoreQueryPrefix:true })


socket.on('locationMessage',(url)=>{
    console.log(url)
    const html=Mustache.render(locationTemplate,{username:url.username,url,createdAt:moment(url.createdAt).format('h:mm A')})
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

const autoscroll=()=>{
     //New msg element 
     const $newMessage=$messages.lastElementChild

     //Height of new msg
     const newMessageStyles=getComputedStyle($newMessage)
     const newMessageMargin=parseInt(newMessageStyles.marginBottom)
     const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

     //Visible Height
     const visibleHeight=$messages.offsetHeight

     //Height of messages container
     const containerHeight=$messages.scrollHeight

     //Depth of how much scrolled
     const scrollOffset=$messages.scrollTop +visibleHeight

     if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
     }

     
}


socket.on('message',(msg)=>{
    console.log(msg)
    const html=Mustache.render(messageTemplate,{
        username:msg.username,
        message:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})


document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    //disable
    let msg=e.target.elements.message.value
    socket.emit('sendMessage',msg,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        //enable
      if(error){
         return console.log(error)
      }
      console.log('Message delivered!')
    })
})

document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by the browser!')
    }

     $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(error)=>{
            $locationButton.removeAttribute('disabled')


            if(error){
                return console.log(error)
            }
            console.log('Location shared!')
        })
    })
})

socket.emit('join', {username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})


