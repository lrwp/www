function(doc) {
 
   'use strict';

    if (doc.schema && doc.schema === 'news' || doc.schema === 'brief' && !doc.archive) {
        emit(doc.rank, null);
    }

}
