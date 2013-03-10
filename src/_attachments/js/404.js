$(function () {

    'use strict';

    var $query = $('#search404');

    $('#search404form').submit(function () {
        window.location = $(this).attr('action') + window.encodeURIComponent($query.val());
        return false;
    });

    // Try to set them up for success
    $query.val(window.location.pathname.split('/').pop());

});
