function(doc) {
 
   'use strict';
    
    if (doc.schema === 'page') {
        emit(doc.link, doc.modified || doc.created);
    }

}
