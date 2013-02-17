function(newDoc, oldDoc, userCtx) {

    // Require Authentication
    if (!userCtx.name) {
        throw({forbidden : 'You must be logged in'});
    }

    // Check Roles
    if (userCtx.roles.indexOf('_admin') === -1 && userCtx.roles.indexOf('lrwp') === -1) {
        throw({forbidden: 'You are not a member of this database.'});
    }

    // Don't validate documents being deleted
    if (newDoc._deleted) {
        return;
    }

    // We require a schema to do validation
    if (!newDoc.schema) {
        throw({forbidden : 'The document schema is missing.'});
    }

    // ...and that schema must exist
    if (!this.schema.hasOwnProperty(newDoc.schema)) {
        throw({forbidden : 'There is no schema for: ' + newDoc.schema});
    }

    // Confirm that the author is who they claim to be
    if (userCtx.name !== newDoc.author) {
        throw({forbidden: 'Author must be the current user.'});
    }

    // Do Schema validation
    var
        JSV = require("lib/jsv").JSV,
        env = JSV.createEnvironment('json-schema-draft-03'),
        report = env.validate(newDoc, this.schema[newDoc.schema]),
        property;

    if (report.errors.length) {
        // Can only throw one error at a time (without stringifying)
        // See issue: COUCHDB-1635
        property = report.errors[0].uri.split('/')[1];
        throw({forbidden: report.errors[0].message + " : " + property});
    }
}
