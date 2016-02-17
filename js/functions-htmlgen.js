function create_paramfield(uid, value) {
    if ($('#paramField' + uid).length == 0) {
        // doesnt exist yet.
        var label = $('<label for="paramField' + uid + '">' + uid + ': </label>');
        var input = $('<input id="paramField' + uid + '" type="text" value="" maxlength="50">');

        $("#sqlparams").append(label);
        $("#sqlparams").append(input);
        $("#sqlparams").append($('<br/>'));

        if (value != undefined) {
            $('#paramField' + uid).val(value);
            console.log("Parameter-field added for ", uid, " with value: ", value);
        } else {
            console.log("Parameter-field added for ", uid, " without value.");
        }

    } else {
        //console.warn("Parameter-field not added for ", uid, "! It already
        // exists.");
    }
}

var codemirror_editors = {};
function add_serie(name, sql, setnav, color) {
    var colorpicker = $('<input type="text" id="color_serie_' + unique_serie_id + '"/>');

    var arrow_icon = $("<span class='ui-icon ui-icon-arrowthick-2-n-s' style='float:left'></span>");

    var div = $("<div style='position:relative'>");

    var fieldset = $('<fieldset class="inputs" style="border:none;">');

    var serie_name_txt = $('<input id="serie_name_' + unique_serie_id + '" type="text" placeholder="serie name"">');
    var serie_name_txtar = $('<textarea id="serie_sql_' + unique_serie_id + '" placeholder="SELECT x,y FROM tab1 JOIN tab2 ON col ORDER BY x ASC LIMIT 100;" ></textarea>');

    var set_nav_icon = $('<a href="#" style="float:right" id="serie_set_nav_' + unique_serie_id + '"><img src="./images/setnav.png" class="setnav" title="set as navigation" style="opacity: 0.5"></a>');

    set_nav_icon.click(function(e) {
        var parent_uid = $('#' + e.currentTarget.id).closest('li[uid]').attr('uid');
        current_nav_serie = $('#serie_name_' + parent_uid).val();
        console.log('Nav changed to:' + current_nav_serie);

        if (chart_data) {
            update_nav();
            nav_zoomout();
        }

        $(".setnav").css("opacity", "0.35");
        $(this).closest_descendent('img').css("opacity", "1");
        e.stopPropagation();
    });

    var remove_icon = $('<a style="float:right" id="remove_serie_' + unique_serie_id + '" sid="serie_sql_' + unique_serie_id + '" href="#" title="remove this serie"><img src="./images/remove.png"></a>');

    remove_icon.click(function(e) {

        console.log("removing ", $(e.currentTarget).attr('sid'));
        delete codemirror_editors[$(e.currentTarget).attr('sid')];

        $(e.target).closest("li").remove();
        e.stopPropagation();
    });

    var icons = $('<div class="drop-icons" style=" position:absolute; width:75px; height:100%; top:0;right:0 " />');
    icons.append(remove_icon);
    icons.append(set_nav_icon);

    fieldset.append(serie_name_txt);
    fieldset.append("<br/>");
    fieldset.append(serie_name_txtar);

    div.append(colorpicker);

    div.append(arrow_icon);
    div.append(icons);
    div.append(fieldset);

    var $li = $('<li id="serie_holder_' + unique_serie_id + '" uid="' + unique_serie_id + '" class="ui-state-default" />').append(div);
    $("#sortable").append($li);
    $("#sortable").sortable('refresh');

    if (name != undefined && sql != undefined) {
        $('#serie_name_' + unique_serie_id).val(name);
        $('#serie_sql_' + unique_serie_id).val(sql);

        if (setnav != undefined && ! $.isEmptyObject(setnav)) {
            $('#serie_set_nav_' + unique_serie_id).trigger('click');
        }
    }

    add_new_codemirror_sql_editor('serie_sql_' + unique_serie_id, name);
    add_color_palette(unique_serie_id, color);

    unique_serie_id++;

    $('#enable_sortable').trigger('change');
    // hides updown-arrow if needed

}

function add_new_codemirror_sql_editor(from_textfield_id, name) {
    var editor = CodeMirror.fromTextArea(document.getElementById(from_textfield_id), {
        mode : 'text/x-mysql',
        indentWithTabs : true,
        smartIndent : true,
        lineNumbers : true,
        matchBrackets : true,
        lineWrapping : true,
        viewpointMargin : 0,
        theme : 'xq-light',
        vivi : {
            name : name,
            color : null
        }
    });

    editor.refresh();

    codemirror_editors[from_textfield_id] = editor;
}

function add_color_palette(unique_serie_id, defaultcolor) {
    if (defaultcolor == undefined) {
        defaultcolor = null;
    }
    $("#color_serie_" + unique_serie_id).spectrum({
        color : null,
        showInput : true,
        className : "full-spectrum",
        showInitial : true,
        showPalette : true,
        allowEmpty : true,
        showSelectionPalette : true,
        maxPaletteSize : 10,
        preferredFormat : "hex",
        showButtons : false,
        //localStorageKey : "spectrum.demo",
        move : function(color) {

        },
        show : function() {

        },
        beforeShow : function() {

        },
        hide : function() {

        },
        change : function() {

        },
        palette : [["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)"], ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)", "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)", "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)", "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)", "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]]
    });

    $("#color_serie_" + unique_serie_id).spectrum("set", defaultcolor);
}
