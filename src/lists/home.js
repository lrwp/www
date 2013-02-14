function(doc, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            Moment = require('lib/Moment'),
            maxEvents = 5,
            totalEvents = 0,
            ea, body, active = false,
            date = new Date(),
            view = {};

        // Loop through all documents in view
        while (ea = getRow()) {
            if (!view.hasOwnProperty(ea.value.schema)) {
                view[ea.value.schema] = [];
            }

            // we nicely format dates for events
            if (ea.value.schema === 'event') {
                ea.value.start = Moment(ea.value.start).format('dddd, MMMM Do, [from] h:mma');
                ea.value.end = Moment(ea.value.end).format('h:mma');
            }
            
            // we need to mark one slide as active
            if (ea.value.schema === 'slide' && !active) {
                ea.value.active = 'active';
                active = true;
            }

            // We want the ID in the object for Mustache
            ea.value.id = ea.id;

            // Only show some events - perhaps we should get events via ajax instead?
            if (ea.value.schema === 'event' && totalEvents < maxEvents) {
                view[ea.value.schema].push(ea.value);
                totalEvents += 1;
            } else {
                view[ea.value.schema].push(ea.value);
            }

       }

        //return JSON.stringify(view, null, 4);
        // Render the view
        body = Mustache.to_html(this.templates.home, view);
        return Mustache.to_html(this.templates.layout.default, {
                body: body,
                year: date.getFullYear()
            });
    });
}
