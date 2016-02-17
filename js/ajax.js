var chart_data;

var LIVE_DATA_SERVER = window.location.origin + window.location.pathname.replace("index.html", "") + 'live-server-data.php';

function get_db_info_hash() {
    return {
        username : $('#username').val(),
        password : $('#password').val(),
        dbhost : $('#dbhost').val(),
        dbname : $('#dbname').val(),
        dbtype : ($('#dbtype_mysql').is(":checked") ? 'MYSQL' : 'POSTGRES')
    };
}

var xhr;
var pro_sec_int;
function fetch_results(sequel, callback) {

    if (sequel == null || sequel == undefined || $.isEmptyObject(sequel)) {
        chart.showLoading('Type some SQL or load an XML-file!');
        return;
    }

    sequel = replace_params(sequel);
    if (sequel == null) {
        chart.showLoading("Some SQL-parameters have no value...");
        $('#bt_params').addClass("breathing_button");
        return;
    }
    //console.log("Fetching replaced sqls: ", sequel);

    var data = {
        sqls : JSON.stringify(sequel), //sequel
        dbinfo : JSON.stringify(get_db_info_hash())
    };

    var start_time;
    show_loading_msg();
    clearInterval(wait_fetch);

    xhr = $.ajax({
        type : "POST",
        async : true,
        dataType : "jsonp",
        //timeout : 10*1000,
        // we let jquery handle this, and redirect the callback in the 'success'
        // method. jsonpCallback : 'fetch_results_processing',
        url : LIVE_DATA_SERVER,
        data : data,

        beforeSend : function() {
            start_time = new Date().getTime();
        },

        success : function(obj) {
            $('#processing').hide('fast');

            var msg = obj;
            var err = '';

            //console.log("results for sql: " + JSON.stringify(sequel));
            //console.log('datamsg:', msg['data']);

            if (msg['msg'] != '') {
                // an error occurred...
                chart.hideLoading();
                chart.showLoading(msg['msg']);

                // when it went wrong, disable any timer that might restart
                clearInterval(liveTimer);
                liveTimer = null;
                $('#bt_live_data').removeClass('action_clicked');
                $('#live_button_image').attr('src', 'images/download.png');

                return;
            }

            if (callback != null) {
                if (msg['data'] == '' || msg['data'] == '[]' || $.isEmptyObject(msg['data'])) {
                    chart.hideLoading();
                    chart.showLoading('-- No data returned! --');
                    console.log(' no data returned ');
                    //return;
                }
            } else {
                if (msg['data'] == '' || msg['data'] == '[]' || $.isEmptyObject(msg['data'])) {
                    chart.hideLoading();
                    chart.showLoading('-- Prepare SQL executed --');
                }
            }

            if (msg['data'] != '' && msg['msg'] == '' && callback != null) {
                // all OK, has data and no errormsg
                //chart.showLoading('Query OK.');
                chart.hideLoading();
                chart_data = msg['data'];
                console.log('calling callback with data:', msg['data']);
                callback(msg['data']);
            }

            if (liveTimer) {
                var request_time = new Date().getTime() - start_time;
                // restart
                if (request_time >= liveTimer) {
                    // immediately restart
                    fetch_results(sqls, update_series);
                } else {
                    // wait a bit to execute...
                    wait_fetch = setTimeout(function() {
                        fetch_results(sqls, update_series);
                    }, (liveTimer - request_time));
                }
            }
        },
        error : function(jqXHR, textStatus, errorThrown) {
            //console.error(jqXHR);
            if (textStatus == 'abort') {
                return;
            }
            console.error('[fetch_results]:', textStatus);
            console.error('[fetch_results]:', errorThrown);
            chart.showLoading('An error occurred, see Javascript Console for more details.');
            $('#processing').hide();
        }
    }).fail(function(data, status) {
        //console.error(data);
        //console.error(status);
        $('#processing').hide();
    });

}

function fetch_xml(location) {
    $.ajax({
        type : "GET",
        url : location,
        success : function(text) {
            load_sql_from_xml(text);
        },
        error : function(jqXHR, textStatus, errorThrown) {
            write_error("Unable to fetch file at url: '" + location + "'<br/>" + textStatus);
            console.error('[fetch_xml]:', textStatus);
            console.error('[fetch_xml]:', errorThrown);
        }
    });
}
