CREATE SCHEMA geography;

SET search_path=geography;

CREATE TABLE country(
	sid long not null,
	country_name varchar not null,
);

CREATE SEQUENCE country_sid_seq START WITH 1 INCREMENT BY 1 OWNED BY country;

ALTER TABLE country ALTER COLUMN sid SET DEFAULT nextval('country_sid_seq');

ALTER TABLE country ADD CONSTRAINT pk_country PRIMARY KEY (sid);

CREATE TABLE province(
	sid long not null,
	province_name varchar not null,
	country_sid not null,
);

CREATE SEQUENCE province_sid_seq START WITH 1 INCREMENT BY 1 OWNED BY province;

ALTER TABLE province ALTER COLUMN sid SET DEFAULT nextval('province_sid_seq');

ALTER TABLE province ADD CONSTRAINT pk_province PRIMARY KEY (sid);

ALTER TABLE province ADD CONSTRAINT fk_province_country_sid FOREING KEY country_sid REFERENCES country(sid);

CREATE TABLE city(
	sid long not null,
	city_name varchar not null,
	province_sid long not null,
);

CREATE SEQUENCE city_sid_seq START WITH 1 INCREMENT BY 1 OWNED BY city;

ALTER TABLE city ALTER COLUMN sid SET DEFAULT next('city_sid_seq');

ALTER TABLE city ADD CONSTRAINT pk_city_sid PRIMARY KEY (sid);

ALTER TABLE city ADD CONSTRAINT fk_city_province_sid FOREIGN KEY province_sid REFERENCES province(sid);
