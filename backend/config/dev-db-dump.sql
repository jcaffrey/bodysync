-- dummy data
-- created 2/22/17, does not yet include records for exerciseSets, exercises, etc.
-- N.B.: this is not the best way to do this
-- source ~/Documents/Harvard/Extracurricular/HSA\ Dev/bodysync/backend/config/dev-db-dump.sql

-- pts
insert into 
    pts (name, hash, phoneNumber, phoneProvider, email, createdAt, updatedAt) \
values 
    ('Jeremy Welborn', 'jeremypw', '16174627953', 'att', 'asdf@gmail.com', now(), now()),
    ('Joey Caffrey', 'joeypw', '12017254565', 'att', 'asdf@gmail.com', now(), now());

-- patients

insert into patients 
    (name, hash, phoneNumber, phoneProvider, email, surgeryType, age, ptId, createdAt, updatedAt)
values 
    ('Josh Seides', 'joshpw', '16788233590', 'att', 'asdf@gmail.com', 'BeingABaby', 12, (select id from pts where name = 'Joey Caffrey'), now(), now());

-- injuries 
insert into injuries 
    (name, patientId, createdAt, updatedAt)
values
    ('stubbed toe', (select id from patients where name = 'Josh Seides'), now(), now()),
    ('sprained ankle', (select id from patients where name = 'Josh Seides'), now(), now());


-- romMetrics


-- romMetricMeasures
