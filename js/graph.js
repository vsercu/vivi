var chart;

var current_nav_serie = null;
var hide_nav_serie = false;

var min_handle = null;
var max_handle = null;

var serie_colors = {};

const CHART_COLUMN_STYLE = {
    'stacklabels_enable' : false, // true or false
    'column_stacking' : null, // normal or null are tested

    'charttype' : 'column', // column or spline are tested

    'navigator_enabled' : false,

    'x_axis_label_format' : "{value}", //
};
const CHART_SPLINE_STYLE = {
    'stacklabels_enable' : false, // true or false
    'column_stacking' : null, // normal or null are tested

    'charttype' : 'line', // column or spline are tested

    'navigator_enabled' : true,

    'x_axis_label_format' : "{value}", //
};
const CHART_AREASPLINE_STYLE = {
    'stacklabels_enable' : false, // true or false
    'column_stacking' : null, // normal or null are tested
    'charttype' : 'areaspline',
    'navigator_enabled' : true,
    'x_axis_label_format' : "{value}", //
};

CHART_OPTS = CHART_SPLINE_STYLE;

function create_chart() {
    // create the chart
    chart = new Highcharts.StockChart({
        chart : {
            type : CHART_OPTS['charttype'],

            zoomType : 'xy',
            panning: true,
            panKey: 'ctrl',

            renderTo : 'container',
            animation : {
                duration : 200,
                easing : 'swing'
            },
            backgroundColor : 'rgba(255, 255, 255, 0.1)',
            resetZoomButton : {
                theme : {
                    display : 'none' // we have our own
                }
            },
            events : {
                click : function(event) {
                    close_menu();
                    // when clicking on the chart, we close any open menus
                }
            }
        },

        // style of the showLoading text
        loading : {
            labelStyle : {
                top : '45%',
                color : 'red'
            },
            style : {
                opacity : 0.9
            }
        },

        // bar below graph to do fancy zooms
        navigator : {
            adaptToUpdatedData : true,

            enabled : CHART_OPTS['navigator_enabled'],

            series : {
                id : 'navigator',

                type : 'areaspline',
                color : '#4572A7',
                fillOpacity : 0.4,
                dataGrouping : {
                    //  smoothed : true
                },
                lineWidth : 1,
                marker : {
                    enabled : false
                },
                shadow : false

            },

            xAxis : {

                ordinal : $('#nonlinearX').is(":checked"),

                labels : {
                    formatter : function() {
                        //return '';
                        return this.value;
                    }
                }
            }

        },

        tooltip : {
            formatter : function() {
                s = [];
                $.each(this.points, function(i, point) {
                    s.push('<span style="display:block; color:' + point.series.color + ';font-weight:bold;">' + point.series.name + ':  ' + point.x + " | " + point.y + '<span><br/>');
                });

                return s.join("<br/><span style='display: inline-block; line-height: 2px; height: 2px;'>------------</span><br/>");
            },
            followPointer : true,
        },

        plotOptions : {
            series : {
                cursor : 'crosshair',
                //connectNulls : $('#connectNulls').is(":checked"),
                // //CHART_OPTS['charttype'] == "spline" ? true : false,
                // // disable the null-correction when using any view other than
                //cropThreshold : 999999999,
                turboThreshold : 99999,
                connectNulls : CHART_OPTS['charttype'] == "spline" ? true : false,
                // spline

                marker : {
                    // expensive operation! don't use with many datapoints
                    enabled : false,
                    lineWidth : 1,
                    radius : 2
                },
                states : {
                    hover : {
                        enabled : true,
                        lineWidth : 0.5
                    }
                }
            },
            spline : {
                marker : {
                    radius : 4,
                    lineColor : '#666666',
                    lineWidth : 1
                }
            },

            // new:
            column : {
                stacking : CHART_OPTS['column_stacking'],
                dataLabels : {
                    enabled : true,
                    //color : (Highcharts.theme &&
                    // Highcharts.theme.dataLabelsColor) || 'white',
                    style : {
                        textShadow : '0 0 3px white',

                        fontWeight : 'bold',
                        color : 'gray'

                    }
                }
            }
        },

        rangeSelector : {// only works with dates?
            enabled : false
        },

        xAxis : {
            ordinal : $('#nonlinearX').is(":checked"),

            labels : {
                format : CHART_OPTS['x_axis_label_format'],
                style : {
                    'font-size' : '12px'
                }
                // ,
                // formatter : function() {
                // return this.value;
                // }

            },

            lineWidth : 3,
            events : {
                setExtremes : function(event) {
                    min_handle = Math.round(event.min);
                    max_handle = Math.round(event.max);

                    //console.log("max handle becomes: ", max_handle);
                    //console.log("this", this);
                    //chart.xAxis[0]

                    //console.log(min_handle + ']:[' + max_handle);

                    if (min_handle == NaN || max_handle == NaN) {
                        // hack: sometimes when zooming those two become NaN
                        // resulting in a broken chart
                        // zooming out again till fully zoomed out seems to fix
                        // it
                        nav_zoomout();
                    }
                }
            }

        },
        yAxis : {
            id : '__y_axis__',
            lineWidth : 3,
            min : $('#min_y_value').val() == "" ? undefined : parseInt($('#min_y_value').val()),
            max : $('#max_y_value').val() == "" ? undefined : parseInt($('#max_y_value').val()),

            allowDecimals: true,
            labels : {
                format : '{value}'
            },
            stackLabels : {
                enabled : CHART_OPTS['stacklabels_enable'],
                style : {
                    fontWeight : 'bold',
                    color : (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }

        },

        legend : {
            enabled : true
        },

        // empty series to start with
        series : [],

        exporting : {
            enabled : true
        },

        credits : {
            enabled : true,
            href : "mailto:vsercu@intec.ugent.be",
            text : "Vinnies Visualiser - Vincent Sercu - IBCN / iMinds / uGent © 2015"
        }
    });

}

const spline_markers = ["circle", "square", "diamond", "triangle", "triangle-down"];

function create_series(data) {
    console.log('**** creating series ****', data);
    // console.log(data);

    var chart = $('#container').highcharts();

    var spline_i = 0;
    for (var seriename in data ) {
        //console.log(data[seriename]);
        if (data[seriename].length == 0) {
            write_error("No data returned for serie ", seriename, " check your SQL.");
        }

        implicit_serie_sort(data[seriename], seriename);
        create_serie(seriename, data[seriename]);
    }

    update_nav();

    setTitle($("#chart_title").val());
    setAxisTitle($("#chart_x_axis").val(), 'x');
    setAxisTitle($("#chart_y_axis").val(), 'y');
}

function create_serie(seriename, serie_data) {
    console.log("color of serie ", seriename, ":", serie_colors[seriename]);

    chart.addSeries({
        id : seriename,
        name : seriename,
        data : serie_data,
        color : serie_colors[seriename],
        marker : {
            symbol : spline_markers[(chart.series.length % spline_markers.length)]
        },
        /* dataLabels : { enabled : true }  is a very expensive operation! */
        enableMouseTracking : true,
        gapSize : 6,

    });
}

function clear_series() {
    // breaks stuff in background... don't use!
    while (chart.series.length > 0) {
        if (chart.series[0].name == "Navigator") {
            if (chart.series.length > 1) {
                console.log('removing serie: ' + chart.series[1].name);
                chart.series[1].remove(true);
            } else {
                // only the nav remains
                break;
            }
        } else {
            console.log('removing serie: ' + chart.series[0].name);
            chart.series[0].remove(true);
        }
    }

}

function update_series(data) {
    console.log('---- updating chart ------');

    //console.log('updating nav (' + current_nav_serie + ')');
    //console.log(data);

    for (var sn in data ) {
        var serie = chart.get(sn);

        implicit_serie_sort(data[sn], sn);

        if (serie == null || serie == undefined) {
            console.warn("Undefined serie: " + sn + " cannot update... Creating implicitly.");
            create_serie(sn, data[sn]);
        } else {
            serie.setData(data[sn], false);
        }

        console.log('just set serie for ', sn);
    }

    update_nav();
    chart.redraw();
}

function implicit_serie_sort(two_dim_arrays, seriename) {
    if (two_dim_arrays.length >= 2) {
        if (two_dim_arrays[0] <= two_dim_arrays[1]) {
            // ok, sorted ASC
        } else {
            // hmm, sorted desc?
            //console.log("Implicitly sorting ASC data to DESC in ", seriename ,
            // two_dim_arrays);
            two_dim_arrays.sort(function(a, b) {
                return a[0] - b[0];
            });
            return two_dim_arrays;
        }
    }

}

function load_series(also_fetch_results, animate) {
    sqls = {};

    for (var ce in codemirror_editors) {
        codemirror_editors[ce].save();
        // save them back to the txtbox
    }

    // add the prepare sql
    sqls['PREPARE_SQL'] = codemirror_editors['prepare_sql'].getValue();

    // add the user-sqls
    var sarr = $('#sortable').sortable('toArray');

    for (var sn in sarr) {
        var uid = $('#' + sarr[sn]).attr('uid');
        var serie_name = $('#serie_name_' + uid).val();
        var serie_sql = $('#serie_sql_' + uid).val();
        sqls[serie_name] = serie_sql;

        serie_colors[serie_name] = $('#color_serie_' + uid).spectrum("get");
        if (serie_colors[serie_name] != null) {
            serie_colors[serie_name] = serie_colors[serie_name].toHexString();
            codemirror_editors['serie_sql_' + uid].options.vivi.color = serie_colors[serie_name];
        }

        codemirror_editors['serie_sql_' + uid].options.vivi.name = serie_name;
    }
    var num_params = scan_for_sql_params(sqls, 'replace', animate);

    // load chart options into global var:
    create_chart();

    if (also_fetch_results != undefined && also_fetch_results == false) {
        if (num_params == 0) {
            chart.showLoading("SQL loaded successfully, click the 'Create Graph' button!");
        } else {
            chart.showLoading("SQL loaded successfully, fill the parameters and click the 'Create Graph' button!");
        }
    } else {
        chart.showLoading('Fetching data and creating series...');
        fetch_results(sqls, create_series);
    }
}

function update_nav() {
    if (hide_nav_serie) {
        chart.get(current_nav_serie).hide();
    }

    if (chart_data[current_nav_serie] == null || chart_data[current_nav_serie] == undefined) {
        //console.error("can't update nav, data is undefined or null for Curr nav
        // serie:", current_nav_serie, " data: ", chart_data);
        //console.log(data);
        return;
    }
    console.log('update_nav: filling nav with serieid: ', current_nav_serie, " : ", chart_data);

    implicit_serie_sort(chart_data[current_nav_serie], current_nav_serie);

    chart.get('navigator').setData(chart_data[current_nav_serie]);

    //nav_focus_keep_window();
}

function nav_zoomout() {
    chart.xAxis[0].setExtremes(chart.xAxis[0].dataMin, chart.xAxis[0].dataMax);

    // force reset of minmax
    chart.xAxis[0].userMin = chart.xAxis[0].dataMin;
    chart.xAxis[0].userMax = chart.xAxis[0].dataMax;
    min_handle = chart.xAxis[0].dataMin;
    max_handle = chart.xAxis[0].dataMax;
}

function nav_livedata_sync() {
    // forces max_handle to datamax so the plot is neatly scrolling
    chart.xAxis[0].userMax = chart.xAxis[0].dataMax;
    max_handle = chart.xAxis[0].dataMax;
}

function nav_focus_keep_window() {
    var min = min_handle;
    var max = max_handle;
    console.log('maintaining focus window: w=' + (max - min) + ' from: ' + min + " ||| " + (max - (max - min)) + ' to: ' + max);

    if (min == NaN || min == undefined || max == NaN || max == undefined) {
        console.error("WINDOW: meh.. min or max is undefined..." + min + " " + max);
        //nav_zoomout();
    }

    chart.xAxis[0].setExtremes(Math.floor(max - (max - min)), Math.ceil(max));
}

function toggle_datapoints(enableMarkers) {
    for (var i in chart.series) {
        if (chart.series[i].name != 'Navigator') {
            var opt = chart.series[i].options;
            opt.marker.enabled = enableMarkers;
            chart.series[i].update(opt);
        }
    }
}

function toggle_mousetracking(enableMouseTracking) {
    for (var i in chart.series) {
        if (chart.series[i].name != 'Navigator') {
            var opt = chart.series[i].options;
            opt.enableMouseTracking = enableMouseTracking;
            chart.series[i].update(opt);
        }
    }
}

function create_plotbands(data) {
    console.log("plotbands:");
    console.log(data);
}

function addPlotBand(id, from, to, color) {
    chart.yAxis[0].addPlotBand({
        from : from,
        to : to,
        color : color,
        id : id
    });
}

function setTitle(title) {
    chart.setTitle({
        text : title
    });
}

function setAxisTitle(title, x_or_y) {
    if (x_or_y == 'x') {
        chart.xAxis[0].setTitle({
            text : title,
            fontSize : "12pt"
        });
    } else if (x_or_y == 'y') {
        chart.yAxis[0].setTitle({
            text : title,
            fontSize : "12pt"
        });
    }
}

function removePlotBand(id) {
    chart.xAxis[0].removePlotBand(id);
}

