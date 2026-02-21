# Three.js Dice - 部署说明

## 项目信息
- **仓库:** GitLab - https://gitlab.com/tianxin459/threejs-dice.git
- **本地路径:** /var/www/threejs-dice
- **构建输出:** /var/www/threejs-dice/dist

## 部署详情
- **服务:** Nginx 1.26.3
- **端口:** 80
- **访问地址:**
  - 公网: http://111.231.71.226
  - 本地: http://localhost

## 更新部署

当代码更新时，执行以下步骤：

```bash
# 1. 拉取最新代码
cd /var/www/threejs-dice
git pull

# 2. 安装依赖（如果 package.json 变化）
npm install

# 3. 构建项目
npm run build

# 4. 重新加载 Nginx（通常不需要，除非更改配置）
/usr/sbin/nginx -s reload
```

## Nginx 配置

配置文件: `/etc/nginx/conf.d/threejs-dice.conf`

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/threejs-dice/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```
