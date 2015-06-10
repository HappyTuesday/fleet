CREATE SCHEMA security;

CREATE TABLE internal_user(
	sid long not null,
	role_type smallint not null,
	user_name varchar not null,
	login_name varchar not null,
	email varchar not null,
	password varchar not null,
	last_login_date date null,
	user_status smallint not null
);

CREATE SEQUENCE internal_user_sid_seq START WITH 1 INCREMENT BY 1 OWNED internal_user;

ALTER TABLE internal_user ALTER COLUMN sid SET DEFAULT nextval('internal_user_sid_seq');

ALTER TABLE internal_user ADD CONSTRAINT pk_internal_user PRIMARY KEY (sid);
