function(doc, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            maxEvents = 6,
            totalEvents = 0,
            ea, active = false, push,
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
        return Mustache.to_html(this.templates.layout.home, {
                body: Mustache.to_html(this.templates.home, view),
                year: date.getFullYear()
            },
            {
                banner: this.templates.partials.banner,
                navigation: this.templates.partials.navigation,
                footer: this.templates.partials.footer
            });
    });
}
