INSERT INTO routine_templates (
    id, name, age_range, icon, description, notes, is_preloaded, categories, created_at
) VALUES
    (gen_random_uuid(), 'Morning Routine', '3–8 years', 'white-balance-sunny',
     'A structured start to the day that helps children develop independence and prepares them for school or daily activities.',
     'Ideal for preschool to early elementary. Use visual charts for younger children.',
     TRUE, ARRAY['morning','school'], NOW()),

    (gen_random_uuid(), 'After School Routine', '3–10 years', 'school',
     'Provides structure after the school day to balance responsibilities and relaxation.',
     'Builds structure after school day. Adjust homework duration based on age/needs.',
     TRUE, ARRAY['afternoon','school'], NOW()),

    (gen_random_uuid(), 'Evening Routine', '3–12 years', 'weather-night',
     'A calming routine that signals the transition to sleep, helping children wind down.',
     'Helps with winding down and sleep transition. Start 30-60 minutes before target bedtime.',
     TRUE, ARRAY['evening','bedtime'], NOW()),

    (gen_random_uuid(), 'No School Day', '5–12 years', 'calendar-weekend',
     'A flexible yet structured approach to weekends that maintains rhythm while allowing for relaxation.',
     'Flexible, relaxed — but still adds rhythm. Great for maintaining consistency on non-school days.',
     TRUE, ARRAY['weekend','family'], NOW());



-- Morning Routine tasks
INSERT INTO routine_template_tasks
    (id, routine_id, title, description, time_slot, priority, duration_minutes, icon, category, order_index)
VALUES
    (gen_random_uuid(), '97727507-e545-4929-b2ce-a573a2a73420', 'Wake up', 'Gently wake up and stretch', '07:00', 'high', 5, 'alarm', 'wake-up', 1),
    (gen_random_uuid(), '97727507-e545-4929-b2ce-a573a2a73420', 'Make bed', 'Straighten sheets and blankets', '07:05', 'medium', 3, 'bed-outline', 'chores', 2),
    (gen_random_uuid(), '97727507-e545-4929-b2ce-a573a2a73420', 'Brush teeth', '2 minutes of brushing', '07:10', 'high', 3, 'toothbrush', 'hygiene', 3),
    (gen_random_uuid(), '97727507-e545-4929-b2ce-a573a2a73420', 'Get dressed', 'Choose clothes and get dressed', '07:15', 'high', 10, 'tshirt-crew', 'dressing', 4),
    (gen_random_uuid(), '97727507-e545-4929-b2ce-a573a2a73420', 'Eat breakfast', 'Healthy breakfast with protein', '07:30', 'high', 20, 'food', 'meals', 5),
    (gen_random_uuid(), '97727507-e545-4929-b2ce-a573a2a73420', 'Pack school bag', 'Check for homework and supplies', '07:50', 'medium', 5, 'bag-personal-outline', 'school', 6);

----After School-----
INSERT INTO routine_template_tasks
    (id, routine_id, title, description, time_slot, priority, duration_minutes, icon, category, order_index)
VALUES
    (gen_random_uuid(), '7cadb382-972d-4308-98c7-0e395ca31ca3', 'Unpack bag', 'Empty lunchbox and organize papers', '15:30', 'medium', 5, 'bag-personal-outline', 'school', 1),
    (gen_random_uuid(), '7cadb382-972d-4308-98c7-0e395ca31ca3', 'Healthy snack', 'Fruit, veggies, or protein snack', '15:40', 'high', 15, 'food-apple', 'meals', 2),
    (gen_random_uuid(), '7cadb382-972d-4308-98c7-0e395ca31ca3', 'Homework', 'Focus on assignments', '16:00', 'high', 30, 'book-education', 'school', 3),
    (gen_random_uuid(), '7cadb382-972d-4308-98c7-0e395ca31ca3', 'Outdoor play', 'Physical activity outside', '16:30', 'medium', 45, 'soccer', 'activity', 4),
    (gen_random_uuid(), '7cadb382-972d-4308-98c7-0e395ca31ca3', 'Quick tidy up', 'Put away toys and belongings', '17:15', 'low', 10, 'broom', 'chores', 5);


---Evening Routine---
INSERT INTO routine_template_tasks
    (id, routine_id, title, description, time_slot, priority, duration_minutes, icon, category, order_index)
VALUES
    (gen_random_uuid(), 'b1f86216-d8b8-445f-ba74-23c43f5f87c8', 'Dinner', 'Family meal time', '18:00', 'high', 30, 'food-variant', 'meals', 1),
    (gen_random_uuid(), 'b1f86216-d8b8-445f-ba74-23c43f5f87c8', 'Bath time', 'Wash up for bed', '18:45', 'medium', 20, 'bathtub-outline', 'hygiene', 2),
    (gen_random_uuid(), 'b1f86216-d8b8-445f-ba74-23c43f5f87c8', 'Put on pajamas', 'Change into sleep clothes', '19:05', 'medium', 5, 'tshirt-v', 'dressing', 3),
    (gen_random_uuid(), 'b1f86216-d8b8-445f-ba74-23c43f5f87c8', 'Brush teeth', '2 minutes of brushing', '19:10', 'high', 3, 'toothbrush', 'hygiene', 4),
    (gen_random_uuid(), 'b1f86216-d8b8-445f-ba74-23c43f5f87c8', 'Read a book', 'Calming story time', '19:15', 'low', 15, 'book-open-page-variant', 'wind-down', 5),
    (gen_random_uuid(), 'b1f86216-d8b8-445f-ba74-23c43f5f87c8', 'Lights out', 'Time for sleep', '19:30', 'high', 0, 'power-sleep', 'sleep', 6);


--No school---
INSERT INTO routine_template_tasks
    (id, routine_id, title, description, time_slot, priority, duration_minutes, icon, category, order_index)
VALUES
    (gen_random_uuid(), '06818d8e-373b-4cb1-9f57-64f9d7984fb7', 'Wake up naturally', 'No alarm clock', '08:00', 'low', 0, 'weather-sunset', 'wake-up', 1),
    (gen_random_uuid(), '06818d8e-373b-4cb1-9f57-64f9d7984fb7', 'Family breakfast', 'Leisurely morning meal', '08:30', 'medium', 30, 'food-fork-drink', 'meals', 2),
    (gen_random_uuid(), '06818d8e-373b-4cb1-9f57-64f9d7984fb7', 'Tidy room', 'Quick clean-up', '09:00', 'medium', 15, 'room-service-outline', 'chores', 3),
    (gen_random_uuid(), '06818d8e-373b-4cb1-9f57-64f9d7984fb7', 'Choose an activity', 'Creative or educational', '09:30', 'low', 60, 'puzzle', 'activity', 4),
    (gen_random_uuid(), '06818d8e-373b-4cb1-9f57-64f9d7984fb7', 'Outdoor time', 'Park, bike ride, or play', '11:00', 'high', 90, 'bike', 'activity', 5),
    (gen_random_uuid(), '06818d8e-373b-4cb1-9f57-64f9d7984fb7', 'Screen time (limited)', 'TV, tablet, or games', '14:00', 'low', 60, 'tablet-cellphone', 'leisure', 6);
