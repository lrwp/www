function(doc) {
 
   'use strict';

    if (doc.schema === 'page' && doc.link === 'volunteer') {
        emit(doc.schema, null);
    }

    if (doc.schema === 'event' && doc.category === "Volunteer Opportunities") {
        emit(doc.start, null);
    }

}
