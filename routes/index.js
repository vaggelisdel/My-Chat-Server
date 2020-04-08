var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
var User = require('../models/user');
var Message = require('../models/message');
var cors = require('cors');

router.use(cors());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', function (req, res, next) {
    User.findOne({email: req.body.email}, function(err, user) {
      if (err) throw err;
      if (user){
        bcrypt.compare(req.body.password, user.password, function(err, result) {
          if(result === true){
            res.send({userData: user});
          }else{
            res.status(302).send({});
          }
        });
      }else{
        res.status(304).send({}); //user not found
      }
    });
});

router.post('/signup', function (req, res, next) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        socketID: ""
      });
      newUser.save(function (err) {
        if (err) throw err;
        res.send({});
      });
    });
});

router.post('/allcontacts', function (req, res, next) {
    User.find({ email: {$ne: req.body.email}}, function (err, allcontacts) {
        res.send(allcontacts);
    });
});

router.post('/getChatHistory', function (req, res, next) {
    var data = req.body;
    Message.find({ $or: [ {'senderId': data.sender, 'receiverId': data.receiver}, {'senderId': data.receiver, 'receiverId': data.sender} ] }).sort([['date', -1]]).exec(function(err, allmessages) {
        res.send(allmessages);
    });
});

module.exports = router;
