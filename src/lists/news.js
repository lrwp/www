function(doc, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            ea, body,
            date = new Date(),
            view = {
                brief: [],
                news: []
            };

        // Loop through all documents in view
        while (ea = getRow()) {
            view[ea.doc.schema].push(ea.doc);
        }

        // Render the view
//       return JSON.stringify(view, null, 4);
        body = Mustache.to_html(this.templates.news, view);
        return Mustache.to_html(this.templates.layout.default, {
                title: "What's new at LRWP",
                body: body,
                year: date.getFullYear(),
                nowrap: true,
                style: '/css/news.css',
            },
            {
                banner: this.templates.partials.banner,
                navigation: this.templates.partials.navigation,
                footer: this.templates.partials.footer
            });
    });
}
