function(doc, req) {

    'use strict';
  
    provides('xml', function () {
        var
            Mustache = require('lib/Mustache'),
            ea,
            pages = [];

        // Loop through all documents in view
        while (ea = getRow()) {
            // Push the doc
            pages.push({
                link: ea.key,
                modified: ea.value
            });
        }

        // Render the view
       return Mustache.to_html(this.templates.sitemap, {pages: pages});

    });
}
