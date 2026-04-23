-- 情绪检测问题初始化数据
-- 六个维度：精力水平、情绪稳定性、愉悦感、压力水平、睡眠质量、自信心

-- 精力水平维度
INSERT INTO emotion_questions (dimension, question_text, is_active) VALUES
('精力水平', '今天你起床是否感到轻松有活力？', true),
('精力水平', '今天你完成日常任务是否感到精力充沛？', true),
('精力水平', '今天你是否容易感到疲劳？', true);

-- 情绪稳定性维度
INSERT INTO emotion_questions (dimension, question_text, is_active) VALUES
('情绪稳定性', '今天你是否容易被小事激怒？', true),
('情绪稳定性', '今天你的情绪波动大吗？', true),
('情绪稳定性', '今天你是否感到心神不宁？', true);

-- 愉悦感维度
INSERT INTO emotion_questions (dimension, question_text, is_active) VALUES
('愉悦感', '今天你总体上感到快乐满足吗？', true),
('愉悦感', '今天你有什么事情让你感到开心吗？', true),
('愉悦感', '今天你对生活整体上感到满意吗？', true);

-- 压力水平维度
INSERT INTO emotion_questions (dimension, question_text, is_active) VALUES
('压力水平', '今天你感到压力大吗？', true),
('压力水平', '今天你是否感到紧张焦虑？', true),
('压力水平', '今天你觉得手头事情让你喘不过气吗？', true);

-- 睡眠质量维度
INSERT INTO emotion_questions (dimension, question_text, is_active) VALUES
('睡眠质量', '昨晚你睡得好吗？', true),
('睡眠质量', '你今早醒来是否感到精神恢复了？', true),
('睡眠质量', '昨晚你入睡困难吗？', true);

-- 自信心维度
INSERT INTO emotion_questions (dimension, question_text, is_active) VALUES
('自信心', '今天你对自己整体上感到满意吗？', true),
('自信心', '你相信自己能处理好今天遇到的困难吗？', true),
('自信心', '你觉得自己今天做事情有价值吗？', true);
