const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const{addUser,getUser,getUsersInRoom,removeUser}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port= process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

// let count=0

io.on('connection',(socket)=>{
  console.log('New websocket connection!')

  socket.on('join',({username,room},callback)=>{
      const {error,user}=addUser({ id:socket.id,username,room})
      
     if(error){
       return callback(error)
     }

      socket.join(user.room)

      socket.emit('message',generateMessage('Admin','Welcome'))
      socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
      
      io.to(user.room).emit('roomData',{
          room:user.room,
          users:getUsersInRoom(user.room)
      })
      
      callback() //no error
      //io.to.emit
      //socket.broadcast.to.emit
  })
  
  socket.on('sendMessage',(msg,callback)=>{
      const filter=new Filter()  

      if(filter.isProfane(msg)){
          return callback('Bad word detected. Please read the policy!')
      }
      const user=getUser(socket.id)

      io.to(user.room).emit('message',generateMessage(user.username,msg))
      callback()
  })

  socket.on('sendLocation',(coords,callback)=>{
      const user=getUser(socket.id)
      let message=`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      
     io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,message))
     callback()
  })

socket.on('disconnect',()=>{
    const user=removeUser(socket.id)

    if(user){
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    }
    
})
   
//   socket.emit('countUpdated',count)

//   socket.on('increment',()=>{
//       count=count+1
//       //socket.emit('countUpdated',count)
//       io.emit('countUpdated',count)
//   })
})



server.listen(port,()=>{
    console.log(`Server up on Port:${port} !`)
})