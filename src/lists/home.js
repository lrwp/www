function(doc, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            Moment = require('lib/Moment'),
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
            
            // we need to mark on slide as active
            if (ea.value.schema === 'slide' && !active) {
                ea.value.active = 'active';
                active = true;
            }

            ea.value.id = ea.id;
            view[ea.value.schema].push(ea.value);
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
