function(doc, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            ea,
            schema = {},
            view = {
                schema: []
            };

        // Create an empty structure for each schema in the ddoc
        for (ea in this.schema) {
            schema[ea] = {name: ea, docs: []};
        }

        // Loop through all documents in view
        while (ea = getRow()) {
            ea.value.id = ea.id;
            schema[ea.key].docs.push(ea.value);
        }

        // Translate to Mustache
        for (ea in schema) {
            view.schema.push(schema[ea]);
        }

        // Render the view
        return Mustache.to_html(this.templates.layout.manage, view);
    });
}
