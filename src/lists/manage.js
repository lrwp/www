function(doc, req) {   
    var Mustache = require('lib/mustache');

    provides('html', function() {
        var
            schemas = ['brief', 'news', 'slide', 'event', 'page'],
            row, i,
            group = {},
            view = {
                schema: []
            };

        while (row = getRow()) {
            if (!group.hasOwnProperty(row.key)) {
                group[row.key] = {
                    name: row.key,
                    docs: []
                };
            }
            group[row.key].docs.push(row.value);
            group[row.key].hasDocs = true;
        }

        for (i in group) {
            if (schemas.indexOf(i) !== -1) {
                schemas.splice(schemas.indexOf(i), 1);
            }
            view.schema.push(group[i]);
        }

        // add empty objects for any empty schemas
        if (schemas.length) {
            for (i in schemas) {
                view.schema.push({name: schemas[i], docs: [], hasDocs: false});
            }
        }

        return Mustache.to_html(this.templates.manage, view);
    });
}
