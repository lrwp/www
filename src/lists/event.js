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
            page;

        Moment.fn.formatInZone = function(format, offset) {
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
                view[ea.doc.category] = { category: ea.doc.category, docs : []};
      
                // add a property the same name as the category for mustache conditionals
                view[ea.doc.category][ea.doc.category] = true;
            }
            
            // Data and time formatting
            ea.doc.dtstart = Moment(ea.doc.start).formatInZone('YYYY-MM-DD HH:mm:ss', -4);
            ea.doc.stime = Moment(ea.doc.start).formatInZone('h:mma', -4);
            ea.doc.dtend = Moment(ea.doc.end).formatInZone('YYYY-MM-DD HH:mm:ss', -4);
            ea.doc.etime = Moment(ea.doc.end).formatInZone('h:mma', -4);
            ea.doc.start = Moment(ea.doc.start).formatInZone('dddd, MMMM Do', -4);

            // Push the doc
            view[ea.doc.category].docs.push(ea.doc);
        }

        // remove keys for Mustache
        for(ea in view) {
            events.push(view[ea]);
        } 

        // Render the view
        //return JSON.stringify(events, null, 4);
        body = Mustache.to_html(this.templates.event, {events: events, page: page});
        return Mustache.to_html(this.templates.layout.default, {
                title: page.title,
                body: body,
                year: date.getFullYear(),
                microformat: true
            });
    });
}
