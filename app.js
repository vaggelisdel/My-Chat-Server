var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var User = require('./models/user');
var Message = require('./models/message');

mongoose.connect('mongodb+srv://vaggelisdel:6981109687@cluster0-kzkna.mongodb.net/MyChat?retryWrites=true&w=majority', {
    useNewUrlParser: true
});

var indexRouter = require('./routes/index');

var app = express();

var io = require('socket.io')();
app.socket = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

io.on('connection', function (socket) {

    console.log('Connected to socket.io, ID: ' + socket.id);

    socket.on("connectUser", function (data) {
        var query = {email: data.email};
        var valueUpdate = {$set: {socketID: socket.id, active: true, lastActive: ""}};
        User.updateMany(query, valueUpdate, function (err, res) {
            if (err) {
                console.log("update document error");
            }
        });
        socket.broadcast.emit('broadcastedUser', {
            socketID: socket.id,
            email: data.email,
            username: data.username,
            _id: data.id,
            active: true
        });
    });

    socket.on("retrieveNewUser", function (email) {
        console.log(email);
        User.findOne({email: email}, function (err, res) {
            var userData = {
                username: res.username,
                email: res.email,
                socketID: res.socketID
            };
            socket.emit('AddNewUser', userData);
        });
    });

    socket.on("updateSocketID", function (data) {
        socket.broadcast.emit('broadcastedUser', {
            socketID: socket.id,
            email: data.email,
            username: data.username,
            _id: data.id,
            active: true
        });
    });

    socket.on("sendMessage", function (data) {
        var newMsg = new Message({
            senderId: data.sender,
            receiverId: data.receiver,
            message: data.message,
            date: data.date
        });
        newMsg.save(function (err) {
            if (err) throw err;
            socket.to(data.sendToSocket).emit("broadcastedMessage", {
                _id: newMsg._id,
                senderId: newMsg.sender,
                receiverId: newMsg.receiver,
                message: newMsg.message,
            })
        });
    });

    socket.on('disconnect', function () {
        console.log("Disconnected: " + socket.id)
        var query = {socketID: socket.id};
        var valueUpdate = {$set: {active: false, lastActive: Date.now()}};
        User.updateMany(query, valueUpdate, function (err, res) {
            if (err) {
                console.log("update document error");
            }
        });
        socket.broadcast.emit('disconnectedUser', {
            socketID: socket.id,
            active: false,
            lastActive: Date.now()
        });
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
