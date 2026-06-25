# reslic

## 环境配置

前端部署相关变量集中放在环境文件里：

- `.env.development`：本地开发配置。
- `.env.production`：服务器构建配置。部署前把 `.env.production.example` 复制为 `.env.production`，并把 `VUE_APP_API_BASE_URL` 改成后端公网地址。

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
