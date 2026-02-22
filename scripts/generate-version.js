const fs = require('fs');
const path = require('path');

// 读取 package.json 获取版本号
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

// 读取或创建版本计数器
let buildNumber = 0;
const counterPath = path.join(__dirname, '../.build-counter');
if (fs.existsSync(counterPath)) {
  buildNumber = parseInt(fs.readFileSync(counterPath, 'utf8'), 10);
}

// 增加构建计数
buildNumber += 1;
fs.writeFileSync(counterPath, buildNumber.toString());

// 获取当前时间（ISO 8601 格式）
const now = new Date();
const buildDate = now.toISOString();

// 创建版本信息
const versionInfo = {
  name: packageJson.name,
  version: packageJson.version,
  buildNumber: buildNumber,
  buildDate: buildDate,
  gitCommit: process.env.GIT_COMMIT || 'local'
};

// 写入 version.json 到项目根目录
fs.writeFileSync(
  path.join(__dirname, '../version.json'),
  JSON.stringify(versionInfo, null, 2)
);

console.log(`✓ Generated version.json: v${versionInfo.version} (build #${buildNumber}, ${buildDate})`);
