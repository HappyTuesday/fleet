#!/bin/bash -ex

. db_common.sh

host=${host:-localhost}
dbname=${dbname:-postgres}
dbuser=${dbuser:-postgres}

while getopts h:d:U:p:t: opt;do
	case $opt in
	h) host=$OPTARG;;
	d) dbname=$OPTARG;;
	U) dbuser=$OPTARG;;
	t) dbtype=$OPTARG;;
	esac
done

db_conn="-h $host -d $dbname -U $dbuser"

if ! check_database_exists $dbname;then
	createdb -h $host -U $dbuser $dbname
fi

if check_table_exists public.incremental_applied_history;then
	current_version=$(
		query "select file_name from incremental_applied_history" | 
		expand calculate_version | 
		cut -d ' ' -f2 |
		sort -rn |
		head -1
	)
else
	current_version=0
fi

incremental_root=../source/production/database/$dbtype/incremental

function apply_incremental(){
	file_name=$1
	echo applying incremental $file_name
	execute_file $incremental_root/$file_name
	query <<-SQL
		INSERT INTO incremental_applied_history(file_name,applied_date)
		VALUES ('$file_name',now);
	SQL
}

ls -1 $incremental_root |
expand calculate_version |
expand filter 1 -gt $current_version |
expand apply_incremental
