$(function() {
    create_chart();

});

$(window).load(function() {

});

$(document).ready(function() {
    bind_buttons();

    document.getElementById('files').addEventListener('change', handleFileSelect, false);

    // load demo values:
    var xmlfile = $.url().param('xmlfile');
    if (xmlfile != undefined && xmlfile != 'undefined') {
        // gets the file contents and parses values
        fetch_xml(xmlfile);
    } else {
        fill_example_queries();
    }

    $('#help_querystring_example').html("You can also put the path in the querystring, like: <a style='display:inline; font-size:12px; padding: 0px;' href='" + window.location.origin + window.location.pathname.replace("index.html","") + "index.html?xmlfile=" + window.location.origin +  "/vivi/ex1.xml'>this</a>");

    setTimeout(function(){
        $('#bt_load_series').trigger('click');
    }, 100);


});

var editor;

function fill_example_queries() {
    // wishful example
    $('#dbhost').val("localhost");
    $('#username').val("oml");
    $('#password').val("oml");
    $('#dbname').val("example_throughput");
    $('#dbtype_postgres').trigger('click');

    codemirror_editors['prepare_sql'].setValue("");
    codemirror_editors['prepare_sql'].refresh();
    codemirror_editors['prepare_sql'].save();

    $('#add_serie').trigger('click');
    $('#serie_name_' + (unique_serie_id - 1)).val("iperftransfer");
    codemirror_editors['serie_sql_' + (unique_serie_id - 1)].setValue("select oml_ts_server, (size*8)/(1024.0*1024.0) from iperf_transfer");
     $("#color_serie_" + (unique_serie_id - 1)).spectrum("set", 'red');

    $("#chart_title").val("<b>Throughput example</b>");
    $("#chart_y_axis").val("megabit / sec");
    $("#chart_x_axis").val("time");

    // robotcontrol
    /*
    $('#add_serie').trigger('click');
    $('#serie_name_' + (unique_serie_id - 1)).val("rssi value from the AP at robot");
    codemirror_editors['serie_sql_' + (unique_serie_id - 1)].setValue("select xas*-10,     rssiapatrobot    \nfrom temporarydb.vivi_ex limit 5  ");
     $("#color_serie_" + (unique_serie_id - 1)).spectrum("set", 'red');

    // add a second part of the bar:
    $('#add_serie').trigger('click');
    $('#serie_name_' + (unique_serie_id - 1)).val("robottime");
    codemirror_editors['serie_sql_' + (unique_serie_id - 1)].setValue("select xas*-10,     rtime/100    \nfrom temporarydb.vivi_ex   limit 5 ");


  $('#add_serie').trigger('click');
    $('#serie_name_' + (unique_serie_id - 1)).val("fives");
    codemirror_editors['serie_sql_' + (unique_serie_id - 1)].setValue("select xas*-10,     5   \nfrom temporarydb.vivi_ex  limit 5 ");
$("#color_serie_" + (unique_serie_id - 1)).spectrum("set", 'blue');

    /*
    $('#add_serie').trigger('click');
    $('#serie_name_' + (unique_serie_id - 1)).val("rssi value from the AP at robot");
    codemirror_editors['serie_sql_' + (unique_serie_id - 1)].setValue("select xas,     rssiapatrobot    \nfrom temporarydb.vivi_ex   ");

    $('#add_serie').trigger('click');
    $('#serie_name_' + (unique_serie_id - 1)).val("robottime");
    codemirror_editors['serie_sql_' + (unique_serie_id - 1)].setValue("select xas,     rtime    \nfrom temporarydb.vivi_ex    ");

    $('#add_serie').trigger('click');
    $('#serie_name_' + (unique_serie_id - 1)).val("sensor0");
    codemirror_editors['serie_sql_' + (unique_serie_id - 1)].setValue("select xas,     sensor0    \nfrom temporarydb.vivi_ex   ");

    $('#serie_set_nav_' + (unique_serie_id - 1)).trigger('click');

    $('#add_serie').trigger('click');
    $('#serie_name_' + (unique_serie_id - 1)).val("sensor1");
    codemirror_editors['serie_sql_' + (unique_serie_id - 1)].setValue("select xas,     sensor1    \nfrom temporarydb.vivi_ex   ");

    $('#add_serie').trigger('click');
    $('#serie_name_' + (unique_serie_id - 1)).val("sensor2");
    codemirror_editors['serie_sql_' + (uniquserie_id - 1)].setValue("select xas,     sensor2    \nfrom temporarydb.vivi_ex  ");

    $('#add_serie').trigger('click');
    $('#serie_name_' + (unique_serie_id - 1)).val("sensor3");
    codemirror_editors['serie_sql_' + (unique_serie_id - 1)].setValue("select xas,     sensor3    \nfrom temporarydb.vivi_ex    ");

    codemirror_editors['prepare_sql'].setValue("-- this is the fastest way to do fetch data: \nDROP TABLE IF EXISTS temporarydb.vivi_ex;\n-- and re-create every time: \nCREATE TEMPORARY TABLE IF NOT EXISTS temporarydb.vivi_ex AS select *, (rtime - ( unix_timestamp(now()) * 10 ) % 65536) as xas from robotcontrol.robot_updates where  robotid = 1 and insert_time > (now() - INTERVAL 10 second) ORDER BY xas asc;");
*/
}
