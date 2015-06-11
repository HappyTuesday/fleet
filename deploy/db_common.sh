#!/bin/sh

function query(){
	psql $db_conn -tA -c "$1"
}

function execute_file(){
	psql $db_conn -f $1
}

function check_table_exists(){
	query "SELECT 1 FROM pg_tables where schemaname || '.' || tablename = '$1'" | grep 1
}

function check_database_exists(){
	query "SELECT 1 FROM pg_database WHERE datname = '$1'" | grep 1
}

function calculate_version(){
	a=(${1//./ })
	echo $1 $((${a[0]} * 100000 + ${a[1]} * 1000 + ${a[2]}))
}

function filter(){
	i=$1;op=$2;other=$3
	shift 3
	a=($*)
	if [ ${a[$i]} $op $other ];then 
		echo $*
	fi
}

function expand(){
	while read ln;do
		$* $ln
	done
}
