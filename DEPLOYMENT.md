# 部署指南

## 前置要求

### 系统要求
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (可选，推荐)

### 环境变量
复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

需要配置的变量：
- `DATABASE_URL`: PostgreSQL 连接字符串
- `JWT_SECRET`: JWT 密钥（生产环境使用强密码）
- `OPENAI_API_KEY`: OpenAI API 密钥
- 其他可选配置（邮件、支付等）

## 本地开发

### 1. 数据库设置

```bash
# 启动 PostgreSQL (如果使用 Docker)
docker run --name mindai-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# 创建数据库
createdb mindai

# 运行迁移
cd backend
npm run migrate
```

### 2. 后端启动

```bash
cd backend
npm install
npm run dev
```

### 3. 前端启动

```bash
cd frontend
npm install
npm start
```

### 4. 使用 Docker Compose

```bash
docker-compose up -d
```

访问：
- 后端: http://localhost:3000
- 前端: http://localhost:3000
- 数据库: localhost:5432
- Redis: localhost:6379

## 生产部署

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 环境配置

```bash
# 创建项目目录
mkdir -p /opt/mindai
cd /opt/mindai

# 上传项目文件
# (使用 git clone 或 scp)

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置生产环境变量
```

### 3. 数据库部署

```bash
# 使用 Docker 部署 PostgreSQL
docker run -d \
  --name mindai-postgres \
  -e POSTGRES_DB=mindai \
  -e POSTGRES_USER=mindai \
  -e POSTGRES_PASSWORD=your-strong-password \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# 运行迁移
docker-compose run --rm backend npm run migrate
```

### 4. 部署应用

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看状态
docker-compose ps
```

### 5. Nginx 配置

创建 `nginx/conf.d/mindai.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. HTTPS 配置（使用 Let's Encrypt）

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 云部署

### AWS

```bash
# 使用 ECS + RDS + ElastiCache
# 1. 创建 RDS PostgreSQL
# 2. 创建 ElastiCache Redis
# 3. 创建 ECS 集群
# 4. 部署 Docker 容器
```

### Google Cloud

```bash
# 使用 Cloud Run + Cloud SQL + Memorystore
# 1. 创建 Cloud SQL PostgreSQL
# 2. 创建 Memorystore Redis
# 3. 部署到 Cloud Run
```

### 阿里云

```bash
# 使用 ACK + RDS + Redis
# 1. 创建 RDS PostgreSQL
# 2. 创建 Redis 实例
# 3. 创建 ACK 集群
# 4. 部署应用
```

## 监控与维护

### 日志查看

```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 数据库备份

```bash
# 手动备份
docker exec mindai-postgres pg_dump -U mindai mindai > backup_$(date +%Y%m%d).sql

# 自动备份脚本 (添加到 crontab)
# 0 2 * * * docker exec mindai-postgres pg_dump -U mindai mindai > /opt/mindai/backups/backup_$(date +\%Y\%m\%d).sql
```

### 性能监控

```bash
# 查看容器资源使用
docker stats

# 查看系统资源
htop
```

### 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像
docker image prune -a
```

## 安全配置

### 1. 环境变量安全
- 使用强密码
- 定期更换密钥
- 不要提交 .env 文件

### 2. 数据库安全
- 修改默认端口（可选）
- 设置强密码
- 限制访问 IP
- 启用 SSL 连接

### 3. API 安全
- 启用 CORS 限制
- 设置 API 限流
- 使用 HTTPS
- 定期更新依赖

### 4. 监控告警
- 设置错误监控（Sentry）
- 设置性能监控
- 设置日志告警

## 故障排查

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库是否运行
docker ps | grep postgres

# 检查数据库日志
docker logs mindai-postgres

# 检查连接字符串
echo $DATABASE_URL
```

#### 2. Redis 连接失败
```bash
# 检查 Redis 是否运行
docker ps | grep redis

# 测试 Redis 连接
docker exec -it mindai-redis redis-cli ping
```

#### 3. 前端无法访问
```bash
# 检查前端容器
docker-compose ps

# 查看前端日志
docker-compose logs frontend

# 检查端口映射
netstat -tuln | grep 3000
```

#### 4. AI 服务错误
```bash
# 检查 OpenAI API 密钥
echo $OPENAI_API_KEY

# 测试 API 调用
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### 调试模式

```bash
# 启用详细日志
export LOG_LEVEL=debug

# 查看实时日志
docker-compose logs -f --tail=100
```

## 备份与恢复

### 完整备份

```bash
# 备份数据库
docker exec mindai-postgres pg_dump -U mindai mindai > backup.sql

# 备份 Redis 数据
docker exec mindai-redis redis-cli BGSAVE
docker cp mindai-redis:/data/dump.rdb ./redis_backup.rdb

# 备份配置文件
cp .env ./backup_env
```

### 恢复数据

```bash
# 恢复数据库
docker exec -i mindai-postgres psql -U mindai < backup.sql

# 恢复 Redis
docker cp ./redis_backup.rdb mindai-redis:/data/dump.rdb
docker restart mindai-redis
```

## 性能优化

### 1. 数据库优化
- 添加索引
- 定期清理过期数据
- 使用连接池
- 查询优化

### 2. 缓存策略
- Redis 缓存热点数据
- CDN 加速静态资源
- 浏览器缓存

### 3. 负载均衡
- 使用 Nginx 负载均衡
- 多实例部署
- 数据库读写分离

### 4. 监控指标
- 响应时间
- 错误率
- 并发数
- 资源使用率

## 扩展建议

### 1. 水平扩展
- 多个后端实例
- 数据库主从复制
- Redis 集群

### 2. 功能扩展
- 添加更多 AI 模型
- 支持多语言
- 集成第三方服务

### 3. 安全增强
- WAF 防护
- DDoS 防护
- 安全审计

---

**最后更新**: 2026-02-03  
**版本**: 1.0.0
