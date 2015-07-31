/*Server side functionality*/
var express = require('express'),
    app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var clients = [];

io.on('connection', function (socket){
	var colorArray = ['#ffeded','#eee','#f5ffed','#edfff4','#f7edff','#e2ffe6']; //max of 6 colours = max 6 people in the room

    socket.userColor = colorArray[Math.floor(Math.random() * colorArray.length)];
	socket.username = socket.id;
    socket.room = 'room1';

	socket.on('adduser', function (name, roomName) {
        socket.username = name;
        socket.room = roomName;
        socket.join(socket.room);
        clients.push({room: socket.room, userID: socket.id, username: socket.username});
        var clientsInRoom = clients.filter(function (el) { return el.room === socket.room; });
    	io.to(socket.room).emit('chat message', {message: 'welcomeMsg', userID: socket.id, username: socket.username});
        io.to(socket.room).emit('updateUserList', {clients: clientsInRoom});
    	console.log('userID: '+ socket.id +' - Connected to room: ' + socket.room);
    });

    socket.on('chat message', function (msg){
    	io.to(socket.room).emit('chat message', {message: msg, userID: socket.id, username: socket.username, color: socket.userColor});
	});

    socket.on('disconnect', function (){
    	io.to(socket.room).emit('chat message', {message: 'byeMsg', userID: socket.id, username: socket.username});
      	console.log('userID: '+ socket.id +' - Disconnected');
        clients = clients.filter(function (el) { return el.userID !== socket.id; });
        io.to(socket.room).emit('updateUserList', {clients: clients});
        socket.leave(socket.room);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});