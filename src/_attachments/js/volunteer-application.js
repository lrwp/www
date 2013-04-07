$(function () {
    'use strict';

    $('.hide-next').change(function () {
        var
            $this = $(this),
            toggle = $this.attr('data-toggle') || 'Yes';

        if ($this.val() === toggle || !$this.val()) {
            $this.next('div').hide();
        } else {
            $this.next('div').show();
        }
    });

    $('#sendapp').submit(function () {
        console.log($(this).serialize());
        return false;
    });
});
