function(doc) {
 
   'use strict';
    
    if (doc.schema === 'page' && doc.link !== 'manage-notes') {
        emit(doc.link, doc.modified || doc.created);
    }

}
