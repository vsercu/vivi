# vivi

What is Vivi?
-------------

Vivi is a wrapper around the popular Highstock-library to create charts, it will visualise data from MySQL and PostGres databases using simple SQL and is able to show live updated data.

Installing
----------

Clone this git repo in a /var/www/ webserver directory.
Make sure you have php5 installed, and the two debian packages:
* apt-get install php5-mysql 
* apt-get install php5-pgsql

Configuring
-----------

For security reasons create a read-only user on the databases you want to query.
Example XML query files you can find in the folder Examples.
Surf to the server where you have Vivi installed and load one.
Refer to the help-menu on the Vivi page.
