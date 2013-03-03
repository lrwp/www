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
            page,
            bottom = req.query.hasOwnProperty('bottom'),
            volunteer = req.query.hasOwnProperty('volunteer'),
            catOrder = ['Special Events', 'Saturday Hiking', 'Little River Ramblers', 'Breakfast on the Marsh', 'Volunteer Opportunities'];

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
                    category: ea.doc.category,
                    span : 'span12',
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

        // We want to see the categories in a particualr order
        for (ea in catOrder) {
            if (view.hasOwnProperty(catOrder[ea])) {
                events.push(view[catOrder[ea]]);
            }
        }

        // Render the view
//       return JSON.stringify(view, null, 4);
        body = Mustache.to_html(this.templates['event-page'], {
                events: events,
                page: page,
                bottom: bottom,
                top: !bottom,
                volunteer: volunteer
            },
            {
                event: this.templates.partials.event,
                volunteer: volunteer ? this.templates.partials.volunteer : null
            });

        return Mustache.to_html(this.templates.layout.default, {
                title: page.title,
                body: body,
                year: date.getFullYear(),
                script: page.script,
                style: page.style,
                microformat: true
            },
            {
                banner: this.templates.partials.banner,
                navigation: this.templates.partials.navigation,
                footer: this.templates.partials.footer
            });
    });
}
