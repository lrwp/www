$(function () {
    'use strict';

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    var
        $form = $('#contactForm'),
        $send = $('#contactSend');

    $form.submit(function () {
        $form.find('[name=url]').val(window.location);
        // I'm assuming most of the spam bots that we've been seeing
        // aren't using javscript, if so this should stop most of them
        // if not we'll have to add a captcha :(
        $form.append('<input type="hidden" name="notabot" value="1"/>');
        $.ajax({
            url: '/sendemail',
            type: 'POST',
            cache: false,
            data: $(this).serialize(),
            success: function (response) {
                if (response.trim() === 'ok') {
                    $send.fadeOut('fast');
                    $('#contactModal .vcard').fadeOut('fast');
                    $form.fadeOut('fast', function () {
                        $('#contactOk').fadeIn('fast');
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

    $send.click(function () {
        $form.submit();
    });
});
