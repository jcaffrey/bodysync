-- dummy data
-- created 2/22/17, does not yet include records for exerciseSets, exercises, etc.
-- N.B.: this is not the best way to do this
-- source ~/Desktop/hsadev/bodysync/backend/config/dev-db-dump.sql

-- pts
insert into 
    pts (name, phoneNumber, phoneProvider, email, createdAt, updatedAt) \
values 
    ('Jeremy Welborn', '16174627953', 'att', 'asdf@asdf.com', now(), now()),
    ('Joey Caffrey', '12017254565', 'att', 'asdf@asdf.com', now(), now());

-- patients

insert into patients 
    (name, phoneNumber, phoneProvider, email, surgeryType, age, ptId, createdAt, updatedAt)
values 
    ('Josh Seides', '16788233590', 'att', 'asdf@asdf.com', 'BeingABaby', 12, (select id from pts where name = 'Joey Caffrey'), now(), now());  

-- injuries 
insert into injuries 
    (name, patientId, createdAt, updatedAt)
values
    ('stubbed toe', (select id from patients where name = 'Josh Seides'), now(), now()),
    ('sprained ankle', (select id from patients where name = 'Josh Seides'), now(), now());


-- romMetrics


-- romMetricMeasures
