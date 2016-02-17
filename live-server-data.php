<?php
/* author: vsercu@intec.ugent.be
 *
 *****
 * This page serves as an adapter between the VIVI JS frontend and a MySQL or PostGres DB.
 * It executes queries as the user passed in parameter, without any checking, just as if you were working on the DB locally.
 * And returns the data in JSON format.

     apt-get install php5-pgsql
	+ apache restart (duh)
 *
 * if things go ERR 500 internal server error, check /var/log/apache2/error.log
*/

// get the parameters
error_reporting(E_ERROR);
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');


function exception_error_handler($errno, $errstr, $errfile, $errline ) {
    throw new ErrorException($errstr, $errno, 0, $errfile, $errline);
}

try {
    if (!isset($_GET['callback'])) {
    	//throw new Exception("Callback is not set.");
    }
    $callback = $_GET['callback'];
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $callback)) {
        //throw new Exception("Invalid callback name: '" . $callback . "'");
    }
    if (! isset($_POST['dbinfo'])){
        throw new Exception("No database information given.");
    }
    $dbinfo =  json_decode($_POST['dbinfo'], true);

    $DBTYPE = 'POSTGRES';
    if (array_key_exists('dbtype', $dbinfo)){
        $DBTYPE = $dbinfo['dbtype'];
    }

    if (! array_key_exists('username', $dbinfo)){
        throw new Exception("No username in 'dbinfo'-parameter.");
    }
    if (! array_key_exists('password', $dbinfo)){
        throw new Exception("No password in 'dbinfo'-parameter.");
    }
    if (! array_key_exists('dbhost', $dbinfo)){
        throw new Exception("No database hostname in 'dbinfo'-parameter.");
    }
    if (! array_key_exists('dbname', $dbinfo)){
        throw new Exception("No database name in 'dbinfo'-parameter.");
    }

    // connect to DB
    $sqls = json_decode($_POST['sqls'], true);
    $usr = $dbinfo['username'];
    $pass = $dbinfo['password'];
    $dbip = $dbinfo['dbhost'];
    $dbname = $dbinfo['dbname'];

    $response = "";

    // +++++++++++++++++++++++++++++++++++++++++ MYSQL HANDLER ++++++++++++++++++++++++++++++++++++++++++++++++++
    if (strtoupper($DBTYPE) == 'MYSQL'){
        // DB connectings
        //Set mysql connection timeout to a few seconds.
        ini_set('mysql.connect_timeout', 3);
        $con = mysql_connect($dbip, $usr, $pass);
        if (!$con) {
            throw new Exception('Could not connect to MySQL database: <br/>' . mysql_error());
        }
        mysql_select_db($dbname, $con);

        if (mysql_error()){
            throw new Exception('When selecting MySQL database: <br/>' . mysql_error());
        }

        $response = array();
        foreach ($sqls as $name => $sql) {
           // for every sequel in the hash
	        $sql = trim($sql);

	        if (! preg_match("/.*LIMIT\s+\d+\s*;?$/i", $sql)){
	            //throw new Exception("No trailing LIMIT-clause found for serie '$name'...<br/>SQL: '$sql'<br/>Example: add 'LIMIT 1000' at the end...");
	        }

            $sql = preg_replace('/\s*?--\s*?.*/', '', $sql); // remove comments
	        //$sql = str_replace(array("\n", "\t"), ' ', $sql);  // remove newlines en tabs
            $queries = split_sql($sql);
            $nested = 0;

            foreach ($queries as $query){
                if (strlen(trim($query)) > 0){
                    $escaped_query = $query; //mysql_real_escape_string ( $query, $con );
                    $result = mysql_query($escaped_query);

                    $nested_suffix = ($nested == 0 ? "" : "_" . $nested);

                    if (mysql_error()){
                        throw new Exception("When executing (MySQL) SQL for serie '" . $name . $nested_suffix . "':<br/><span class='erroneous-sql'>$escaped_query</span> caused an SQL-error: <br/>" . mysql_error());
                    }

                    $resultset = array();
                    while ($row = mysql_fetch_row($result)) {
                        array_push($resultset, array(
                            $row[0],
                            $row[1]
                        ));
                    }

                    if (count($resultset) != 0){
                        $response[$name . $nested_suffix] = $resultset;
                    }
                }
            }
        }//foreach sqls
        mysql_close($con);

    // +++++++++++++++++++++++++++++++++++++++++ PG HANDLER ++++++++++++++++++++++++++++++++++++++++++++++++++
    } else if (strtoupper($DBTYPE) == 'POSTGRES'){
		set_error_handler("exception_error_handler");

        $con = pg_connect("host=$dbip dbname=$dbname user=$usr password=$pass connect_timeout=3");
        if (pg_last_error()){
            throw new Exception('When trying to connect to POSTGRES database: <br/>' . pg_last_error());
        }

        $response = array();
        foreach ($sqls as $name => $sql) {
           // for every sequel in the hash
	        $sql = trim($sql);

	        if (! preg_match("/.*LIMIT\s+\d+\s*;?$/i", $sql)){
	            //throw new Exception("No trailing LIMIT-clause found for serie '$name'...<br/>SQL: '$sql'<br/>Example: add 'LIMIT 1000' at the end...");
	        }

            $sql = preg_replace('/\s*?--\s*?.*/', '', $sql); // remove comments
	        $sql = str_replace(array("\n", "\t"), '', $sql); // remove newlines en tabs
            $queries = split_sql($sql);
            $nested = 0;

            foreach ($queries as $query){
                if (strlen(trim($query)) > 0){
                    $escaped_query = $query; //pg_escape_string($con, $query);
                    $result = pg_query($con, $query);

                    $nested_suffix = ($nested == 0 ? "" : "_" . $nested);

                    if (pg_last_error()){
                        throw new Exception('When executing POSTGRES query: <br/>' . pg_last_error() . '<br/><br/>Make sure you doublequote your tablename, and check case sensitivity.');
                    }

                    $resultset = array();
                    while ($row = pg_fetch_row($result)) {
                        array_push($resultset, array(
                            $row[0],
                            $row[1]
                        ));
                    }

                    if (count($resultset) != 0){
                        $response[$name . $nested_suffix] = $resultset;
                    }
                }
            }
        }// end foreach

        pg_close($con);
    } else {
        throw new Exception("No database type $DBTYPE unkown. Use MYSQL or POSTGRES.");
    }

    echo $callback . "(" . json_encode(array(
        'data' => $response,
        'msg' => ''
    ), JSON_NUMERIC_CHECK) . ");";
} catch (Exception $e) {
	$arr = array('data' => "", 'msg' => $e->getMessage());
    echo $callback . "(" . json_encode( $arr ) . ")";
}


function split_sql($sql_text) {
    // Return array of ; terminated SQL statements in $sql_text.
    $re = '% # Match an SQL record ending with ";"
    \s*                                     # Discard leading whitespace.
    (                                       # $1: Trimmed non-empty SQL record.
      (?:                                   # Group for content alternatives.
        \'[^\'\\\\]*(?:\\\\.[^\'\\\\]*)*\'  # Either a single quoted string,
      | "[^"\\\\]*(?:\\\\.[^"\\\\]*)*"      # or a double quoted string,
      | /*[^*]*\*+([^*/][^*]*\*+)*/         # or a multi-line comment,
      | \#.*                                # or a # single line comment,
      | --.*                                # or a -- single line comment,
      | [^"\';#]                            # or one non-["\';#-]
      )+                                    # One or more content alternatives
      (?:;|$)                               # Record end is a ; or string end.
    )                                       # End $1: Trimmed SQL record.
    %x';
    $matches = array();
    if (preg_match_all($re, $sql_text, $matches)) {
        return $matches[1];
    }
    return array();
}
?>
