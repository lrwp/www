function(doc, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            ea, body,
            date = new Date(),
            view = {};

        // Loop through all documents in view
        while (ea = getRow()) {
            if (!view.hasOwnProperty(ea.value.schema)) {
                view[ea.value.schema] = [];
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
