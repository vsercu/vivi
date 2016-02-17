function check_for_cookies() {
    var csql = readCookie('sqls');
    var cdbinfo = readCookie('dbinfo');

    if (cdbinfo != null){
        cdbinfo = JSON.parse(cdbinfo);
        $("#username").val(cdbinfo['username']);
        $("#password").val(cdbinfo['password']);
        $("#dbhost").val(cdbinfo['dbhost']);
        $("#dbname").val(cdbinfo['dbname']);
    }

    if (csql != null){
        sqls = JSON.parse(csql);
    }
}

function create_cookies() {
    createCookie('sqls', JSON.stringify(sqls), 1);
    createCookie('dbinfo', JSON.stringify(get_db_info_hash()), 1);
}

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else
        var expires = "";
    document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = escape(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
        c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
            return unescape(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookies() {
    eraseCookie('sqls');
    eraseCookie('dbinfo');
}

function eraseCookie(name) {
    createCookie(name, null, -1);
}

