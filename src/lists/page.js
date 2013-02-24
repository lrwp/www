function(head, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            page = getRow(),
            date = new Date();

        if (!page) {
            return this.templates.layout.e404;
        }

        // Render the view
        return Mustache.to_html(this.templates.layout[page.doc.layout], {
                title: page.doc.title,
                body: page.doc.content,
                modified: page.doc.modified,
                author: page.doc.author,
                description: page.doc.description,
                keywords: page.doc.keywords,
                schema: 'page',
                id: page.id,
                user: req.userCtx,
                year: date.getFullYear()
            });
    });
}