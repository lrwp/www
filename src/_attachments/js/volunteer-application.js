$(function () {
    'use strict';

    var $app = $('#sendapp');

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

    $app.submit(function () {
        var $this = $(this);
        $.ajax({
            url: '/sendapp',
            type: 'POST',
            cache: false,
            data: $this.serialize(),
            success: function (response) {
                if (response.trim() === 'ok') {
                    $this.fadeOut('fast', function () {
                        $('#appThanks').fadeIn('fast');
                    });
                } else {
                    window.alert(response);
                }
            },
            error: function (jxhr, str, msg) {
                window.alert('An error has occurred: ' + msg);
            }
        });

        return false;
    });
});
