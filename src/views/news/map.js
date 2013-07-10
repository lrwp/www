function(doc) {
\
   'use strict';
 
   if (doc.schema && !doc.archive) {
        if (doc.schema === 'news' || doc.schema === 'brief') {
            emit(doc.rank, null);
        }
    }
}
