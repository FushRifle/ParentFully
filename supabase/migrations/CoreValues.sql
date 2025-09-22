-- Clear existing data if needed
TRUNCATE TABLE core_values, goals_plan RESTART IDENTITY CASCADE;

-- Insert core values with proper UUIDs
INSERT INTO core_values (id, title, description, icon, color, icon_color) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Social Development Goals', 
'These goals focus on helping children develop positive interactions, cooperation, manners, and early social awareness.', 
'people', '#F5E8FA', '#B200FF'),

('550e8400-e29b-41d4-a716-446655440001', 'Academic Development Goals', 
'These goals help children build pre-literacy, pre-math, thinking, and learning-to-learn skills in a playful, age-appropriate way.', 
'school', '#FAE8E9', '#FF0004'),

('550e8400-e29b-41d4-a716-446655440002', 'Emotional Development Goals', 
'These goals help children recognize, express, and manage their emotions, 
while also beginning to understand the emotions of others.', 'mood', '#E8F8FA', '#00C8FF'),

('550e8400-e29b-41d4-a716-446655440003', 'Life Skills & Problem Solving Goals', 
'This merged category focuses on helping children become more independent, observant, and capable through hands-on learning and decision-making.', 'lightbulb-outline', '#E8E9FA', '#00B312'),

('550e8400-e29b-41d4-a716-446655440004', 'Physical Health Goals', 
'These goals focus on building strong bodies, motor coordination, and healthy habits through active play and daily routines.', 
'fitness-center', '#FAFAE8', '#FFD000'),

('550e8400-e29b-41d4-a716-446655440005', 'Faith/Religion Developmental Goals', 
'These goals help build a loving connection with faith, family values, and spiritual identity through simple and consistent actions.', 
'self-improvement', '#F1FAE8', '#003CFF'),

('550e8400-e29b-41d4-a716-446655440006', 'Financial Literacy Goals', 
'These goals introduce basic money concepts and help children begin to understand the value of resources and thoughtful decision-making.', 
'attach-money', '#FAE8F4', '#FF00BB'),

('550e8400-e29b-41d4-a716-446655440007', 'Digital & Media Literacy Goals', 'These goals help children build a healthy relationship with technology through supervised exposure and clear rules.', 'devices', '#FAE8F2', '#FF006F'),

('550e8400-e29b-41d4-a716-446655440008', 'Civic & Community Engagement Goals', 'These goals nurture early awareness of community, kindness, responsibility, and active participation in shared spaces.', 'emoji-people', '#FAEAE8', '#FF6A00'),

('550e8400-e29b-41d4-a716-446655440009', 'Creative Expression & Communication Skills', 'These developmental goals nurture a child`s ability to express ideas, emotions, and imagination through words, movement, art, and storytelling.', 'brush', '#FAE8FA', '#CC00FF');
