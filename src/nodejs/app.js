(function (undefined) {

    'use strict';

    var 
        fs = require('fs'),
        cfg = JSON.parse(fs.readFileSync('/etc/sites/lrwp.json', 'utf-8')),
        trebuchet = require('trebuchet')(cfg.mail.token),
        check = require('validator').check,
        sanitize = require('validator').sanitize; // mustache will also escape entities
   
    exports.sendemail = function () {

        var
            req = this.req,
            res = this.res,
            POST = req.body,
            err = false,
            to;

        if (!POST.name) {
            err = "Name is required";
        } else {
            POST.name = sanitize(POST.name).xss();
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

        if (POST.phone && POST.phone.length < 32) {
            POST.phone = sanitize(POST.phone).xss();
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
                        subject: 'New message from LRWP website',
                        replyto: POST.email
                    },
                    data: POST,
                },
                function (err, response) {
                    if (err) {
                        res.end(err);
                    } else {
                        console.log('contact:', POST.date, POST.to, POST.email);
                        res.end('ok');
                    }
                });
        } else {
            res.end(err);
        }
    };

    exports.sendapp = function () {
        var
            req = this.req,
            res = this.res,
            POST = req.body,
            err = false,
            to = 2;

        // We only do minimal checking of the volunteer app
        // If the volunteer failed to enter all the information
        // then that is rather telling on its own.

        if (!POST.first) {
            err = "First name is required";
        } 
        
        if (!POST.last) {
            err = "Last name is required";
        } 

        if (!POST.phone) {
            err = "Phone number is required";
        } 

        if (POST.certify !== 'on') {
            err = "You must certify thatt all entries on this application and all information in it are TRUE and COMPLETE to the best of your knowledge.";
        }

        if (POST.authorize !== 'on') {
            err = "You must authorize investigation of all statements contained in this application as may be necessary in arriving at a decision.";
        }
        
        if (POST.understand !== 'on') {
            err = "You must confirm that you understand that information may be obtained through interviews with the references. This inquiry may include information as to your character, general reputation, and personal characteristics.";
        }

        if (POST.release !== 'on') {
            err = "You must release all parties, including Little River Wetlands Project and references, from liability for any injury or damage that may result from their furnishing information concerning you or any action Little River Wetlands Project takes on the basis of such information.";
        }

        if (POST.grant !== 'on') {
            err = "You must grant permission to Little River Wetlands Project and/or agents authorized by them to use any photographs, videotapes, motion picture, recordings, or any other record for any purpose.";
        }

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });


        if (!err) {

            POST.date = new Date();
            POST.agent = req.headers['user-agent'];
            POST.ip = req.headers['x-forwarded-for'];
            POST.referer = req.headers['referer'];

            trebuchet.fling({
                    html: '../templates/volunteer-app.html',
                    text: '../templates/volunteer-app.txt',
                    params: {
                        from: cfg.mail.from,
                        to: cfg.mail.accounts[to],
                        subject: 'New volunteer application from LRWP website',
                        replyto: POST.email
                    },
                    data: POST,
                },
                function (err, response) {
                    if (err) {
                        res.end(err);
                    } else {
                        console.log('app:', POST.date, POST.first + ' ' + POST.last, POST.phone);
                        res.end('ok');
                    }
                });
        } else {
            res.end(err);
        }
    };

}());
