var openSubMenu;

function toggleSubMenu(id) {
    divID = "menu_" + id;
    butID = "bt_" + id;

    if (! $("#" + divID).is(':visible')) {
        // eerst snel ff zien of er nog geen ander open staat, zoja sluiten we
        // dit, anders wordt opensubmenu overschreven ;(
        if (openSubMenu != null) {
            $("#bt_" + openSubMenu).removeClass("clicked");
            $("#bt_" + openSubMenu).addClass("bt");
            $("#menu_" + openSubMenu).fadeOut(50);
        }

        $("#" + butID).removeClass("bt");
        $("#" + butID).addClass("clicked");

        $("#" + divID).fadeIn(100, function() {
            openSubMenu = id;
        });

    } else {// hide

        $("#" + butID).removeClass("clicked");
        $("#" + butID).addClass("bt");
        $("#" + divID).fadeOut(100, function() {
            openSubMenu = null;
        });

    }

}

$(function() {
    $("#bt_options").click(function() {
        toggleSubMenu("options");
    });

    $("#bt_help").click(function() {
        toggleSubMenu("help");
    });

    $("#bt_load").click(function() {
        toggleSubMenu("load");

        // meh.. dirty but no other way, else they remain 'white'
        for (var ce in codemirror_editors) {
            codemirror_editors[ce].save();
            codemirror_editors[ce].refresh();
        }

    });

    $("#bt_save").click(function(e) {
        saveData();
        //e.preventDefault();
        //return false;
    });

    $("#bt_db").click(function() {
        toggleSubMenu("db");

        // meh.. dirty but no other way, else they remain 'white'
        for (var ce in codemirror_editors) {
            codemirror_editors[ce].save();
            codemirror_editors[ce].refresh();
        }
    });

    $('#bt_params').click(function() {
        $('#bt_params').removeClass("breathing_button");
        toggleSubMenu("params");
    });

    // $('#chart_title').change(function() {
        // setTitle($(this).val());
    // });
    // $('#chart_x_axis').change(function() {
        // setAxisTitle($(this).val(), 'x');
    // });
    // $('#chart_y_axis').change(function() {
        // setAxisTitle($(this).val(), 'y');
    // });
});

$(document).click(function(e) {
    if (!$(e.target).parents("#menu_" + openSubMenu).length) {
        // buiten menu klikken == inklappen
        // fixed: als je op 'remove serie button' klikte werd ie ook ingeklapt...
        toggleSubMenu(openSubMenu);
    }
});

function close_menu() {
    toggleSubMenu(openSubMenu);
}
