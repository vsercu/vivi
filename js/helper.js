var errorTimeout;
function write_error(msg, defsec) {
    if (defsec == undefined) {
        defsec = 2300;
    }

    $('#errors').append('<div style="padding-bottom: 5px; padding-right: 20px;"><div class="info-error-iconspace "><span class="ui-icon ui-icon-alert"></span></div>' + msg + "</div>");

    if ($('#errors').text().length > 25) {
        // an extra  xxms per extra letter
        defsec += ($('#errors').text().length - 25) * 30;
    }

    $('#errors-div').fadeIn(75);

    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(function() {
        // todo make some kind of timer that resets when a new append
        // is done
        $('#errors-div').fadeOut('fast');
        $('#errors').text("");
    }, defsec);
}

function show_loading_msg() {
    var start_time = new Date().getTime();
    $('#processing').fadeIn('fast');
    if (pro_sec_int != null || pro_sec_int != undefined) {
        clearInterval(pro_sec_int);
        $('#processing-sec').text('(' + Math.round((new Date().getTime() - start_time) / 100) / 10 + ' sec.)');
    }

    pro_sec_int = setInterval(function() {
        if ($('#processing').is(":visible")) {
            $('#processing-sec').text('(' + Math.round((new Date().getTime() - start_time) / 100) / 10 + ' sec.)');
        } else {
            clearInterval(pro_sec_int);
        }
    }, 100);
}