import dotenv from 'dotenv';
import path from 'path';

// 加载项目根目录 .env
const result = dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), override: true });

// 确保测试必须的环境变量存在
if (!process.env.ENCRYPTION_KEY) {
  // 生成测试用固定 key（仅用于测试）
  process.env.ENCRYPTION_KEY = 'a'.repeat(64);
}
