# Reslic Backend API Contract

> 本文档定义了 relics 前端的后端 API 接口规范。后端可按此规范实现，前端通过 `src/api/relics.js` 中的函数调用。

---

## 目录

- [通用约定](#1-通用约定)
- [管理员认证 API](#2-管理员认证-api)
- [分类 API](#3-分类-api)
- [文物查询 API](#4-文物查询-api)
- [管理员数据 API](#5-管理员数据-api)
- [导入文件格式](#6-导入文件格式)
- [前端函数映射表](#7-前端函数映射表)
- [环境配置说明](#8-环境配置说明)

---

## 1. 通用约定

### Base URL

| 环境 | Base URL |
|------|----------|
| 开发 | `http://localhost:8082` |
| 生产 | 待定（修改 `src/utils/request.js` 中的 `API_BASE_URL`） |

### 统一响应格式

```ts
type ApiResponse<T> = {
  success: boolean
  data: T | null
  message: string
}
```

### HTTP 状态码说明

| 状态码 | 含义 | 前端处理 |
|--------|------|----------|
| 200 | 请求成功 | 检查 `success` 字段 |
| 201 | 创建成功 | 同 200 |
| 400 | 请求参数错误 | 显示 `message` |
| 401 | 未认证 | 跳转登录页 |
| 403 | 无权限 | 显示权限提示 |
| 404 | 资源不存在 | 显示 404 提示 |
| 500 | 服务器内部错误 | 显示服务器错误 |

### 认证方式

除登录 API 外，所有管理员 API 需要在请求头携带 Token：

```
Authorization: Bearer <token>
```

`src/utils/request.js` 中已预留拦截器，接入时取消注释即可。

### 共享类型定义

```ts
type RelicCategory = {
  id: number
  name: string
  description?: string
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

type Relic = {
  id: number
  title: string
  categoryId: number
  content?: string
  imageUrl?: string
  period?: string
  location?: string
  publishDate?: string
  createdAt?: string
  updatedAt?: string
}

type RelicListItem = {
  id: number
  title: string
  imageUrl?: string
  publishDate?: string
}

type PageResult<T> = {
  list: T[]
  total: number
  page: number
  pageSize: number
}

type AdminLoginResult = {
  token: string
  username: string
  role: 'administrator'
}
```

### 通用错误响应

```json
{
  "success": false,
  "data": null,
  "message": "参数校验失败：title 为必填字段"
}
```

### 日期格式

所有日期字段统一使用 `yyyy-MM-dd` 格式（如 `2026-06-10`）。

---

## 2. 管理员认证 API

> 当前前端 `src/api/relics.js` 使用本地 Demo 登录（admin / admin123）。接入后端后替换为真实 API。

### POST `/api/admin/login`

管理员登录。

**请求体：**

```ts
type AdminLoginRequest = {
  username: string
  password: string
}
```

**响应类型：** `ApiResponse<AdminLoginResult>`

**成功响应示例：**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "username": "admin",
    "role": "administrator"
  },
  "message": "ok"
}
```

**失败响应示例：**

```json
{
  "success": false,
  "data": null,
  "message": "账号或密码错误"
}
```

---

## 3. 分类 API

### GET `/api/categories`

获取所有文物分类。

| 项目 | 说明 |
|------|------|
| 用途 | AdminDashboard 分类选择器、图表统计 |
| 返回 | `ApiResponse<RelicCategory[]>` |

**成功响应：**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "印信图章", "sortOrder": 1 },
    { "id": 2, "name": "旗帜证徽", "sortOrder": 2 }
  ],
  "message": "ok"
}
```

> 若后端未实现，前端默认使用 7 个内置分类。

---

## 4. 文物查询 API

### GET `/api/relics`

获取文物列表（无分页，用于后台统计）。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | number | 否 | 分类 ID，省略时返回全部 |

**返回：** `ApiResponse<Relic[]>`

### GET `/api/relics/page`

分页获取文物列表。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | number | 是 | 分类 ID |
| `page` | number | 是 | 页码，从 1 开始 |
| `pageSize` | number | 是 | 每页条数 |

**返回：** `ApiResponse<PageResult<RelicListItem>>`

**响应示例：**

```json
{
  "success": true,
  "data": {
    "list": [
      { "id": 1, "title": "红军印章", "imageUrl": "https://...", "publishDate": "2026-06-10" }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 8
  },
  "message": "ok"
}
```

### GET `/api/relics/{id}`

获取单件文物详情。

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 文物 ID（路径参数） |

**返回：** `ApiResponse<Relic>`

---

## 5. 管理员数据 API

> 以下接口需要 `Authorization: Bearer <token>` 认证。

### POST `/api/relics`

创建一件文物记录（JSON/CSV 导入也逐条调用此接口）。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 文物标题 |
| `categoryId` | number | 否 | 分类 ID，默认 1 |
| `content` | string | 否 | HTML 富文本 |
| `imageUrl` | string | 否 | 图片链接 |
| `period` | string | 否 | 年代 |
| `location` | string | 否 | 收藏地 |
| `publishDate` | string | 否 | 发布日期 `yyyy-MM-dd` |

**返回：** `ApiResponse<Relic>`

### PUT `/api/relics/{id}`

更新一件文物记录。

| 参数 | 说明 |
|------|------|
| `id` | 文物 ID（路径参数） |

**请求体：** 同 POST `/api/relics`

**返回：** `ApiResponse<Relic>`

### DELETE `/api/relics/{id}`

删除一件文物记录。

| 参数 | 说明 |
|------|------|
| `id` | 文物 ID（路径参数） |

**返回：** `ApiResponse<null>`

---

## 6. 导入文件格式

管理台「数据上传」面板支持拖入 JSON 或 CSV 文件。

### JSON

```json
[
  {
    "title": "红军印章",
    "categoryId": 4,
    "content": "<p>此印章为红军时期使用的重要器物。</p>",
    "imageUrl": "https://example.com/relic.jpg",
    "period": "土地革命时期",
    "location": "档案馆藏",
    "publishDate": "2026-06-10"
  }
]
```

### CSV

```csv
title,categoryId,content,imageUrl,period,location,publishDate
红军印章,4,<p>此印章为红军时期使用的重要器物。</p>,https://example.com/relic.jpg,土地革命时期,档案馆藏,2026-06-10
```

**CSV 字段兼容：** `imageUrl` 也接受 `image`；`publishDate` 也接受 `date`；`categoryId` 也接受 `type`。

---

## 7. 前端函数映射表

| 前端函数 | HTTP 方法 + 路径 | 返回类型 |
|----------|------------------|----------|
| `adminLogin(data)` | Demo 本地登录 / 未来 `POST /api/admin/login` | `ApiResponse<AdminLoginResult>` |
| `getCategories()` | `GET /api/categories` | `ApiResponse<RelicCategory[]>` |
| `getRelics(params)` | `GET /api/relics` | `ApiResponse<Relic[]>` |
| `getRelicsPage(params)` | `GET /api/relics/page` | `ApiResponse<PageResult<RelicListItem>>` |
| `getRelicDetail(id)` | `GET /api/relics/{id}` | `ApiResponse<Relic>` |
| `createRelic(data)` | `POST /api/relics` | `ApiResponse<Relic>` |
| `updateRelic(id, data)` | `PUT /api/relics/{id}` | `ApiResponse<Relic>` |
| `deleteRelic(id)` | `DELETE /api/relics/{id}` | `ApiResponse<null>` |

> 所有函数位于 `src/api/relics.js`。

---

## 8. 环境配置说明

### 修改 Base URL

`src/utils/request.js` 中的 `API_BASE_URL`：

```js
const API_BASE_URL = 'http://localhost:8082'  // 开发
// const API_BASE_URL = 'https://your-domain.com/api'  // 生产
```

### 启用 Token 认证

修改 `src/utils/request.js` 请求拦截器，取消 Token 相关代码的注释。

### CORS 说明

后端需允许前端开发服务器的跨域请求：

- `Access-Control-Allow-Origin: http://localhost:8080`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
