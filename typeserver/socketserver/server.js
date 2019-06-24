const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

let roomNum = 1

let userCount = {
  roomNum,
  totalUsers: 0
};

/* User Count object: {
  total: 12,
  room-1: 3,
  room-2: 3,
  room-3: 3,
  room-4: 3
}
*/

io.on('connection', function(socket){
  userCount.totalUsers++
  console.log('a user connected, total users:', userCount.totalUsers)

  //If it's the first user, the room doesn't exist - make the room.
  if (!userCount['room-'+roomNum]) {
    socket.join('room-'+roomNum)
    userCount['room-'+roomNum] = 1 // Increase the user count of the room
    console.log(userCount)
  //If the room is not at max capacity (3), add user to the room
  } else if (userCount['room-'+roomNum] && userCount['room-'+roomNum] < 3){
    socket.join('room-'+roomNum)
    userCount['room-'+roomNum]++
    console.log(userCount)
  //If the room exists and is at capacity, increase the room number, join the new room, set count to 1
  } else {
    roomNum++
    socket.join('room-'+roomNum);
    userCount['room-'+roomNum] = 1;
    console.log(userCount);
  }

  //Welcome message for new user
  socket.emit('welcome', {
    description: `Welcome! You are in room ${roomNum}! Current user count: ${userCount['room-'+roomNum]}`,
    userCount
  })
  //Broadcast that a new user joined to everyone ~else~
  socket.broadcast.to('room-'+roomNum).emit('new-user-join', {
    description : `New user has joined. Current user count: ${userCount['room-'+roomNum]}`,
    userCount
  })
  //Check if the room is at capacity
  if (io.sockets.adapter.rooms['room-'+roomNum].length === 3) {
    io.to('room-'+roomNum).emit('game-start', {
      description: '3 players in room. Game starting shortly.'
    })
  }

  //When receiving an update from a user, broadcast to all users in the room
  socket.on('progress-update', (wpm) => {
    // console.log('What room is this', Object.keys(socket.rooms));
    io.to(Object.keys(socket.rooms)[1]).emit('progress-broadcast', {
      socketId: socket.id,
      roomId: socket.rooms[1],
      wpm: wpm
    });
  })

  socket.on('disconnecting', function(){
    const rooms = Object.keys(socket.rooms).slice();
    io.to(rooms[1]).emit('player-left', {
      description: `${socket.id} has left the game.`
    })
  });

  socket.on('disconnect', function () {
    console.log('A user disconnected', socket.id);
    // Remove user from total users list when they leave
    userCount.totalUsers--
    //If someone disconnects, total user count changes, but room count remains the same
  });
});

http.listen(port, function(){
  console.log(`Listening on :${port}`);
});
