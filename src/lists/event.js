function(doc, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            Moment = require('lib/Moment'),
            ea, 
            events = [];

        Moment.fn.formatInZone = function(format, offset) {

            if (this.month() >= 2 && this.date() >= 9) {
                offset += 1;
            }

            return this.clone().utc().add('hours', offset).format(format);
        }

        // Loop through all documents in view
        while (ea = getRow()) {

            // Dont need the event page
            if (ea.doc.schema === 'page') {
                break;
            }
            
            // Data and time formatting
            ea.doc.dtstart = Moment(ea.doc.start).formatInZone('YYYY-MM-DDTHH:mm:ss', -5) + '-05:00';
            ea.doc.stime = Moment(ea.doc.start).formatInZone('h:mma', -5);
            ea.doc.dtend = Moment(ea.doc.end).formatInZone('YYYY-MM-DDTHH:mm:ss', -5) + '-05:00';
            ea.doc.etime = Moment(ea.doc.end).formatInZone('h:mma', -5);
            ea.doc.start = Moment(ea.doc.start).formatInZone('dddd, MMMM Do', -5);
            
            // Push the doc
            events.push(ea.doc);
        }

        // Render the view
       //return JSON.stringify(events, null, 4);
       return Mustache.to_html(this.templates.event, {events: events}, { event: this.templates.partials.event });

    });
}
