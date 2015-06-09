---- create table incremental_applied_history
CREATE TABLE incremental_applied_history(
	sid long not null,
	applied_date date not null,
	incremental_file_name varchar not null,
	version long not null,
);

CREATE SEQUENCE incremental_applied_history_sid_seq START WITH 1 INCREMENT BY 1;

ALTER SEQUENCE OWNED BY incremental_applied_history.sid;

ALTER TABLE ONLY incremental_applied_history ALTER COLUMN SET DEFAULT nextval('incremental_applied_history_sid_seq');

ALTER TABLE ONLY incremental_applied_history ADD CONSTRANT pk_incremental_applied_history PRIMARY KEY (sid);
