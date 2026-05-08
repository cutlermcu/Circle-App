-- Circle App v0.1.0 — Seed Data (global/shared content)
-- Run after migrations. teacher_id = NULL means available to all teachers.

-- ─── Global Agreements ───────────────────────────────────────────────────────
INSERT INTO agreements (teacher_id, text, is_active, sort_order) VALUES
  (NULL, 'Speak from the heart — share your truth with honesty and care.', true, 1),
  (NULL, 'Listen from the heart — give your full attention to the speaker.', true, 2),
  (NULL, 'Speak for yourself — use "I" statements and share your own experience.', true, 3),
  (NULL, 'Confidentiality — what is shared in the circle, stays in the circle.', true, 4),
  (NULL, 'The right to pass — you may always choose to pass without explanation.', true, 5),
  (NULL, 'Respect the talking piece — only the person holding it speaks.', true, 6),
  (NULL, 'No put-downs — treat each other with dignity and respect.', true, 7),
  (NULL, 'Be present — put away distractions and give your full attention.', true, 8);

-- ─── Global Questions ─────────────────────────────────────────────────────────
INSERT INTO questions (teacher_id, text, category) VALUES
  -- Community building
  (NULL, 'What is one thing you appreciate about our classroom community?', 'Community'),
  (NULL, 'Share a time when someone in this class showed you kindness.', 'Community'),
  (NULL, 'What is one way you contribute to making our class a better place?', 'Community'),
  (NULL, 'What is something you''ve learned from someone in this room?', 'Community'),
  (NULL, 'What does feeling safe in a community mean to you?', 'Community'),
  -- Reflection
  (NULL, 'What is something you''re proud of accomplishing recently?', 'Reflection'),
  (NULL, 'What is one thing you would do differently if you could go back?', 'Reflection'),
  (NULL, 'What is something new you learned this week?', 'Reflection'),
  (NULL, 'What challenge have you overcome that you''re proud of?', 'Reflection'),
  (NULL, 'What is a goal you have for yourself this year?', 'Reflection'),
  -- Social-Emotional
  (NULL, 'What does it mean to be a good friend?', 'Social-Emotional'),
  (NULL, 'How do you handle it when something feels unfair?', 'Social-Emotional'),
  (NULL, 'What helps you calm down when you''re upset?', 'Social-Emotional'),
  (NULL, 'What is something that makes you feel included?', 'Social-Emotional'),
  (NULL, 'How do you show someone you care about them?', 'Social-Emotional'),
  -- Gratitude
  (NULL, 'What is something you''re grateful for today?', 'Gratitude'),
  (NULL, 'Who is someone you want to thank, and why?', 'Gratitude'),
  (NULL, 'What is a simple thing that brings you joy?', 'Gratitude'),
  (NULL, 'What is something about your life you often take for granted?', 'Gratitude'),
  (NULL, 'Share a moment from this week that you''re thankful for.', 'Gratitude'),
  -- Aspirations
  (NULL, 'What kind of person do you want to be?', 'Aspirations'),
  (NULL, 'What is a dream you have for your future?', 'Aspirations'),
  (NULL, 'What is something you want to get better at?', 'Aspirations'),
  (NULL, 'If you could change one thing about the world, what would it be?', 'Aspirations'),
  (NULL, 'What does success mean to you?', 'Aspirations'),
  -- Identity
  (NULL, 'What is something unique about you that others might not know?', 'Identity'),
  (NULL, 'What is a tradition or value important to your family?', 'Identity'),
  (NULL, 'What is a strength you have that helps your community?', 'Identity'),
  (NULL, 'Who is someone who has inspired you, and how?', 'Identity'),
  (NULL, 'What does home mean to you?', 'Identity'),
  -- Fun & Light
  (NULL, 'If you could have dinner with anyone in history, who would it be and why?', 'Fun'),
  (NULL, 'What superpower would you want, and how would you use it to help others?', 'Fun'),
  (NULL, 'What is your favorite way to spend a free afternoon?', 'Fun'),
  (NULL, 'What is something you''ve always wanted to learn?', 'Fun'),
  (NULL, 'If you could visit anywhere in the world, where would you go?', 'Fun'),
  -- Current Classroom
  (NULL, 'What is something happening in the world that you''re thinking about?', 'Current'),
  (NULL, 'What is one thing you''re looking forward to this week?', 'Current'),
  (NULL, 'What is something you found confusing or challenging recently?', 'Current'),
  (NULL, 'What is something outside of school you''ve been passionate about lately?', 'Current'),
  (NULL, 'What is something from our last circle that stayed with you?', 'Current');

-- ─── Global Grounding Prompts ─────────────────────────────────────────────────
INSERT INTO prompts (teacher_id, section, text) VALUES
  (NULL, 'grounding', 'Take three deep breaths together. Breathe in for 4 counts, hold for 4, release for 4.'),
  (NULL, 'grounding', 'Close your eyes and notice 5 things you can hear right now. Just listen.'),
  (NULL, 'grounding', 'Place both feet flat on the floor. Feel the ground beneath you. Take a slow, full breath.'),
  (NULL, 'grounding', 'Gently roll your shoulders back and down. Relax your jaw. Take a moment to just arrive here.'),
  (NULL, 'grounding', 'Imagine a peaceful place. Take 30 seconds to picture it clearly — the sounds, the smells, the feeling.'),
  (NULL, 'grounding', 'Box breathing: breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat twice.'),
  (NULL, 'grounding', 'Do a slow body scan from head to toe, gently releasing any tension you notice as you go.'),
  (NULL, 'grounding', 'Take a deep breath in, and on the exhale, let out a quiet sigh. Do this together twice.');

-- ─── Global Check-in Prompts ──────────────────────────────────────────────────
INSERT INTO prompts (teacher_id, section, text) VALUES
  (NULL, 'checkin', 'Weather check-in: If your mood was weather today, what would it be? (e.g. sunny, cloudy, stormy, foggy)'),
  (NULL, 'checkin', 'Number check-in: On a scale of 1–10, how are you feeling today? Just say the number — no explanation needed.'),
  (NULL, 'checkin', 'Color check-in: What color represents how you''re feeling right now?'),
  (NULL, 'checkin', 'One word: Share one word that describes how you''re showing up today.'),
  (NULL, 'checkin', 'Emoji check-in: If you were an emoji right now, which one would you be?'),
  (NULL, 'checkin', 'Traffic light: Red means you need support, yellow means you''re doing okay, green means you''re doing well. Where are you?'),
  (NULL, 'checkin', 'Animal check-in: What animal represents your energy today?'),
  (NULL, 'checkin', 'Energy level: Share your energy right now — low, medium, or high.');

-- ─── Global Appreciation Prompts ─────────────────────────────────────────────
INSERT INTO prompts (teacher_id, section, text) VALUES
  (NULL, 'appreciation', 'Offer a verbal appreciation to someone in the circle. Start with: "I appreciate [name] for..."'),
  (NULL, 'appreciation', 'Give a silent appreciation — make eye contact with someone and offer a genuine nod or smile.'),
  (NULL, 'appreciation', 'Turn to the person next to you and share one thing you appreciate about them.'),
  (NULL, 'appreciation', 'Write down one appreciation on a piece of paper to leave for someone after the circle.'),
  (NULL, 'appreciation', 'Share an appreciation for someone who helped you this week, even in a small way.'),
  (NULL, 'appreciation', 'Offer a group appreciation: name something you appreciate about our whole community.');
