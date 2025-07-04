# CloudFlare 文件分享 
[English](https://github.com/joyance-professional/cf-files-sharing/blob/main/README.md)｜[简体中文](https://github.com/joyance-professional/cf-files-sharing/blob/main/README-cn.md)

[![Deploy](https://img.shields.io/badge/Deploy%20to-Cloudflare-orange)](https://deploy.workers.cloudflare.com/?url=https://github.com/joyance-professional/cf-files-sharing/)(先要手动创建 D1 数据库，创建 R2 存储桶,更新 wrangler.toml)

一个运行在 Cloudflare Workers 上的简单文件分享工具，支持 R2 和 D1 双存储解决方案。

## 特性

- 🔐 密码保护，支持基于 cookie 的持久登录（30 天）
- 💾 双存储解决方案：R2 存储桶 + D1 数据库
- 📦 自动存储选择：大于 25MB 的文件自动使用 R2
- 🔗 简单的分享链接
- 🎨 极简黑白界面设计
- 🚀 Cloudflare Workers 驱动，全球高速访问

## 目录

- [逻辑](#逻辑)
- [部署指南](#部署指南)
  - [前置条件](#前置条件)
  - [第 1 步：配置环境](#第-1-步配置环境)
  - [第 2 步：创建所需的 Cloudflare 资源](#第-2-步创建所需的-cloudflare-资源)
  - [第 3 步：初始化数据库](#第-3-步初始化数据库)
  - [第 4 步：配置环境变量](#第-4-步配置环境变量)
  - [第 5 步：部署](#第-5-步部署)
- [使用指南](#使用指南)
  - [管理员访问](#管理员访问)
  - [文件上传](#文件上传)
  - [文件分享](#文件分享)
- [技术细节](#技术细节)
  - [存储机制](#存储机制)
  - [数据库结构](#数据库结构)
  - [安全特性](#安全特性)
- [配置选项](#配置选项)
  - [环境变量](#环境变量)
  - [`wrangler.toml` 配置](#wranglertoml-配置)
- [开发指南](#开发指南)
  - [本地开发](#本地开发)
  - [代码结构](#代码结构)
- [贡献指南](#贡献指南)
- [致谢](#致谢)
- [反馈](#反馈)

## 逻辑

```
登录过程：
用户访问 → 检查 cookies → 无 cookies → 显示登录页面 → 验证密码 → 设置 cookies → 进入首页
                      ↑
              有 cookies → 验证 cookies → 进入首页

上传过程：
选择文件 → 检查文件大小 → >25MB → 使用 R2 存储
                              → ≤25MB → 选择存储方式 → R2 或 D1
              ↓
    生成唯一 ID → 存储文件 → 返回分享链接

下载过程：
访问分享链接 → 解析文件 ID → 确定存储位置 → 获取文件 → 返回文件内容
```

## 部署指南

### 前置条件

- [Node.js](https://nodejs.org/) (16.x 或更高版本)
- [Cloudflare 账户](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### 第 1 步：配置环境

1. 克隆仓库：

   ```bash
   git clone https://github.com/joyance-professional/cf-files-sharing
   cd cf-files-sharing
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3.安装wrangler：

  ```bash
   npm install -g wrangler
   ```

4. 登录 Cloudflare：

   ```bash
   wrangler login
   ```

### 第 2 步：创建所需的 Cloudflare 资源

1. 创建 R2 存储桶：

   ```bash
   wrangler r2 bucket create file-share
   ```

2. 创建 D1 数据库：

   ```bash
   wrangler d1 create file-share
   ```

3. 更新 `wrangler.toml` 文件中的数据库 ID：

   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "file-share"
   database_id = "your-database-id" # 从上一步获取
   ```

### 第 3 步：初始化数据库

运行数据库迁移：

```bash
wrangler d1 execute file-share --file=./migrations/init.sql --remote
```

> [!NOTE]
> 确保在 `wrangler.toml` 文件中将 `"your-database-id"` 替换为实际的数据库 ID。同时，在运行数据库迁移时包括 `--remote` 标志以将其应用到远程 D1 数据库。

### 第 4 步：配置环境变量

1. 设置认证密码：

   ```bash
   wrangler secret put AUTH_PASSWORD
   ```

   按提示输入您想设置的密码。

### 第 5 步：部署

部署到 Cloudflare Workers：

```bash
wrangler deploy
```

## 使用指南

### 管理员访问

1. 访问您的 Workers 域。
2. 输入设置的 `AUTH_PASSWORD` 以登录。
3. 登录状态将保留 30 天。

### 文件上传

1. 登录后，选择要上传的文件。
2. 小于 25MB 的文件可以选择存储方式（R2 或 D1）。
3. 大于 25MB 的文件将自动使用 R2 存储。
4. 上传完成后获取分享链接。

### 文件分享

- 分享链接格式：`https://your-worker.workers.dev/file/[FILE_ID]`
- 任何人都可以通过链接直接下载文件。
- 链接永久有效。

## 技术细节

### 存储机制

- **R2 存储**：适合大文件，无大小限制。
- **D1 存储**：适合小文件（<25MB），存储在 SQLite 数据库中。

### 数据库结构

### 数据库结构

```
-- 文件元数据表
CREATE TABLE file_metadata (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    size INTEGER NOT NULL,
    storage_type TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 文件内容表
CREATE TABLE file_contents (
    id TEXT PRIMARY KEY,
    content BLOB NOT NULL
);

-- 设置表
CREATE TABLE settings (
    id TEXT PRIMARY KEY,
    theme TEXT,
    backgroundColor TEXT,
    textColor TEXT,
    buttonColor TEXT,
    buttonTextColor TEXT,
    headerBackground TEXT,
    headerTextColor TEXT,
    backgroundImage TEXT,
    language TEXT
);
```

### 安全特性

- 密码保护的管理界面
- HttpOnly cookies
- 安全的文件 ID 生成机制

## 配置选项

### 环境变量

| 变量名称        | 描述                    | 是否必需 |
|-----------------|-------------------------|----------|
| AUTH_PASSWORD   | 管理界面登录密码        | 是       |

### `wrangler.toml` 配置

```toml
name = "file-share-worker"
main = "src/index.js"

[[r2_buckets]]
binding = "FILE_BUCKET"
bucket_name = "file-share"

[[d1_databases]]
binding = "DB"
database_name = "file-share"
database_id = "your-database-id"
```

## 开发指南

### 本地开发

1. 克隆仓库后运行：

   ```bash
   wrangler dev
   ```

2. 访问 `http://localhost:8787` 进行测试。

### 代码结构

```
cf-files-sharing/
├── src/
│   ├── index.js        # 主入口文件
│   ├── auth.js         # 认证逻辑
│   ├── storage/
│   │   ├── r2.js       # R2 存储处理
│   │   ├── d1.js       # D1 存储处理
│   │   └── manager.js  # 存储管理器
│   ├── utils/
│   │   ├── response.js # 响应工具
│   │   └── id.js       # 文件 ID 生成器
│   └── html/
│       └── templates.js # HTML 模板
├── wrangler.toml       # Cloudflare 配置
└── migrations/         # D1 数据库迁移
    └── init.sql
```

## 贡献指南

1. Fork 本仓库。
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)。
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)。
4. 推送到分支 (`git push origin feature/AmazingFeature`)。
5. 创建 Pull Request。

## 致谢

- Cloudflare Workers 平台
- Claude-3.5-Sonnet AI
- Chat-GPT-o1-preview | [聊天记录](https://chatgpt.com/share/672f2565-470c-8012-a222-904ca69a4692)

## 反馈

如果您发现任何问题或有改进建议，请创建 [issue](https://github.com/joyance-professional/cf-files-sharing/issues)。
