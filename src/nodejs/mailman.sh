#!/usr/local/bin/node
// Send mail from website
(function (undefined) {

    'use strict';

    console.log(new Date());
    
    var
        http = require('http'),
        qs = require('querystring'),
        fs = require('fs'),
        cfg = JSON.parse(fs.readFileSync('/etc/sites/lrwp.json', 'utf-8')),
        trebuchet = require('trebuchet')(cfg.mail.token),
        check = require('validator').check,
        sanitize = require('validator').sanitize;

    http.createServer(function (req, res) {

        // This process is not public facing
        // so we can let NGINX handle POST body limits
        if (req.method == 'POST') {
            var body = '';

            req.on('data', function (data) {
                body += data;
            });

            req.on('end', function () {
                var
                    POST = qs.parse(body),
                    err = false,
                    to;

                if (!POST.name) {
                    err = "Name is required";
                }

                if (POST.name && POST.name.length > 64) {
                    err = "Name can't exceed 64 characters";
                }

                if (!POST.email || !check(POST.email).isEmail()) {
                    err = "A valid email is required";
                }

                if (!POST.message) {
                    err = "A message is required";
                }

                if (POST.message && POST.message > 5000) {
                    err = "Message cannot exceed 5000 characters";
                }

                if (POST.who && cfg.mail.accounts[POST.who]) {
                    POST.to = cfg.mail.accounts[POST.who];
                } else {
                    err = "Error selecting recipient";
                }

                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });

                if (!err) {

                    POST.date = new Date();
                    POST.url = POST.url || req.headers['origin'];
                    POST.agent = req.headers['user-agent'];
                    POST.ip = req.headers['x-forwarded-for'];
                    POST.referer = req.headers['referer'];
                    POST.message = sanitize(POST.message).xss();

                    trebuchet.fling({
                            html: '../templates/mail.html',
                            text: '../templates/mail.txt',
                            params: {
                                from: cfg.mail.from,
                                to: POST.to,
                                subject: 'New mail from LRWP website',
                                replyto: POST.email
                            },
                            data: POST,
                        },
                        function (err, response) {
                            if (err) {
                                res.end(err);
                            } else {
                                console.log(POST.date, POST.to, POST.email);
                                res.end('ok');
                            }
                        });
                } else {
                    res.end(err);
                }

            });

        } else {
            res.end();
        }
    }).listen(8080);

}());
