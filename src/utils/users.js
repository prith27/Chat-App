const users=[]

//Adding a user

const addUser=({ id,username,room})=>{
    //Cleaning data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()
    //Validation
    if(!username || !room){
        return {
            error:'Username and room are required!'
        }
    }
    //Check if username exists
    const existingUser=users.find((user)=>{
        return user.room === room && user.username === username

    })

    //Validate username
    if(existingUser)
    {
        return{
            error:'Username is in use!'
        }
    }

    //storing user
    const user={id,username,room}
    users.push(user)
    return {user}
}



//Removing user
const removeUser=(id)=>{
   const index=users.findIndex((user)=> user.id===id )  //-1 is no match

   if(index !== -1){
       return users.splice(index,1)[0]
   }
 
}

//Getting a user
const getUser=(id)=>{
    return users.find((user)=> user.id===id)
        
    }




//Getting users in a room

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}
 
module.exports={
    getUsersInRoom,getUser,addUser,removeUser
}
