CREATE SCHEMA system_config;

SET search_path=system_config;

CREATE TABLE configuration(
	sid long not null,
	config_group varchar not null,
	config_type varchar not null,
	config_value varchar not null,
);

CREATE SEQUENCE configuration_sid_seq START WITH 1 INCREMENT BY 1 OWNED BY configuration;

ALTER TABLE ONLY configuration ALTER COLUMN sid SET DEFAULT nextval('configuration_sid_seq');

ALTER TABLE ONLY configuration ADD CONSTRAINT PRIMARY KEY (sid);

CREATE TABLE suite(
	sid long not null,
	name varchar not null,
	ods_host varchar,
	ods_name varchar,
	dw_raw_host varchar,
	dw_raw_name varchar,
	dw_report_host varchar,
	dw_report_name varchar,
);

CREATE SEQUENCE suite_sid_seq START WITH 1 INCREMENT BY 1 OWNED BY suite;

ALTER TABLE ONLY suite ALTER COLUMN sid SET DEFAULT nextval('suite_sid_seq');

ALTER TABLE ONLY suite ADD CONSTRAINT pk_suite PRIMARY KEY (sid);
