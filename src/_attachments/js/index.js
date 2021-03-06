$(function () {

    'use strict';

    var
        $slideshow = $('#slideshow'),
        $control = $slideshow.find('.carousel-control'),
        $species = $('.species'),
        $events = $('#events'),
        cache = { species: {} };

    $slideshow.carousel({
        interval: 7500
    });

    // Show/Hide Carousel Controls
    $slideshow.hover(function () {
        $control.fadeIn();
    }, function () {
        $control.fadeOut();
    });

    // Handle slide links 
    $slideshow.on('click', '.carousel-inner', function () {
        var $active = $(this).find('.active[data-link]');

        if ($active.length) {
            window.location = $active.attr('data-link');
        }
    });

    // Species Dialog
    $species.each(function () {
        var $this = $(this), $target = $($this.attr('data-target'));

        $target.modal({
            show: false
        });

        $this.click(function () {
            var id = $this.attr('data-id');
            if (!cache.species.hasOwnProperty(id)) {
                $.get('/_show/species/' + id, function (resp) {
                    cache.species[id] = resp;
                    $target.find('.species-content').html(resp);
                    $target.modal('show');
                });
            } else {
                $target.modal('show');
            }
        });
    });

    $.get('/_list/event/public-event?limit=6&include_docs=true', function (res) {
        $events.html(res);

        // Mark any events happeneing today.
        var now = new Date();

        $('.dtstart .value-title').each(function () {
            var d = new Date(this.title);
            if (d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
                $(this).parents('b').siblings('h4').append('<sup>Today!</sup>');
            }
        });
    });

    // if slide content has a class called 'slid-hide-me' then remove the content
    $('.slide-hide-me').parents('.carousel-caption').hide();

});
