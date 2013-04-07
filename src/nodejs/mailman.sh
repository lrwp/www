#!/usr/local/bin/node
// Send mail from website
(function (undefined) {

    'use strict';

    console.log(new Date());
    
    var
        http = require('http'),
        app = require('./app.js'),
        director = require('director'),
        router = new director.http.Router({
            '/sendemail' : {
                post: app.sendemail
            },
            '/sendapp': {
                post: app.sendapp
            }
        });

    http.createServer(function (req, res) {

        req.chunks = [];
        req.on('data', function (chunk) {
            req.chunks.push(chunk.toString());
        });

        router.dispatch(req, res, function (err) {
            if (err) {
                res.writeHead(404);
                res.end();
            }
        });


    }).listen(8080);

}());
