function(doc, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            Moment = require('lib/Moment'),
            body,
            date = new Date(),
            ea, 
            view = {},
            events = [],
            page, cat,
            xhr = req.query.hasOwnProperty('xhr'),
            nocat = req.query.hasOwnProperty('nocat');

        Moment.fn.formatInZone = function(format, offset) {
            // adjust for dst
            offset += 1;
            return this.clone().utc().add('hours', offset).format(format);
        }

        // Lop through all documents in view
        while (ea = getRow()) {

            // Grab the event page
            if (ea.doc.schema === 'page') {
                page = ea.doc;
                break;
            }

            // Create a Mustache-Friendly structure
            if (!view.hasOwnProperty(ea.doc.category)) {

                view[ea.doc.category] = {
                    category: nocat ? null : ea.doc.category,
                    span : xhr ? 'span8' : 'span12',
                    docs : []
                };
      
                // add a property the same name as the category for mustache conditionals
                view[ea.doc.category][ea.doc.category] = true;
            }
            
            // Data and time formatting
            ea.doc.dtstart = Moment(ea.doc.start).formatInZone('YYYY-MM-DDTHH:mm:ss', -5) + '-05:00';
            ea.doc.stime = Moment(ea.doc.start).formatInZone('h:mma', -5);
            ea.doc.dtend = Moment(ea.doc.end).formatInZone('YYYY-MM-DDTHH:mm:ss', -5) + '-05:00';
            ea.doc.etime = Moment(ea.doc.end).formatInZone('h:mma', -5);
            ea.doc.start = Moment(ea.doc.start).formatInZone('dddd, MMMM Do', -5);
            
            // Push the doc
            view[ea.doc.category].docs.push(ea.doc);
        }

        // remove keys for Mustache
        for(ea in view) {
            events.push(view[ea]);
        } 

        // Render the view
//       return JSON.stringify(view, null, 4);
        body = Mustache.to_html(this.templates.event, {
                events: events,
                page: page || null
            },
            {
                event: this.templates.partials.event
            });

        if (xhr) {
            return body;
        }

        return Mustache.to_html(this.templates.layout.default, {
                title: page ? page.title : null,
                body: body,
                year: date.getFullYear(),
                microformat: true
            });
    });
}
