CREATE SCHEMA system_config;

SET search_path=system_config;

CREATE TABLE configuration(
	sid long not null,
	config_group varchar not null,
	config_type varchar not null,
	config_value varchar not null,
);

CREATE SEQUENCE configuration_sid_seq START WITH 1 INCREMENT BY 1;

ALTER SEQUENCE configuration_sid_seq OWNED BY configuration;

ALTER TABLE ONLY configuration ALTER COLUMN sid SET DEFAULT nextval('configuration_sid_seq');

CREATE TABLE suite(
	sid long not null,
	name varchar not null,
);

CREATE SEQUENCE suite_sid_seq START WITH 1 INCREMENT BY 1;

ALTER SEQUENCE suite_sid_seq OWNED BY suite;

ALTER TABLE ONLY suite ALTER COLUMN sid SET DEFAULT nextval('suite_sid_seq');
