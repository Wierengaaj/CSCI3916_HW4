var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = ('./auth_jwt');
var jwt = require('jsonwebtoken');
var Movie = require('./Movies');
var Review = require('./Reviews');
var User = require('./Users');
var cors = require('cors');
var mongoose = require('mongoose');
const crypto = require("crypto");
var rp = require('request-promise');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

var router = express.Router();

const GA_TRACKING_ID = process.env.GA_KEY;

function trackDimension(category, action, label, value, dimension, metric) {

    var options = { method: 'GET',
        url: 'https://www.google-analytics.com/collect',
        qs:
            {   // API Version.
                v: '1',
                // Tracking ID / Property ID.
                tid: GA_TRACKING_ID,
                // Random Client Identifier. Ideally, this should be a UUID that
                // is associated with particular user, device, or browser instance.
                cid: crypto.randomBytes(16).toString("hex"),
                // Event hit type.
                t: 'event',
                // Event category.
                ec: category,
                // Event action.
                ea: action,
                // Event label.
                el: label,
                // Event value.
                ev: value,
                // Custom Dimension
                cd1: dimension,
                // Custom Metric
                cm1: metric
            },
        headers:
            {  'Cache-Control': 'no-cache' } };

    return rp(options);
}


//**************** MOVIES ROUTING *******************

router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const decoded = jwt.verify(token[1], process.env.SECRET_KEY);
        console.log(decoded);

        let requestName = decoded.username;
        let matchesToken = false;


        for (i = 0; i < req.body.users.length; i++) {
            if(requestName === req.body.users[i].userName){
                matchesToken = true;
                console.log(matchesToken);
            }
        }

        //check if received JSON has minimum required fields
        if(!matchesToken){
            return res.status(401).json({success: false, message: 'User fields empty or doesnt match token, not Authorized .'});
        }
        else if (!req.body.name || !req.body.users) {
            return res.status(400).json({success: false, message: 'Error,  Empty required fields.'});
        }
        else {

            //creation of temp schema
            var movie = new movie();

            movie.title = req.body.title;
            movie.users = req.body.users;

            

            //creating dates

            if(req.body.dateDue){
                todo.dateDue = new Date(JSON.stringify(req.body.dateDue));
            }

            todo.dateCreated = new Date();

            //setting priority

            if(req.body.priority){

                //check to see if string is valid

                if(req.body.priority  === "low" || req.body.priority  === "medium" || req.body.priority  === "high"){
                    todo.priority = req.body.priority;
                }
                else{

                    res.status(400).json({success: false, message: 'Error,  priority string incorrect.'});

                }

            }

            //setting order

            if(req.body.order){

                //check to see if string is valid
                todo.order = req.body.order;
            }


            //creating task and saving to database

            todo.save(function (err, doc) {
                if(err){
                    return res.status(500).send(err);
                }
                else{
                    var returnDoc = doc.toObject();
                    returnDoc.success = true;
                    return res.status(200).json(returnDoc);
                }
                
            });

        }

    })
    .put(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        //TODO: added the below - Cameron
        Todo.findByIdAndUpdate(
            // the id of the item to find
            req.body._id,

            // the change to be made. Mongoose will smartly combine your existing
            // document with this change, which allows for partial updates too
            req.body,

            // an option that asks mongoose to return the updated version
            // of the document instead of the pre-updated one.
            {new: true},

            // the callback function
            (err, movie) => {
                if(!movie) {
                    return res.status(400).json({ success: false, message: 'Failed to update movie with provided id: No such movie found'});
                }

                // Handle any possible database errors
                if (err)
                    return res.status(500).send(err);
                return res.status(200).json({success: true, message: 'Movie updated!'});
            })
        //TODO: added the above - Cameron
    })
    .delete(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        //json  must have of todo id

        if (!req.body._id) {
            return res.status(400).json({success: false, message: 'Error,  Empty id field.'});
        }
        else{

            Todo.findByIdAndDelete(req.body._id, (err, todo) => {
                if(!todo) {
                    return res.status(400).json({success: false, message: 'Failed to delete todo with provided id: No such todo found'})
                }

                if (err)
                    return res.status(500).send(err);
                return res.status(200).json({success: true, message: 'Todo deleted.'});
            })
        }

    })
    .get(authJwtController.isAuthenticated, function (req, res) {

        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const decoded = jwt.verify(token[1], process.env.SECRET_KEY);
        console.log(decoded);

        let name = decoded.username;


        Todo.find( { users: { $elemMatch: { userName :name} }}, function (err, todo) {

            if(err){
                res.status(401).json({ success: false, message: 'Todos could not be found. Check id.' });
            }
            else{
                console.log(todo);
                res.json(todo);
            }

        }  );

    });



//**************** USERS ROUTING *******************

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            //var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({success: false, message: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code === 11000)
                    return res.status(401).json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.status(401).send(err);
            }

            res.json({ success: true, message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    //userNew.name = req.body.name;
    console.log(req.body.username);
    console.log(req.body.password);
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        try{
            user.comparePassword(userNew.password, function(isMatch){
                if (isMatch) {
                    var userToken = {id: user._id, username: user.username};
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json({success: true, token: 'JWT ' + token});
                }
                else {
                    res.status(401).send({success: false, message: 'Authentication failed.'});
                }
            })
        }
        catch(err){
            res.status(401).send({success: false, message: 'Authentication failed. User not known or ' + err.name}) //user not know  for debugging purposes
        }


    });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);


router.route('/test')
    .get(function (req, res) {
        // Event value must be numeric.
        trackDimension('Feedback', 'Rating', 'Feedback for Movie', '3', 'Guardian\'s of the Galaxy 2', '1')
            .then(function (response) {
                console.log(response.body);
                res.status(200).send('Event tracked.').end();
            })
    });

app.use('/', router);
console.log("http://localhost:3000/test");
app.listen(process.env.PORT || 3000);
