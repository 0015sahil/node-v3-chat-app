const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');     // ServerSide Connection
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/user');

const app = express();
const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

// socket is work with http server
const server = http.createServer(app);      // just configuration , not behavior change
const io = socketio(server);      // create instance of socketio. Expect http server so use http.cre.. method

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({id: socket.id, ...options});

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('newUser', generateMessage('Admin', 'Welcome to club'));
        socket.broadcast.to(user.room).emit('newUser', generateMessage('Admin',`${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        });

        callback();
    })

    socket.on('inputValue', (inputVal, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(inputVal)) {
            return callback('Dont use bad words')
        }
        
        io.to(user.room).emit('newUser', generateMessage(user.username,inputVal));
        callback();
    });

    socket.on('locationValue', (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username ,`https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback('Location shared');
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('newUser', generateMessage('Admin',`${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            });
        }
    })
});


server.listen(port, () => {           // Use server.listen instead of app.listen
    console.log(`Server is up on port ${port}`);
});