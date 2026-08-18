# 个人 AI Copilot PWA · 第一版

这是根据《帮我做一个 iOS App。(3).md》做出的网页版 PWA 原型。

## 已完成
- 4 个主区：对话 / 知识库 / 笔记 / 代码库
- 双抽屉：历史会话 / 助理设置
- 联网、深度研究开关状态本地保存
- 模型选择 + 推理强度状态本地保存
- 巨型任务进度卡 + 暂停 / 继续演示
- 知识库搜索
- 笔记新建
- 删除二次确认
- PWA Manifest + Service Worker，可安装到主屏幕
- iPhone / 桌面响应式适配

## 尚未接入
- DeepSeek / OpenAI 兼容 API
- 真正的文件导入、OCR、RAG 索引
- 巨型任务后台执行、断点续跑
- 本地数据库
- 真正的技能 / 记忆 / 备份配置页

## 本地打开
PWA 的 Service Worker 需要通过 HTTP 访问，不能只双击 index.html。

macOS 终端在本目录运行：

python3 -m http.server 8080

然后浏览器打开：http://localhost:8080
