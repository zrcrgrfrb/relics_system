# 图片上传接口 — 前端适配文档

> 本文档说明如何在前端接入图片上传 API，替换现有的 URL 输入方式。

---

## 1. 接口说明

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| 路径 | `/api/upload` |
| 认证 | 需要 `Authorization: Bearer <token>` |
| 请求类型 | `multipart/form-data` |
| 文件大小上限 | 10MB |
| 支持的格式 | jpg, jpeg, png, gif, webp, bmp, svg |

**请求示例（Multipart）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `file` | File | 图片文件 |

**成功响应（200）：**

```json
{
  "success": true,
  "data": "http://localhost:8082/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
  "message": "ok"
}
```

**失败响应示例：**

```json
{
  "success": false,
  "data": null,
  "message": "不支持的文件格式，仅允许：jpg, jpeg, png, gif, webp, bmp, svg"
}
```

返回的 `data` 即为可用的 `imageUrl`，可直接存入 relics 表的 `image_url` 字段。

---

## 2. 前端适配方案

### 2.1 新增 upload 函数

在 `src/api/relics.js` 中添加图片上传函数：

```js
/**
 * 上传图片文件
 * @param {File} file - 图片文件对象
 * @param {string} token - 管理员登录 token
 * @returns {Promise<{success: boolean, data: string, message: string}>}
 */
export function uploadImage(file, token) {
  const formData = new FormData()
  formData.append('file', file)

  return fetch('http://localhost:8082/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }).then(res => res.json())
}
```

若项目使用 axios，可用 axios 版本：

```js
export function uploadImage(file, token) {
  const formData = new FormData()
  formData.append('file', file)

  return axios.post('/api/upload', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => res.data)
}
```

### 2.2 改造文物编辑/创建表单

**改造前：** 管理员手动填写图片 URL 输入框

**改造后：** 增加文件选择 + 上传按钮，上传成功后自动填入返回的 URL

**示例组件代码（Vue）：**

```vue
<template>
  <div class="form-group">
    <label>图片</label>

    <!-- 文件上传控件 -->
    <input
      type="file"
      accept="image/jpeg,image/png,image/gif,image/webp"
      @change="handleFileUpload"
      :disabled="uploading"
    />
    <button
      @click="triggerUpload"
      :disabled="!selectedFile || uploading"
    >
      {{ uploading ? '上传中...' : '上传图片' }}
    </button>

    <!-- 显示上传进度或错误 -->
    <p v-if="uploadError" class="error">{{ uploadError }}</p>

    <!-- 图片预览 -->
    <img v-if="formData.imageUrl" :src="formData.imageUrl" class="preview" />

    <!-- 或者保留 URL 输入框作为手动输入备选 -->
    <input
      v-model="formData.imageUrl"
      placeholder="或手动输入图片 URL"
    />
  </div>
</template>

<script>
import { uploadImage } from '@/api/relics'

export default {
  data() {
    return {
      selectedFile: null,
      uploading: false,
      uploadError: '',
      formData: {
        imageUrl: ''
      }
    }
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0]
      this.uploadError = ''
    },
    async triggerUpload() {
      if (!this.selectedFile) return
      this.uploading = true
      this.uploadError = ''

      try {
        const token = localStorage.getItem('admin-token') // 假设 token 存在 localStorage
        const res = await uploadImage(this.selectedFile, token)

        if (res.success) {
          this.formData.imageUrl = res.data
          this.selectedFile = null
        } else {
          this.uploadError = res.message || '上传失败'
        }
      } catch (err) {
        this.uploadError = '网络错误，请重试'
      } finally {
        this.uploading = false
      }
    }
  }
}
</script>

<style scoped>
.preview {
  max-width: 200px;
  max-height: 150px;
  display: block;
  margin-top: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.error {
  color: #e74c3c;
  font-size: 13px;
}
</style>
```

### 2.3 React 版本示例

```jsx
import React, { useState } from 'react'
import { uploadImage } from './api/relics'

function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const token = localStorage.getItem('admin-token')
      const res = await uploadImage(file, token)

      if (res.success) {
        onChange(res.data)  // 将 URL 传回父组件
      } else {
        setError(res.message || '上传失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label>图片</label>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <span>上传中...</span>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {value && <img src={value} alt="preview" style={{ maxWidth: 200, maxHeight: 150 }} />}

      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="或手动输入图片 URL"
      />
    </div>
  )
}
```

---

## 3. 集成到 createRelic / updateRelic

在提交创建/更新文物时，`imageUrl` 字段直接使用上传后返回的 URL（不要传 File 对象）：

```js
const relicData = {
  title: '红军印章',
  categoryId: 4,
  content: '<p>文物描述</p>',
  imageUrl: uploadedImageUrl,  // ← 上传接口返回的完整 URL
  period: '土地革命时期',
  location: '档案馆藏',
  publishDate: '2026-06-10'
}

// 已有的 createRelic / updateRelic 函数无需改动
createRelic(relicData)
```

---

## 4. 图片访问说明

上传成功后，文件保存在后端的 `uploads/` 目录，通过以下 URL 访问：

```
http://localhost:8082/uploads/<uuid>.<ext>
```

后端已配置静态资源映射，`<img>` 标签直接使用此 URL 即可正常显示。

---

## 5. 错误处理对照表

| HTTP 状态码 | message | 前端处理 |
|-------------|---------|----------|
| 400 | 上传文件不能为空 | 提示用户选择文件 |
| 400 | 文件大小不能超过 10MB | 提示用户压缩文件 |
| 400 | 不支持的文件格式... | 提示用户选择支持格式 |
| 401 | 未认证，请先登录 / Token 无效或已过期 | 跳转登录页 |
| 500 | 文件上传失败：... | 提示服务器错误，可重试 |

---

## 6. 项目结构变更

```
relics_serve/
├── uploads/              ← 新增：上传文件存储目录（自动创建，无需提交到 git）
└── src/main/java/.../
    └── controller/
        └── FileController.java   ← 新增：文件上传接口
```
