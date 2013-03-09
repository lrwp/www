function(head, req) {

    'use strict';
  
    provides('html', function () {
        var
            Mustache = require('lib/Mustache'),
            page = getRow(),
            date = new Date(),
            xhr = req.query.hasOwnProperty('xhr');

        if (!page) {
            page = {
                id: null,
                doc: {
                    title: 'Page not found',
                    layout: 'default',
                    content: this.templates['404'],
                    modified: null,
                    author: null,
                    description: null,
                    keywords: null,
                    script: null,
                    style: '/css/404.css' 
                }
            };
        }

        // Render the view
        if (xhr) {
            return page.doc.content
        }

        return Mustache.to_html(this.templates.layout[page.doc.layout], {
                title: page.doc.title,
                body: page.doc.content,
                modified: page.doc.modified,
                author: page.doc.author,
                description: page.doc.description,
                keywords: page.doc.keywords,
                schema: 'page',
                script: page.doc.script,
                style: page.doc.style,
                id: page.id,
                user: req.userCtx,
                year: date.getFullYear()
            },
            {
                banner: this.templates.partials.banner,
                navigation: this.templates.partials.navigation,
                footer: this.templates.partials.footer
            });
    });
}
