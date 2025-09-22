-- Clear existing data if needed
TRUNCATE TABLE core_values, goals_plan RESTART IDENTITY CASCADE;

-- Insert core values with proper UUIDs
INSERT INTO core_values (id, title, description, icon, color, icon_color) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Social Development Goals', 'These goals focus on helping children develop positive interactions, cooperation, manners, and early social awareness.', 'people', '#fce4ec', '#e91e63'),
('550e8400-e29b-41d4-a716-446655440001', 'Academic Development Goals', 'Respect authority, follow rules, and value learning every day.', 'school', '#e8eaf6', '#3f51b5'),
('550e8400-e29b-41d4-a716-446655440002', 'Emotional Development Goals', 'Do the right thing, even when it''s difficult or unpopular.', 'mood', '#fff3e0', '#ff9800'),
('550e8400-e29b-41d4-a716-446655440003', 'Life Skills & Problem Solving', 'Stay persistent, ask for help, and keep learning from challenges.', 'lightbulb-outline', '#e8f5e9', '#4caf50'),
('550e8400-e29b-41d4-a716-446655440004', 'Physical Health Goals', 'Take care of your body with healthy habits and regular activity.', 'fitness-center', '#e3f2fd', '#2196f3'),
('550e8400-e29b-41d4-a716-446655440005', 'Faith & Spiritual Growth', 'Be gentle, kind, and do for others what you wish for yourself.', 'self-improvement', '#f3e5f5', '#9c27b0'),
('550e8400-e29b-41d4-a716-446655440006', 'Financial Literacy Goals', 'Plan wisely, save, and spend responsibly to achieve your dreams.', 'attach-money', '#fce4ec', '#7b1fa2'),
('550e8400-e29b-41d4-a716-446655440007', 'Digital & Media Literacy Goals', 'Use technology safely, responsibly, and to express creativity.', 'devices', '#e8eaf6', '#0288d1'),
('550e8400-e29b-41d4-a716-446655440008', 'Civic & Community Engagement', 'Contribute to your community and stand up for what is right.', 'emoji-people', '#fffde7', '#fbc02d'),
('550e8400-e29b-41d4-a716-446655440009', 'Creative Expression & Communication', 'Express yourself confidently through art, words, and actions.', 'brush', '#f1f8e9', '#388e3c');

-- Insert goals into goals_plan table with proper UUID relations
INSERT INTO goals_plan (id, core_value_id, status, area, goal, specific, measurable, achievable, relevant, time_bound, is_default) VALUES
-- Social Development Goals
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Mastered', 'Basic Manners', 'Practice saying "please," "thank you," and "excuse me"', 'Use polite phrases in conversations', 'At least 5 times per day', 'Modeling and reinforcement by adults', 'Develops respectful social interactions', 'Within 2 weeks', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Mastered', 'Greetings', 'Learn how to say hello and goodbye appropriately', 'Greet peers and adults at appropriate times', 'Observed in daily arrival and departure routines', 'With daily practice and adult prompting', 'Encourages social confidence', 'Mastered in 10 days', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Working on', 'Turn-Taking', 'Take turns in games and conversations', 'Take turns with peers during play or talk', 'Successfully take turns in 3 activities daily', 'Facilitated by turn-taking games and role-play', 'Fosters patience and cooperation', '4 weeks goal window', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Mastered', 'Sharing', 'Share toys and materials during play', 'Share favorite toys during group play', 'At least twice per play session', 'Encouraged and praised by teachers/parents', 'Essential for social bonding and empathy', 'Achieved over a 3-week period', TRUE),

-- Academic Development Goals
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', 'Mastered', 'Reading Practice', 'Read for 20 minutes daily', 'Choose age-appropriate books', 'Track reading time in log', 'Set aside dedicated reading time', 'Improves literacy and comprehension', 'Ongoing throughout semester', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', 'Working on', 'Math Skills', 'Complete math worksheets weekly', 'Focus on current grade level concepts', 'Complete 5 worksheets per week', 'Start with easier problems first', 'Builds foundational math skills', 'Complete by end of term', TRUE),

-- Emotional Development Goals
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440002', 'Working on', 'Emotion Identification', 'Name feelings when they occur', 'Use emotion chart as reference', 'Identify 3 emotions daily', 'Practice with parent/teacher', 'Increases emotional awareness', 'Practice for 4 weeks', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440002', 'Mastered', 'Calming Techniques', 'Use breathing exercises when upset', '4-7-8 breathing method', 'Use technique 3 times when needed', 'Practice during calm moments first', 'Helps regulate emotions', 'Mastered in 2 weeks', TRUE),

-- Life Skills & Problem Solving
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440003', 'Working on', 'Conflict Resolution', 'Use "I feel" statements during disagreements', 'Practice with role-playing', 'Successfully resolve 2 conflicts weekly', 'Start with minor disagreements', 'Promotes healthy relationships', 'Ongoing practice', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440003', 'Mastered', 'Task Completion', 'Finish assigned chores independently', 'Follow chore chart steps', 'Complete all steps 5 days/week', 'Break tasks into smaller steps', 'Builds responsibility', 'Achieved in 3 weeks', TRUE),

-- Physical Health Goals
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440004', 'Working on', 'Daily Exercise', 'Get 60 minutes of physical activity', 'Mix of structured and free play', 'Track activity in journal', 'Include activities child enjoys', 'Promotes healthy growth', 'Ongoing goal', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440004', 'Mastered', 'Hand Washing', 'Wash hands before meals and after bathroom', 'Follow proper 20-second technique', 'Parent observes 5 correct washes/day', 'Use fun timers/songs', 'Reduces illness spread', 'Mastered in 1 week', TRUE),

-- Faith & Spiritual Growth
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440005', 'Working on', 'Daily Reflection', 'Spend 5 minutes in quiet reflection', 'Use guided questions if needed', 'Complete 4 times weekly', 'Set consistent time each day', 'Builds spiritual awareness', 'Continue for 1 month', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440005', 'Mastered', 'Gratitude Practice', 'Name 3 things to be thankful for daily', 'Share at dinner or bedtime', 'Consistent for 7 straight days', 'Start with simple examples', 'Develops positive mindset', 'Achieved in 2 weeks', TRUE),

-- Financial Literacy Goals
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440006', 'Working on', 'Saving Habit', 'Save 20% of allowance each week', 'Use clear savings jar', 'Deposit set amount weekly', 'Start with small amounts', 'Teaches delayed gratification', 'Continue for 2 months', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440006', 'Mastered', 'Needs vs Wants', 'Correctly categorize 10 purchases', 'Use sorting game or flashcards', 'Get 8/10 correct consistently', 'Use real-life examples', 'Builds financial awareness', 'Mastered in 3 weeks', TRUE),

-- Digital & Media Literacy
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440007', 'Working on', 'Screen Time Limits', 'Follow daily screen time rules', 'Use timer for accountability', 'Comply 5 out of 7 days', 'Gradually reduce time', 'Promotes balanced activities', 'Ongoing practice', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440007', 'Mastered', 'Online Safety', 'Identify 3 online safety rules', 'Recite rules without prompts', 'Demonstrate knowledge weekly', 'Practice with supervised use', 'Keeps child safe online', 'Achieved in 2 weeks', TRUE),

-- Civic & Community Engagement
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440008', 'Working on', 'Community Helpers', 'Learn about 5 community helper roles', 'Identify helpers and their jobs', 'Name all 5 correctly', 'Take neighborhood walks', 'Builds community awareness', 'Complete in 3 weeks', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440008', 'Mastered', 'Recycling Practice', 'Sort recyclables correctly', 'Use color-coded bins', 'Proper sorting for 7 days', 'Start with easy materials', 'Teaches environmental care', 'Mastered in 1 week', TRUE),

-- Creative Expression & Communication
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440009', 'Working on', 'Art Exploration', 'Try 3 different art mediums weekly', 'Provide varied materials', 'Create with each medium', 'Start with familiar options', 'Encourages creativity', 'Continue for 1 month', TRUE),
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440009', 'Mastered', 'Storytelling', 'Tell a complete story with beginning/middle/end', 'Use picture prompts if needed', 'Complete 3 coherent stories', 'Start with personal experiences', 'Develops narrative skills', 'Achieved in 2 weeks', TRUE);