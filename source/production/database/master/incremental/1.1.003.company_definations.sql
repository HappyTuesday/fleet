CREATE SCHEMA global;

SET search_path=global;

CREATE TABLE company(
	sid long not null,
	company_name varchar not null,
	suite_sid long not null,
	login_name varchar not null,
	is_internal boolean not null,
	create_date date not null,
	status smallint not null,
);

CREATE SEQUENCE company_sid_seq START WITH 1 INCREMENT BY 1 OWNED BY company;

ALTER TABLE ONLY company ALTER COLUMN sid SET DEFAULT nextval('company_sid_seq');

ALTER TABLE ONLY company ADD CONSTRANT pk_company PRIMARY KEY(sid);

ALTER TABLE ONLY company ADD CONSTRANT fk_company_suite_sid FOREIGN KEY (suite_sid) REFERENCES system_config.suite(sid);
