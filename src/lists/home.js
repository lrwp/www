function(doc, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            Moment = require('lib/Moment'),
            maxEvents = 6,
            totalEvents = 0,
            ea, body, active = false, push,
            filename, hasFlora = false, hasFauna = false,
            date = new Date(),
            view = {};

        // Loop through all documents in view
        while (ea = getRow()) {

            push = true;

            if (!view.hasOwnProperty(ea.value.schema)) {
                view[ea.value.schema] = [];
            }

            // We want the ID in the object for Mustache
            ea.value.id = ea.id;

            // we nicely format dates for events
            if (ea.value.schema === 'event') {
                ea.value.start = Moment(ea.value.start).format('dddd, MMMM Do, [from] h:mma');
                ea.value.end = Moment(ea.value.end).format('h:mma');
            }
            
            if (ea.value.schema === 'slide') {

                // we need to mark one slide as active
                if (!active) {
                    ea.value.active = 'active';
                    active = true;
                }

            }

            // Make attachments Mustache friendly
            if (ea.value.hasOwnProperty('_attachments')) {
                for (filename in ea.value._attachments) {
                    ea.value.image = '/api/' + ea.value.id + '/' + filename;
                }
            }

            // Only show some events - perhaps we should get events via ajax instead?
            if (ea.value.schema === 'event' && totalEvents < maxEvents) {
                push = true;
                totalEvents += 1;
            } else if (ea.value.schema === 'event') {
                push = false;
            }

            // We def need to move species and events into an ajax call instead
            if (ea.value.schema === 'species') {
                if (ea.value.type === 'Flora' && !hasFlora) {
                    push = true;
                    hasFlora = true;
                } else if (ea.value.type === 'Flora') {
                    push = false;
                }

                if (ea.value.type === 'Fauna' && !hasFauna) {
                    push = true;
                    hasFauna = true;
                } else if (ea.value.type === 'Fauna') {
                    push = false;
                }
            }

            if (push) {
                 view[ea.value.schema].push(ea.value);
            }

       }

        // Render the view
        body = Mustache.to_html(this.templates.home, view);
        return Mustache.to_html(this.templates.layout.default, {
                body: body,
                year: date.getFullYear()
            });
    });
}
