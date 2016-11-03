var liveTimer = null;
var wait_fetch = null;
var unique_serie_id = 1;

var sqls = {};

function bind_buttons() {

    $('#bt_live_data').click(function(e) {
        if (liveTimer == null) {
            liveTimer = 2000;
            fetch_results(sqls, update_series);
            $('#live_button_image').attr('src', 'images/ajax-loader.gif');
            $(this).addClass('action_clicked');
        } else {
            xhr.abort();
            $(this).removeClass('action_clicked');
            clearTimeout(wait_fetch);
            liveTimer = null;
            $('#live_button_image').attr('src', 'images/download.png');
        }

    });
    $('#bt_load_series').click(function() {
        if (liveTimer != null) {
            // turn off live fetching
            $('#bt_live_data').trigger('click');
        }
        load_series(true, 'no-animation');
    });

    $('#zoomOut').click(function() {
        chart.zoomOut();
    });

    $('#white_background').click(function() {
        $('#container').css("background-color", "white");
    });

    $("#sortable").sortable();
    $("#sortable").disableSelection();

    $('#add_serie').click(function() {
        add_serie();
    });

    $('#update_sqls').click(function() {
        load_series(false, 'animate');
    });

    $("#toggle_datapoints").change(function() {
        toggle_datapoints(this.checked);
    });
    $("#toggle_mousetracking").change(function() {
        toggle_mousetracking(this.checked);
    });
    $("#nonlinearX").change(function() {
        load_series(true, 'no-animation');
    });
    $("#force_redraw").change(function() {
        chart.redraw();
    });

    $('#popupClose').click(function() {
        loadPopup(false);
        return false;
    });
    $('#save').click(function() {
        $("#save_xml").val(save_sql_to_xml());
        loadPopup(true);
    });

    $('#enable_sortable').change(function() {
        if ($(this).is(':checked')) {
            $('#sortable').sortable('enable');
            $('.ui-icon.ui-icon-arrowthick-2-n-s').show();
        } else {
            $('#sortable').sortable('disable');
            $('.ui-icon.ui-icon-arrowthick-2-n-s').hide();
        }
    });
    $('#enable_sortable').trigger('change');

    add_new_codemirror_sql_editor('prepare_sql');
    add_new_codemirror_sql_editor('sandbox_sql');

    $('#execute_prepare_sql').click(function() {
        var val = codemirror_editors['prepare_sql'].getValue().trim();
        if (val == "") {
            write_error('Prepare SQL-field is empty.');
        } else {
            fetch_results(val, null);
        }
    });

    $('#execute_sandbox_sql').click(function() {
        var val = codemirror_editors['sandbox_sql'].getValue().trim();
        if (val == "") {
            write_error('Sandbox SQL-field is empty.');
        } else {
            fetch_results(val, null);
        }
    });

    $("input:radio[name='charttype']").change(function() {
        if ($("#charttype_column").is(":checked")) {
            CHART_OPTS = CHART_COLUMN_STYLE;
        } else if ($('#charttype_areaspline').is(":checked")) {
            CHART_OPTS = CHART_AREASPLINE_STYLE;
        } else {
            CHART_OPTS = CHART_SPLINE_STYLE;
        }
        load_series(true, 'no-animation');
    });
    $('#stack_columns').change(function() {
        CHART_COLUMN_STYLE['column_stacking'] = $('#stack_columns').is(':checked') ? 'normal' : null;
        // true or false

        CHART_OPTS = CHART_COLUMN_STYLE;
        load_series(true, 'no-animation');
    });

    // Programmatically-defined buttons
    $("#export_csv").click(function() {
        var authWindow = window.open('about:blank', '_blank', 'left=20,top=20,width=650,height=500,toolbar=0,resizable=1');
        $(authWindow.document.body).html('<pre>' + chart.getCSV() + '</pre>');
        authWindow.document.title = "VIVI:: CSV-export";
    });
}

//////////////////////////////////////////////////////////////////////////////////
// popup for save-dialog
function loadPopup(up) {
    if (up) {// show
        // make sure it's centered
        var windowWidth = document.documentElement.clientWidth;
        var windowHeight = document.documentElement.clientHeight;
        var popupHeight = $("#popup").height();
        var popupWidth = $("#popup").width();
        //centering
        $("#popup").css({
            "position" : "fixed",
            "top" : windowHeight / 2 - popupHeight / 2,
            "left" : windowWidth / 2 - popupWidth / 2
        });

        $("#backgroundPopup").css({
            "opacity" : "0.7"
        });

        $("#backgroundPopup").fadeIn("fast");
        $("#popup").fadeIn("fast");

        setTimeout(function() {// after 100 ms (when popup loaded, select all)
            $("#save_xml").trigger("click");
        }, 100);

    } else {// hide
        $("#popup").fadeOut("fast");
        $("#backgroundPopup").fadeOut("fast");
    }
}
