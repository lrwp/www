$(function () {

    'use strict';

    var $wrap = $('.wrap');

    $.get('/page/directions?xhr', function (content) {
        $wrap.append(content);
    });

});
