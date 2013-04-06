#!/usr/local/bin/node
// Remove old events
(function (undefined) {

    'use strict';

    console.log(new Date());

    var
        fs = require('fs'),
        cfg = JSON.parse(fs.readFileSync('/etc/sites/lrwp.json', 'utf-8')),
        http = require('http'),
        reqOpt = {
            method: 'GET',
            hostname: cfg.db.host,
            port: cfg.db.port,
            path: '/lrwp/_design/www/_view/event-by-end'
        },
        req = http.get(reqOpt, function (res) {
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                var
                    events = JSON.parse(data),
                    ea,
                    expired = [],
                    now = (new Date()).toISOString(),
                    req2;

                for (ea in events.rows) {
                    if (events.rows[ea].key < now) {
                        expired.push({ id : events.rows[ea].id, rev: events.rows[ea].value });
                    }
                }

                if (expired.length) {

                    console.log('Expired Events', expired);

                    for (ea in expired) {
                        req2 = http.request({
                            method: 'DELETE',
                            hostname: cfg.db.host,
                            port: cfg.db.port,
                            path: '/' + cfg.db.db + '/' + expired[ea].id + '?rev=' + expired[ea].rev,
                            auth: cfg.db.user +':'+ cfg.db.pass
                        }, function(res){
                            var data = '';
                            res.on('data', function (chunk) {
                                data+=chunk;
                            });
                            res.on('end', function() {
                                console.log(data);
                            });
                        });
                        req2.on('error', function(e){
                            console.log(e);
                        });
                        req2.end();
                    }
                }

            });
        });
}());
