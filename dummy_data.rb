#!/usr/bin/ruby
# @author: vsercu@intec.ugent.be
# @date: 30-Mar.-2015
# @version: 3.0

require 'rubygems'
require 'mysql'

$DB_Username = "taisc"
$DB_Password = "taisc"
$DB_Database = "taisc"
$DB_Hostname = "localhost"

class Database
  @@mysql = nil
  ##############################################################################
  # connection to db
  def self.get_connection()
    puts("Connecting", "init_db")
    begin
      # connect to the MySQL server
      if @@mysql.nil? # singleton
        @@mysql = Mysql.real_connect($DB_Hostname, $DB_Username, $DB_Password, $DB_Database)
        @@mysql.reconnect = true
        puts("Connected to mysql @ localhost.", "init_db")
      end
    rescue Mysql::Error => e
      puts("Error code: #{e.errno}")
      puts("Error message: #{e.error}")
      puts("Error SQLSTATE: #{e.sqlstate}") if e.respond_to?("sqlstate")
    end
    @@mysql
  end

  def self.insert_dummy_log
    c = get_connection
    #return if c.nil?

    begin
      val = 0
      xas = 1
      while true

        xas += 1
        if xas % 10 == 0
          val = 50
        else
          val = 10 + rand(11)
        end

        st = c.prepare("INSERT INTO taisc_updates (
                        gid, channel, last_seq, count)
                        VALUES (
                         ?  ,    ?  ,   ? ,		?
                     )")

        st.execute( 10, 27, 0, val )

		puts "inserted #{xas} : #{val}"
        sleep 4

      end

    rescue Exception => e
      puts ("#{e} \n#{e.backtrace}")
    end
  end

end


if $0 == __FILE__
  Database.insert_dummy_log()
end
