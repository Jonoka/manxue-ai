# Manxue AI · 鹈鹕观察站

一个自托管的模型接口检测与历史观察工具，支持 OpenAI 兼容的 Responses 和 Chat Completions 协议。通过 SVG 动画生成、糖果题和可选的图片审核记录模型表现，提供公开结果页、后台多节点管理和访客独立测试。

这些检测是特定任务上的启发式检查，不证明模型身份，也不能代表模型的整体能力。视觉审核可能误判，糖果题仅检查回答中是否出现独立数字 `21`。

## 功能

- 管理多个 API 节点，切换当前节点，手动或定时检测。
- 展示历史记录、SVG 画廊和按糖果题结果统计的时间线。
- SVG 基础校验后，通过 Chromium 截取多帧并调用同一节点进行视觉审核；节点需支持图片输入。
- 访客使用自己的接口提交单项或双项检测，支持后台排队与进度查询。
- 后台密码登录、会话过期、凭据脱敏及访客公网地址校验。

## Docker 部署

需要 Docker Engine / Docker Desktop 和 Docker Compose。Windows 用户请使用 Linux 容器。

```sh
git clone https://github.com/w1196396546/manxue-ai.git
cd manxue-ai
```

首次部署必须通过 `ADMIN_TOKEN` 设置 12–256 字符的管理密码。下面的命令交互读取密码，避免将实际密码写入命令历史或配置文件。

Linux / macOS（Bash）：

```bash
read -r -s -p "Initial admin password: " ADMIN_TOKEN
echo
export ADMIN_TOKEN
docker compose up -d --build
unset ADMIN_TOKEN
```

Windows（PowerShell 7）：

```powershell
$env:ADMIN_TOKEN = Read-Host 'Initial admin password' -MaskInput
docker compose up -d --build
Remove-Item Env:ADMIN_TOKEN
```

公开页面：<http://127.0.0.1:18765/>；后台：<http://127.0.0.1:18765/admin>。

登录后编辑默认节点，填写自己的 API 地址、API Key 和实际可用的模型名称，再执行测试或启用自动检测。代码中的 `api.example.com` 是占位地址，默认模型名称也需按服务商支持情况修改。默认不启用自动检测。

数据持久化到 Docker 命名卷 `manxue-ai-data`。首次初始化后，环境变量不会覆盖已保存的管理密码；后续可直接执行 `docker compose up -d`。如需移除容器配置中保留的初始密码，清除环境变量后执行 `docker compose up -d --force-recreate`。不要使用 `docker compose down -v`，除非确实要删除数据。

对公网开放时，请在主机上配置 HTTPS 反向代理，转发至 `127.0.0.1:18765`。不要启用请求正文日志。

## 本地运行

支持 Linux / macOS、Python 3.11+。服务使用 Unix 文件锁和进程组，Windows 请通过 Docker 或 WSL 运行。

```sh
cd app
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python -m playwright install chromium
python server.py
```

Linux 如缺少浏览器系统依赖，可执行 `python -m playwright install --with-deps chromium`。

访问 <http://127.0.0.1:8765/admin> 初始化管理密码，然后配置节点。本地数据默认写入 `app/data/`。

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | 监听地址；容器内为 `0.0.0.0` |
| `PORT` | `8765` | 服务端口 |
| `DATA_DIR` | `app/data`（容器内 `/data`） | 数据库与实例锁目录 |
| `ADMIN_TOKEN` | 空 | 仅首次初始化管理密码，不是 API Key 或会话令牌 |

## 数据与安全

后台 API Key 保存在数据目录的 SQLite 数据库中，采用文件权限保护，**没有数据库加密**。管理密码保存为带随机盐的 PBKDF2-SHA256 哈希。不要发布数据库、数据卷、日志、备份或真实环境配置。

访客完整 API 地址和密钥仅在任务排队及执行期间保留在内存中；公开结果包含脱敏域名、模型、回答和生成的 SVG。访客结果会对其他访问者可见，不要向测试提交机密内容。完成结果保留一小时；重启后未完成任务标记中断。

检测和视觉审核会消耗对应接口额度，重试可能增加费用。服务需要持续运行才能执行定时任务；同一数据目录仅允许一个服务进程。

仓库采用 `.gitignore` 白名单，只收录明确列出的源码、README、许可证及部署文件。新增源文件时需要同步更新白名单。不要用 `git add -f` 强行提交被忽略的数据。

## 目录

```text
app/
  server.py          # HTTP 服务、认证、SQLite、调度与访客队列
  visual_review.py   # 多帧视觉审核
  render_frames.py   # 隔离 Chromium 截图
  web/               # 公开页面和后台静态资源
  requirements.txt   # Python 依赖
  Dockerfile
  .dockerignore
compose.yaml
README.md
LICENSE
.gitignore
```

## 许可证

沿用仓库的 [Apache License 2.0](LICENSE)。
