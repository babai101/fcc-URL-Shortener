var express = require("express");
var mongo = require("mongodb").MongoClient;
var mongoUrl = 'mongodb://localhost:27017/fcc-backend';
var app = express();
var valid_url = require("valid-url");
var appUrl = 'https://backend-projects-babai101.c9users.io';

function getRandomString(min, max) {
    return (Math.floor(Math.random() * (max - min) + min));
}

function random_url() {
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var output = '';
    for (var i = 0; i < 5; i++) {
        output += letters.charAt(getRandomString(0, 62));
    }
    return output;
}

function exists(newUrl, res) {
    mongo.connect(mongoUrl, function(err, db) {
        if (err) {
            res.send({
                error: "error fetching original url"
            });
        }
        var object = {};
        db.collection('shortened_urls').find({
            url: newUrl
        }, {
            url: 0,
            _id: 0
        }).toArray(function(err, documents) {
            if (err) {
                res.send({
                    error: "error fetching original url"
                });
            }
            if (documents.length < 1) {
                var newShortUrl = random_url();
                insertNewUrl(newUrl, newShortUrl, res);
            }
            else {
                object = {
                    original_url: newUrl,
                    short_url: appUrl + '/' + documents[0].short_url
                };
                res.send(object);
            }
        });
        db.close();
    });
}

function getOrigUrl(short_url, res) {
    mongo.connect(mongoUrl, function(err, db) {
        if (err) {
            res.send({
                error: "error fetching original url"
            });
        }
        db.collection('shortened_urls').find({
            short_url: short_url
        }, {
            short_url: 0,
            _id: 0
        }).toArray(function(err, documents) {
            console.log(documents);
            if (err) {
                console.log(err);
                res.send({
                    error: "error fetching original url"
                });
            }
            if (documents.length < 1) {
                res.send({
                    error: "no such shortened urls exist"
                });
            }
            else {
                res.redirect(documents[0].url);
            }
        });
        db.close();
    });
}

function insertNewUrl(newUrl, newShortUrl, res) {
    mongo.connect(mongoUrl, function(err, db) {
        if (err) {
            res.send({
                error: "error fetching original url"
            });
        }
        var object = {
            url: newUrl,
            short_url: newShortUrl
        };
        db.collection('shortened_urls').insert(object, function(err, data) {
            if (err) return console.log('error inserting to db' + err);
            object = {
                    original_url: newUrl,
                    short_url: appUrl + '/' + newShortUrl
                };
            res.send(object);
            console.log('successfully inserted ' + newUrl + ' ' + newShortUrl);
        });
        db.close();
    });
}

app.get('/new/:url*', function(req, res) {
    console.log('new url creating....');
    var newUrl = req.params.url + req.params[0];
    console.log('newurl: ' + newUrl);
    var object = {};
    if (valid_url.isUri(newUrl)) {
        exists(newUrl, res);
    }
    else {
        object = {
            error: "Not a valid URL"
        };
        res.send(object);
    }
});

app.get('/:short_url', function(req, res) {
    console.log('fetching original url');
    var short_url = req.params.short_url;
    getOrigUrl(short_url, res);
});

app.listen(process.env.PORT || 8080);