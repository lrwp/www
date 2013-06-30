 // This is a special view for the homepage
function(doc) {

    'use strict';

    if (doc.schema && doc.schema == 'event' && !doc.archive) {

        // Some events dont get shown on the homepage
        if (doc.category === 'Little River Ramblers' || doc.category === 'Breakfast on the Marsh') {
            return;
        }

        emit(doc.start, null);
    }
}
