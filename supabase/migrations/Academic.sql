INSERT INTO goals_plan (
    id, core_value_id, user_id, child_id, status, area, goal, measurable,
    achievable, relevant, time_bound, is_default, is_active, created_at, updated_at,
    is_edited, is_selected, progress, age_group, celebration
) VALUES

-- Academic Age age3_5------------------------------------------------------------------------

-- Letter Recognition
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Mastered', 'Letter Recognition',
'Recognize and name uppercase and lowercase letters',
'Identifies letters correctly in 7/10 opportunities',
'Alphabet puzzles, songs, letter hunts',
'Foundation for reading and writing',
'Daily for 4–6 weeks', true, true, NOW(), NOW(), false, false, 0, 
'age3_5', '5 stars + certificate'),

-- Phonemic Awareness
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Mastered', 'Phonemic Awareness',
'Identify sounds that letters make (e.g., “A is for apple”)',
'Correctly matches sounds to letters in 4/5 trials',
'Letter sound songs, match letters to sounds in books',
'Supports early reading skills',
'Daily for 4–6 weeks', true, true, NOW(), NOW(), false, false, 0, 'age3_5', '5 stars + certificate'),

-- Name Writing
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Mastered', 'Name Writing',
'Begin to write or trace their own name',
'Writes/traces name legibly 3/5 times',
'Name tracing sheets, finger tracing in sand/shaving cream',
'Builds early writing confidence',
'3–5 times per week for 4 weeks', true, true, NOW(), NOW(), false, false, 0, 'age3_5', '5 stars + certificate'),

-- Counting Skills
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Counting Skills',
'Count aloud to 10–20 and match numbers with objects',
'Correctly counts/matches numbers in 3/5 situations',
'Count blocks, fingers, snacks, steps out loud',
'Develops number sense and early math skills',
'3–5 times per week for 6 weeks', true, true, NOW(), NOW(), false, false, 0, 'age3_5', '5 stars + certificate'),

-- Number Recognition
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Mastered', 'Number Recognition',
'Identify numbers 1–10 (or higher with interest)',
'Recognizes numbers in 4/5 opportunities',
'Number flashcards, board games with dice',
'Prepares for addition/subtraction concepts',
'Daily for 4 weeks', true, true, NOW(), NOW(), false, false, 0, 'age3_5', '5 stars + certificate'),

-- Shape & Color Identification
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Mastered', 'Shape & Color Identification',
'Recognize basic shapes (circle, square) and colors',
'Identifies 4/5 shapes/colors correctly',
'Shape sorting games, coloring activities',
'Strengthens visual discrimination and vocabulary',
'Daily for 3–4 weeks', true, true, NOW(), NOW(), false, false, 0, 'age3_5', '5 stars + certificate'),

-- Sorting & Grouping
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Mastered', 'Sorting & Grouping',
'Sort objects by size, shape, or color',
'Correctly sorts in 3/5 activities',
'Use buttons, blocks, or toys',
'Develops logic and categorization skills',
'Daily for 3–4 weeks', true, true, NOW(), NOW(), false, false, 0, 'age3_5', '5 stars + certificate'),

-- Pattern Recognition
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Mastered', 'Pattern Recognition',
'Identify and extend simple patterns (e.g., red-blue-red-blue)',
'Completes pattern extension correctly in 3/5 trials',
'Bead necklaces, snack patterns',
'Builds pre-math reasoning',
'Daily for 3–4 weeks', true, true, NOW(), NOW(), false, false, 0, 'age3_5', '5 stars + certificate'),

-- Story Retelling
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Mastered', 'Story Retelling',
'Retell simple stories using pictures or props',
'Accurately retells 3/5 stories',
'Puppet shows, picture books',
'Builds comprehension, sequencing, and speaking skills',
'3–5 times per week for 4 weeks', true, true, NOW(), NOW(), false, false, 0, 'age3_5', '5 stars + certificate'),

-- Book Awareness
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Mastered', 'Book Awareness',
'Hold a book correctly, turn pages, and understand reading flow',
'Demonstrates in 3/5 reading sessions',
'Read aloud daily, let child describe pictures',
'Encourages independent reading habits',
'Daily for 4 weeks', true, true, NOW(), NOW(), false, false, 0, 'age3_5', '5 stars + certificate'),

-- Use of Learning Materials
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Mastered', 'Use of Learning Materials',
'Use pencils, crayons, scissors, glue safely',
'Completes 3/5 activities safely',
'Practice coloring, tracing, cutting, gluing',
'Develops fine motor control for writing readiness',
'Daily for 4 weeks', true, true, NOW(), NOW(), false, false, 0, 'age3_5', '5 stars + certificate'),


-----------------------Academics age6_8------------------------------
-- Academic Development Goals (Age 6–8)
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Reading Comprehension',
 'Read daily and answer questions about story events',
 'Answers comprehension questions correctly in 3/5 readings',
 'Read together daily, ask guided questions',
 'Builds vocabulary, comprehension, and imagination',
 '15–20 readings in 4 weeks', true, true, now(), now(), false, false, 0,
 'age6_8', '5 stars + certificate'),

(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Writing Skills',
 'Write short stories, letters, or journal entries in complete sentences',
 'Completes 3/5 writing tasks with full sentences',
 'Provide prompts, model sentence structure, encourage practice',
 'Enhances expression, clarity, and structure',
 '10–15 writings in 4 weeks', true, true, now(), now(), false, false, 0,
 'age6_8', '5 stars + certificate'),

(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Math Concepts',
 'Solve addition, subtraction, and place value problems',
 'Completes 3/5 math exercises correctly',
 'Use visual aids like beads, blocks, and number games',
 'Foundation for problem-solving and logical thinking',
 '15–20 exercises in 4 weeks', true, true, now(), now(), false, false, 0,
 'age6_8', '5 stars + certificate'),

(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Following Multi-Step Instructions',
 'Complete 2–3 step tasks accurately',
 'Successfully completes 3/5 multi-step tasks',
 'Model steps, provide clear instructions, offer gentle reminders',
 'Develops listening and processing skills',
 '12–15 tasks in 4 weeks', true, true, now(), now(), false, false, 0,
 'age6_8', '5 stars + certificate'),

(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Asking Questions',
 'Ask “what,” “why,” and “how” questions to deepen understanding',
 'Asks questions in 3/5 learning sessions',
 'Prompt curiosity, praise good questions',
 'Builds curiosity and active thinking',
 '10–12 questions in 4 weeks', true, true, now(), now(), false, false, 0,
 'age6_8', '5 stars + certificate'),

(uuid_generate_v4(),'550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Organizing Ideas & Tasks',
 'Use checklists, planners, or weekly goals to plan work',
 'Completes 3/5 tasks using planning tools',
 'Introduce simple organizers and model usage',
 'Encourages responsibility and independent thinking',
 '6–8 planning sessions in 4 weeks', true, true, now(), now(), false, false, 0,
 'age6_8', '5 stars + certificate'),

(uuid_generate_v4(),'550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Focus & Attention',
 'Stay focused on a task for increasing periods',
 'Maintains focus for 10–15 minutes in 3/5 sessions',
 'Start with short activities, gradually increase duration',
 'Improves attention span and perseverance',
 '10–12 focused sessions in 4 weeks', true, true, now(), now(), false, false, 0,
 'age6_8', '5 stars + certificate'),

(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Discussion & Group Work',
 'Participate in group discussions and answer open-ended questions',
 'Contributes in 3/5 group activities',
 'Practice with family, small group settings, guided prompts',
 'Builds verbal skills, collaboration, and confidence',
 '6–8 group sessions in 4 weeks', true, true, now(), now(), false, false, 0,
 'age6_8', '5 stars + certificate'),

(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Real-Life Connections',
 'Relate school topics to real-life examples',
 'Gives relevant real-life examples in 3/5 learning activities',
 'Use everyday scenarios like cooking, shopping, or measuring',
 'Makes learning meaningful and memorable',
 '6–8 applications in 4 weeks', true, true, now(), now(), false, false, 0,
 'age6_8', '5 stars + certificate'),

(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Digital Learning',
 'Use educational apps, typing, or research safely with supervision',
 'Completes 3/5 digital learning tasks successfully',
 'Supervise usage, select age-appropriate apps',
 'Prepares kids for tech-based academics',
 '6–8 digital sessions in 4 weeks', true, true, now(), now(), false, false, 0,
 'age6_8', '5 stars + certificate'),

 -----------Age 9-11-------------------------------------------------------------------
-- Reading Comprehension
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Reading Comprehension',
 'Strengthen reading comprehension and analysis',
 'Summarizes main ideas, themes, and character motives in 3–4 books',
 'Discuss books daily, ask guided questions about plot, characters, and motives',
 'Supports understanding across subjects and critical thinking',
 '4–6 weeks', true, true, NOW(), NOW(), false, false, 0, 'age9_11', 'Reading Star sticker'),

-- Research Skills
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Research Skills',
 'Develop research and information-gathering skills',
 'Completes 2–3 research tasks using books, internet, or libraries',
 'Teach how to search, take notes, and cite sources',
 'Builds curiosity, independence, and academic rigor',
 '4–6 weeks', true, true, NOW(), NOW(), false, false, 0, 'age9_11', 'Researcher Badge'),

-- Time Management
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Time Management',
 'Use time management and organization strategies',
 'Completes 3–4 assignments on time using a checklist or planner',
 'Create schedules, checklists, and use planners for homework and projects',
 'Encourages responsibility, reduces stress, and improves productivity',
 '3–5 weeks', true, true, NOW(), NOW(), false, false, 0, 'age9_11', 'Organizer Star'),

-- Public Speaking
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Public Speaking',
 'Practice public speaking and presentation skills',
 'Delivers 2–3 oral presentations or book reports confidently',
 'Encourage oral reports, speeches, or creative presentations',
 'Builds confidence, clarity, and communication skills',
 '4–6 weeks', true, true, NOW(), NOW(), false, false, 0, 'age9_11', 'Speaker Badge'),

-- Applied Math
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Applied Math',
 'Apply math to real-life situations',
 'Solves 3–4 practical tasks using addition, subtraction, or measurement',
 'Use budgeting, cooking, or measuring activities at home or class',
 'Deepens understanding and relevance of math in everyday life',
 '3–5 weeks', true, true, NOW(), NOW(), false, false, 0, 'age9_11', 'Math Explorer Star'),

-- Study Skills
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Study Skills',
 'Begin note-taking and study strategies',
 'Creates notes/summaries for 2–3 lessons or assignments',
 'Show highlighting key ideas, summarizing, and reviewing notes regularly',
 'Prepares for advanced learning and builds independent study habits',
 '4–6 weeks', true, true, NOW(), NOW(), false, false, 0, 'age9_11', 'Study Skills Badge'),

-- Academic Goal-Setting
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Academic Goal-Setting',
 'Set personal academic goals',
 'Creates and tracks progress for 2–3 short-term academic goals',
 'Guide in identifying goals, creating action steps, and tracking progress',
 'Encourages motivation, self-direction, and accountability',
 '4–6 weeks', true, true, NOW(), NOW(), false, false, 0, 'age9_11', 'Goal-Setter Star'),

-- Technology for Learning
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Technology for Learning',
 'Use technology for learning purposes',
 'Completes 2–3 digital learning tasks or projects successfully',
 'Introduce educational apps, online lessons, and research tools',
 'Expands access to knowledge and tech literacy',
 '3–5 weeks', true, true, NOW(), NOW(), false, false, 0, 'age9_11', 'Digital Learner Badge'),

-- Handling Mistakes & Feedback
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Handling Mistakes & Feedback',
 'Understand how to handle mistakes and feedback',
 'Reflects on errors and shows improvement in 2–3 tasks',
 'Model reflection, discuss corrections, and celebrate progress',
 'Builds resilience, growth mindset, and problem-solving skills',
 '3–5 weeks', true, true, NOW(), NOW(), false, false, 0, 'age9_11', 'Growth Mindset Star'),

-- Reading Across Genres
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Reading Across Genres',
 'Read widely across genres',
 'Reads 3–4 different types of books: fiction, nonfiction, biography, or poetry',
 'Encourage diverse reading materials at home or school',
 'Broadens vocabulary, comprehension, and critical thinking',
 '4–6 weeks', true, true, NOW(), NOW(), false, false, 0, 'age9_11', 'Genre Explorer Badge'),

 ---------------Age 12+-------------------------------------------------------------------------
 -- Academic Development Goals: Age 12+
-- 1
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Working On', 'Develop Independent Study Habits',
 'Build responsibility and lifelong learning skills',
 'Maintains a regular study routine for 4 weeks',
 'Set a study schedule, create a quiet workspace, teach planning techniques (calendar/to-do list)',
 'Encourages self-discipline, focus, and preparation for higher education',
 '4 weeks', TRUE, TRUE, NOW(), NOW(), FALSE, FALSE, 0, 'age_12plus',
 'Study Star Badge + personal reward'),

-- 2
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Strengthen Critical Thinking and Analytical Skills',
 'Encourage deeper understanding and informed opinions',
 'Completes 3–5 exercises analyzing texts, debates, or current events',
 'Ask open-ended questions, discuss current events, analyze arguments together',
 'Builds reasoning, problem-solving, and decision-making skills',
 '6 weeks', TRUE, TRUE, NOW(), NOW(), FALSE, FALSE, 0, 'age_12plus',
 'Analytical Thinker Certificate'),

-- 3
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Master Research and Information-Gathering Skills',
 'Prepare for advanced academic work',
 'Completes 2–3 research assignments with credible sources',
 'Guide evaluation of sources, note-taking, and proper citation',
 'Supports independent learning, academic rigor, and critical evaluation',
 '6–8 weeks', TRUE, TRUE, NOW(), NOW(), FALSE, FALSE, 0, 'age_12plus',
 'Researcher Badge + recognition in class'),

-- 4
(uuid_generate_v4(),'550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Improve Time Management and Organization',
 'Reduce stress and increase productivity',
 'Successfully prioritizes and completes assignments within deadlines',
 'Use planners, break tasks into steps, prioritize with deadlines',
 'Builds efficiency, reduces stress, and develops lifelong organization habits',
 '4–6 weeks', TRUE, TRUE, NOW(), NOW(), FALSE, FALSE, 0, 'age_12plus',
 'Time Manager Ribbon + personal reward'),

-- 5
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Set Academic Goals and Monitor Progress',
 'Increase motivation and focus',
 'Tracks goals and progress for 4–6 weeks',
 'Regular check-ins to review goals and celebrate achievements or adjust plans',
 'Encourages accountability, self-reflection, and motivation',
 '4–6 weeks', TRUE, TRUE, NOW(), NOW(), FALSE, FALSE, 0, 'age_12plus',
 'Goal Achiever Badge + milestone celebration'),

-- 6
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Develop Communication Skills in Written and Verbal Form',
 'Express ideas clearly in all subjects',
 'Completes 3–5 essays or presentations with clarity and structure',
 'Practice essays, presentations, debates; provide feedback and revision',
 'Builds confidence, clarity, and persuasive skills',
 '6 weeks', TRUE, TRUE, NOW(), NOW(), FALSE, FALSE, 0, 'age_12plus',
 'Communicator Star Badge'),

-- 7
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Learn to Seek Help and Advocate for Themselves',
 'Promote confidence and resourcefulness',
 'Successfully asks for help or clarification in 3–5 academic contexts',
 'Encourage questions in class, office hours, or peer/tutor support',
 'Fosters independence, self-advocacy, and proactive learning',
 '4–6 weeks', TRUE, TRUE, NOW(), NOW(), FALSE, FALSE, 0, 'age_12plus',
 'Self-Advocate Ribbon + recognition'),

-- 8
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Explore Career Interests and Educational Pathways',
 'Align schoolwork with future aspirations',
 'Researches 2–3 careers or academic paths',
 'Attend career fairs, shadow professionals, explore online career tests',
 'Supports goal-setting, motivation, and informed decision-making',
 '6–8 weeks', TRUE, TRUE, NOW(), NOW(), FALSE, FALSE, 0, 'age_12plus',
 'Career Explorer Badge'),

-- 9
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Engage in Collaborative Learning',
 'Strengthen teamwork and diverse thinking',
 'Completes 2–3 group projects successfully',
 'Participate in study groups, peer tutoring, or team projects',
 'Builds cooperation, perspective-taking, and leadership skills',
 '6 weeks', TRUE, TRUE, NOW(), NOW(), FALSE, FALSE, 0, 'age_12plus',
 'Teamwork Star Badge'),

-- 10
(uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
'Working On', 'Use Technology Responsibly for Learning',
 'Expand access to resources and support digital literacy',
 'Demonstrates balanced use of tech for 4–6 weeks',
 'Introduce educational platforms, teach discerning content, monitor screen time',
 'Encourages digital literacy, responsible use, and independent research',
 '4–6 weeks', TRUE, TRUE, NOW(), NOW(), FALSE, FALSE, 0, 'age_12plus',
 'Digital Scholar Certificate');