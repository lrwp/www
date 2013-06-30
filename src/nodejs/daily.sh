#!/usr/bin/node
// Archive old events
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
            path: '/'+cfg.db.db+'/_design/www/_view/event-by-end/?include_docs=true'
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
                        expired.push(events.rows[ea]);
                    }
                }

                if (expired.length) {

                    for (ea in expired) {
                        expired[ea].doc.archive = true;
                        req2 = http.request({
                            method: 'PUT',
                            hostname: cfg.db.host,
                            port: cfg.db.port,
                            path: '/' + cfg.db.db + '/' + expired[ea].id,
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
                        req2.write(JSON.stringify(expired[ea].doc), 'utf8');
                        req2.on('error', function(e){
                            console.log(e);
                        });
                        req2.end();
                    }
                }

            });
        });
}());
