var xml_doc;

var reader = new FileReader();

reader.onload = function(e) {
    var text = reader.result;
    //console.log(text);
    load_sql_from_xml(text);
};

$.createElement = function(name) {
    return $('<' + name + ' />');
};

// JQ plugin appends a new element created from 'name' to each matched element.
$.fn.appendNewElement = function(name) {
    this.each(function(i) {
        $(this).append('<' + name + ' />');
    });
    return this;
};

function handleFileSelect(evt) {
    var f = evt.target.files[0];

    console.log("read file: ", f);

    var out = '<li><strong>' + f.fileName + '</strong> (' + (f.type || 'n/a') + ') - ' + f.size + ' bytes, last modified: ' + (f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a') + '</li>';

    if (!f.type.match('text/xml')) {
        write_error('cant read type: ', f.type);
    }

    reader.readAsText(f);

    document.getElementById('list').innerHTML = '<ul>' + out + '</ul>';
}

function clearFileInput() {
    var oldInput = document.getElementById("files");

    var newInput = document.createElement("input");

    newInput.type = "file";
    newInput.id = oldInput.id;
    newInput.name = oldInput.name;
    newInput.className = oldInput.className;
    newInput.style.cssText = oldInput.style.cssText;
    // copy any other relevant attributes

    oldInput.parentNode.replaceChild(newInput, oldInput);
}

function replace_params(sqls) {
    if ( typeof sqls == 'object') {
        // a hash, ok
    } else {
        var sq = sqls;
        sqls = {};
        sqls['prepared_statement'] = sq;
    }

    //console.log("sqls to replace into hash: ", sqls);

    for (var sn in sqls) {
        //console.log("Replacing params, check if key: ", sn, " contains
        // parameters?");

        var re = /([_]{3}\w+[_]{3})/ig;
        var match = re.exec(sqls[sn]);

        if (match != null) {
            //console.log("\tReplacing params, found match::", match[0]);
            // get value from paramfield
            var value = $('#paramField' + match[0]).val();
            // if its empty, ask to user
            if (value == "" || value == undefined) {
                //var paramval = window.prompt("Value to replace parameter '" +
                // match[0] + "'?");
                //if (paramval == null) {// if user says nothing, pass the name
                // (will get an error but not our problem anymore).
                //   value = match[0];
                //  $('#paramField' + match[0]).val(value);
                //}
                return null;
            }
            //console.log("\tReplacing parameter ", match[0], ' with ', value);
            sqls[sn] = replaceAll(match[0], value, sqls[sn]);
        } else {
            //console.log("\tFound no parameters in ", sqls[sn]);
        }
    }

    //console.log("returning replaced sqls: ", sqls);
    return sqls;
}

// scans 'text'-parameters for special sql-variables
// pre & suffix have 3x underscore and the name is in between
// finds them and creates a field in param-menu
// (optionally replaces existing fields and animates the button)
function scan_for_sql_params(sqlhash, clear_existing, animate_button) {
    var found = 0;
    var old_data = {};
    if (clear_existing != undefined) {
        if (clear_existing == 1 || clear_existing == 'empty') {
            $("#sqlparams").empty();
        }
        if (clear_existing == 'replace') {
            // save in old_data first
            $.each($('[id^=paramField]'), function() {
                old_data[$(this).attr('id')] = $(this).val();
            });

            $("#sqlparams").empty();
        }
        //console.log("[scan] Emptied sqlparams, scanning for new ones (backup:",
        // old_data, ")");
    }

    for (var serie_name in sqlhash) {
        var re = /(___\w+___)/g;
        var match = re.exec(sqlhash[serie_name]);

        while (match != null) {
            // add a field to the param menu AND    vvv -> re-fill field from
            // old_data, gets undefined if nothing matched
            create_paramfield(match[0], old_data['paramField' + match[0]]);

            match = re.exec(sqlhash[serie_name]);
            found++;
        }
    }

    if (animate_button != undefined && (animate_button == 1 || animate_button == 'animate') && found) {
        $('#bt_params').removeClass("bt btmiddle");
        $('#bt_params').addClass("breathing_button bt btmiddle");
    }
    return found;
}

// load from legacy wilab1-analyser format
function load_sql_from_xml(xml) {
    $("#sortable").empty();
    sqls = {};

    try {
        if (window.DOMParser) {
            // use dom parser instead of jQuery XML parser: $.parseXML(xml);
            xml_doc = new DOMParser().parseFromString(xml, 'text/xml');
        } else {
            throw new Error('No XML parser available');
        }

    } catch(err) {
        write_error("XML loading error: " + err);
        return;
    }
    console.log('loading xml file:', xml);
    console.log('into:', xml_doc);

    var xml_noparam = xml;

    $(xml_noparam).find("dbconnection").each(function() {
        $('#dbhost').val($(this).children('host').text());
        $('#username').val($(this).children('user').text());
        $('#password').val($(this).children('password').text());
        $('#dbname').val($(this).children('database').text());
        var dbtype = $(this).children('dbtype').text();

        if (dbtype.toUpperCase() == 'POSTGRES') {
            $('#dbtype_postgres').trigger('click');
            console.log('selecting postgres');
        }
    });

    $(xml_noparam).find("prepareview").each(function() {
        // do some extra stuff...
        codemirror_editors['prepare_sql'].setValue($(this).text());
        codemirror_editors['prepare_sql'].refresh();
        codemirror_editors['prepare_sql'].save();
        fetch_results($(this).text(), null);
    });

    $(xml_noparam).find("sandbox").each(function() {
        codemirror_editors['sandbox_sql'].setValue($(this).text());
        codemirror_editors['sandbox_sql'].refresh();
        codemirror_editors['sandbox_sql'].save();
    });

    $(xml_noparam).find("scatter").each(function() {
        add_serie($(this).children('name').text(), $(this).children('sql').text(), $(this).children('setnav').text(), $(this).children('color').text().replace("0x", ""));

    });

    $(xml_noparam).find("graphics").each(function() {
        $("#chart_title").val($(this).children('info').text());
        $("#chart_x_axis").val($(this).children('xaxis').text());
        $("#chart_y_axis").val($(this).children('yaxis').text());

        $("#min_y_value").val($(this).children('ymin').text());
        $("#mix_y_value").val($(this).children('ymax').text());
    });

    load_series(false, 'animate');

}

// save to legacy wilab1-analyser format
// WARNING: jquery implicitly converts all elements to lower case!!!
function save_sql_to_xml() {
    var root = $('<XMLDocument />');
    var wilabtanalyser = $.createElement('wilabt_analyser');
    // create the main branches

    // store db info
    var dbconnection = $.createElement('dbconnection');
    dbconnection.append($('<host />').text($('#dbhost').val()));
    dbconnection.append($('<user />').text($('#username').val()));
    dbconnection.append($('<password />').text($('#password').val()));
    dbconnection.append($('<database />').text($('#dbname').val()));
    dbconnection.append($('<dbtype />').text($('#dbtype_postgres').is(':checked') ? 'POSTGRES' : 'MYSQL'));
    wilabtanalyser.append(dbconnection);

    // store prep view
    var general = $.createElement('general');
    codemirror_editors['prepare_sql'].save();
    general.append($('<prepareview />').text(codemirror_editors['prepare_sql'].getValue()));
    codemirror_editors['sandbox_sql'].save();
    general.append($('<sandbox />').text(codemirror_editors['sandbox_sql'].getValue()));
    wilabtanalyser.append(general);


    // store graphics
    var graphics = $.createElement('graphics');
    console.log("info save", chart.options.title.text, chart.options.xAxis[0].title.text, chart.options.yAxis[0].title.text);
    graphics.append($('<info />').text($("#chart_title").val()));
    graphics.append($('<xaxis />').text($("#chart_x_axis").val()));
    graphics.append($('<yaxis />').text($("#chart_y_axis").val()));

    graphics.append($('<ymin />').text($("#min_y_value").val()));
    graphics.append($('<ymax />').text($("#max_y_value").val()));

    wilabtanalyser.append(graphics);

    // store scatters
    var scatters = $.createElement('scatters');

    for (var k in codemirror_editors) {
        if (String(k).substring(0, 5) == 'serie') {
            // save all serie_ sql's
            var sct = $.createElement('scatter');
            sct.append($('<name />').text(codemirror_editors[k].options.vivi.name));
            sct.append($('<sql />').text(codemirror_editors[k].getValue()));

            if (serie_colors[codemirror_editors[k].options.vivi.name] != null) {
                sct.append($('<color />').text(serie_colors[codemirror_editors[k].options.vivi.name]));
            }

            if (codemirror_editors[k].options.vivi.name == current_nav_serie) {
                sct.append($('<setnav />').text(current_nav_serie));
            }
            scatters.append(sct);

        }
    }
    wilabtanalyser.append(scatters);

    root.append(wilabtanalyser);

    return $.format(root.html(), {
        method : 'xml'
    });
}

// aux functions:
function replaceAll(find, replace, str) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

// http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex/6969486#6969486
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

