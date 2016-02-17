<?php
$dbip = 'am.wilab2.ilabt.iminds.be';
$dbname = 'default_slice_qosmotec-2015-01-16t13.49.14+01.00';
//pg_dump default_slice_qosmotec-2015-01-16t13.49.14+01.00
//$dbip = 'ec.wlan-dev.forge-iminds.wall1.ilabt.iminds.be';
$usr = $pass = 'wilabuser';

function exception_error_handler($errno, $errstr, $errfile, $errline ) {
    throw new ErrorException($errstr, $errno, 0, $errfile, $errline);
}
set_error_handler("exception_error_handler");


try {
    $con = pg_connect("host=$dbip dbname=$dbname user=$usr password=$pass connect_timeout=3");
} Catch (Exception $e) {
    throw new Exception('When trying to connect to POSTGRES, pg_connect: ' . $e->getMessage());
}
if (pg_last_error()){
    throw new Exception('When trying to connect to POSTGRES database: <br/>' . pg_last_error());
}
$sqls = Array( "rssi value from the AP at robot" => "select time, att from monitor_qosmotec_attenuation");
        $response = array();
        foreach ($sqls as $name => $sql) {
           // for every sequel in the hash
	        $sql = trim($sql);

	        if (! preg_match("/.*LIMIT\s+\d+\s*;?$/i", $sql)){
	            //throw new Exception("No trailing LIMIT-clause found for serie '$name'...<br/>SQL: '$sql'<br/>Example: add 'LIMIT 1000' at the end...");
	        }

            $sql = preg_replace('/\s*?--\s*?.*/', '', $sql); // remove comments
	        $sql = str_replace(array("\n", "\t"), '', $sql); // remove newlines en tabs
            $query = $sql;
            $nested = 0;


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
                        $response[$name ] = $resultset;
                    }
                }

        }// end foreach
var_dump( $response);

      
pg_close($con);
?>
