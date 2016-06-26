var express = require('express')
var app = express()
var mongoose = require('mongoose');
var promise = require('bluebird');

var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://rabbitmq', {username: 'guest', password: 'guest'});

client.on('connect', function () {
  console.log("mqtt connected to rabbitmq")
});


mongoose.connect('mongodb://mongodb:27017/rabbit-mq-todo');

var TodoSchema = new mongoose.Schema({
    item: { type: String, default: "todo" },
    done: { type: Boolean, default: false },
    updated_at: { type: Date, default: Date.now },
});



var Todo = mongoose.model('Todo', TodoSchema)

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Get one todo item
app.get('/:id', function (req, res, next) {
    Todo.findById(req.params.id)
        .then(function(todo) {
            res.json({data: todo});
        })
        .catch(function(err) {
            res.send(err);
        })
});

// Get all todos
app.get('/', function (req, res, next) {
    Todo.find()
        .then(function(todo) {
            res.json({data: todo});
        })
        .catch(function(err) {
            res.send(err);
        })
});

// Get all todos
app.post('/', function (req, res, next) {
    Todo.create(req.body)
        .then(function(todo) {
            var msg = new Buffer(JSON.stringify(todo));
            client.publish('todos', msg);
            res.json({data: todo});
        })
        .catch(function(err) {
            res.send(err);
        });
});

// update todo
app.put('/:id', function (req, res, next) {
    Todo.findByIdAndUpdate(req.params.id, req.body).
        then(function(todo) {
            res.json({data: todo});
        })
        .catch(function(err) {
            res.send(err);
        });
});

// delete todo
app.delete('/:id', function (req, res, next) {
    Todo.findByIdAndRemove(req.params.id, req.body).
        then(function(todo) {
            res.json({data: todo});
        })
        .catch(function(err) {
            res.send(err);
        });
});


app.listen(3000)
