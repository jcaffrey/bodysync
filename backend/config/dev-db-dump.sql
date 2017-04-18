-- dummy data
-- created 2/22/17, does not yet include records for exerciseSets, exercises, etc.
-- N.B.: this is not the best way to do this

-- pts

/* notes on passwords and hashed passwords:
 * when testing the api (in postman or with curl at the command line), you should sign in
 * to get a token (which you should store as 'x-access-token':token in the header to simulate
 * the browser's storage) for subsequent resource requests, and you should sign in using a
 * plaintext password. We have inserted hashes into the db because these are not 
 * created using the controller of course (see the schema for bcrypt functionality).
 *
 * https://bcrypt-generator.com
 * $2a$08$dtV592jmtL7UM1O0sacUGe57ndCFlAeXUH/wXaP0FE1DmJ62EWPti is bcrypted jeremypw
 * $2a$08$2yDwkwaNfQIK3yD9Hyc72upxGR3eliOfC3OYvHsvtJoDUYOfRpWSe is bcrypted joeypw
 * $2a$08$KyePVbpTFRdPaDcc1xAtOOCacEh6X.e.6Ud0Z/AKLJHsMHNYkqKku is bcrypted davidpw
 * $2a$08$tfLDCj0ypAzW20TxF4B7N.hqUhzmdYBUk5.RsE3QRbiAZVvh51Pa. is bcrypted joshpw
 */
insert into 
    pts (name, hash, phoneNumber, phoneProvider, email, isAdmin, createdAt, updatedAt) \
values 
    ('Jeremy Welborn', '$2a$08$dtV592jmtL7UM1O0sacUGe57ndCFlAeXUH/wXaP0FE1DmJ62EWPti', '16174627953', 'att', 'jeremy@gmail.com', false, now(), now()),
    ('Joey Caffrey', '$2a$08$2yDwkwaNfQIK3yD9Hyc72upxGR3eliOfC3OYvHsvtJoDUYOfRpWSe', '12017254565', 'att', 'joey@gmail.com', false, now(), now()),
    -- temp admin, change if schema changes
    ('David Malan', '$2a$08$KyePVbpTFRdPaDcc1xAtOOCacEh6X.e.6Ud0Z/AKLJHsMHNYkqKku', '1234567890', 'att', 'david@gmail.com', true, now(), now());

-- patients

insert into patients 
    (name, hash, phoneNumber, phoneProvider, email, isRestrictedFromRom, surgeryType, age, ptId, createdAt, updatedAt)
values 
    ('Josh Seides', '$2a$08$tfLDCj0ypAzW20TxF4B7N.hqUhzmdYBUk5.RsE3QRbiAZVvh51Pa.', '16788233590', 'att', 'josh@gmail.com', false, 'BeingABaby', 12, (select id from pts where name = 'Joey Caffrey'), now(), now()),
    ('David Malan', '$2a$08$tfLDCj0ypAzW20TxF4B7N.hqUhzmdYBUk5.RsE3QRbiAZVvh51Pa.', '16788233590', 'att', 'dave@gmail.com', false, 'BeingABaby', 12, (select id from pts where name = 'Joey Caffrey'), now(), now()),
    ('Zamyla Chan', '$2a$08$tfLDCj0ypAzW20TxF4B7N.hqUhzmdYBUk5.RsE3QRbiAZVvh51Pa.', '16788233590', 'att', 'zamyla@gmail.com', false, 'Walkthroughs', 12, (select id from pts where name = 'Joey Caffrey'), now(), now());

-- injuries 
insert into injuries 
    (name, patientId, createdAt, updatedAt)
values
    ('shoulder injury', (select id from patients where name = 'Josh Seides'), now(), now()),
    ('stubbed toe', (select id from patients where name = 'Josh Seides'), now(), now()),
    ('sprained ankle', (select id from patients where name = 'Josh Seides'), now(), now());


-- romMetrics
insert into romMetrics
    (name, startRange, endRangeGoal, createdAt, updatedAt, injuryId)
values
    ('External Shoulder Rotation', '30', '90', now(), now(), 1),
    ('Toe Rotation', '5', '10', now(), now(), 1),
    ('Ankle Flexion', '70', '90', now(), now(), 1);

-- romMetricMeasures
insert into romMetricMeasures
    (name, degreeValue, nextGoal, dayOfNextGoal, dayMeasured, createdAt, updatedAt, romMetricId)
values
    ('firstMeasure', 32, 35, DATE_ADD(NOW(), INTERVAL 7 DAY), now(), now(), now(), 1),
    ('secondMeasure', 35, 43, DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), now(), now(), 1),
    ('thirdMeasure', 40, 50, DATE_ADD(NOW(), INTERVAL 21 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), now(), now(), 1),
    ('fourthMeasure', 45, 58, DATE_ADD(NOW(), INTERVAL 28 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), now(), now(), 1),
    ('fifthMeasure', 53, 70, DATE_ADD(NOW(), INTERVAL 35 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), now(), now(), 1),
    ('fifthMeasure', 65, 81, DATE_ADD(NOW(), INTERVAL 35 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), now(), now(), 1),
    ('fifthMeasure', 77, 90, DATE_ADD(NOW(), INTERVAL 35 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), now(), now(), 1),
    ('fifthMeasure', 90, 90, DATE_ADD(NOW(), INTERVAL 35 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), now(), now(), 1);

-- exerciseSets
insert into exerciseSets
    (name, isTemplate, isCurrentlyAssigned, intendedInjuryType, createdAt, updatedAt, injuryId, ptId)
values
    ('Shoulder Recovery', true, true, 'Shoulder', now(), now(), 1, 2),
    ('Stubbed Toe Recovery', true, true, 'Shoulder', now(), now(), 2, 2),
    ('Sprained Ankle Recovery', true, true, 'Shoulder', now(), now(), 3, 2);

-- exercises
insert into exercises
    (name, numRepsOrDuration, numSets, assignedFrequency, assignedDuration, dateAssigned, ptNotes, mediaUrl, createdAt, updatedAt, exerciseSetId)
values
    ('shoulder extension', 12, 3, 5, null, now(), 'extend shoulder while laying on side', null, now(), now(), 1),
    ('shoulder flexion', 12, 3, 5, null, now(), 'flex shoulder while laying on side', null, now(), now(), 1),
    ('shoulder stretch', 30, 3, 5, 45, now(), 'stretch shoulder for the assigned 45 seconds while laying on side', null, now(), now(), 1),
    ('stubbed toe extension', 12, 3, 5, null, now(), 'flex toe while laying on roof of building', null, now(), now(), 2),
    ('stubbed toe flexion', 12, 3, 5, null, now(), 'flex toe while laying upside down', null, now(), now(), 2),
    ('sprained ankle flexion', 12, 3, 5, null, now(), 'flex ankle while laying on bed of rocks', null, now(), now(), 3),
    ('sprained ankle  flexion', 12, 3, 5, null, now(), 'flex ankle while laying on roof of car', null, now(), now(), 3);

-- exerciseCompletions
insert into exerciseCompletions
    (dateCompleted, createdAt, updatedAt, exerciseId)
values
    (now(), now(), now(), 1),
    (DATE_ADD(NOW(), INTERVAL 1 DAY), now(), now(), 1),
    (DATE_ADD(NOW(), INTERVAL 2 DAY), now(), now(), 1),
    (DATE_ADD(NOW(), INTERVAL 3 DAY), now(), now(), 1),
    (DATE_ADD(NOW(), INTERVAL 5 DAY), now(), now(), 1),
    (DATE_ADD(NOW(), INTERVAL 7 DAY), now(), now(), 1),
    (DATE_ADD(NOW(), INTERVAL 8 DAY), now(), now(), 1),
    (DATE_ADD(NOW(), INTERVAL 9 DAY), now(), now(), 1),
    (DATE_ADD(NOW(), INTERVAL 10 DAY), now(), now(), 1),
    (DATE_ADD(NOW(), INTERVAL 12 DAY), now(), now(), 1);