# API 文档

所有 API 路径均以 `/rest` 为前缀。

## 通用说明

### 响应格式

```json
{
    "code": 200,
    "msg": "ok",
    "data": { ... }
}
```

### 错误响应

```json
{
  "code": 500,
  "msg": "错误信息",
  "data": null
}
```

### 认证方式

- **JWT Token**（登录后获取）：`Authorization: Bearer <jwt_token>`
- **Admin Token**：`Authorization: Bearer <PICX_AUTH_TOKEN>`（管理员令牌，拥有最高权限）
- **API Key**（部分接口）：`X-API-Key: px_{prefix}.{secret}`

---

## 一、认证 (Auth)

### 获取认证配置

```
GET /rest/auth/config
```

返回可用的登录方式和存储平台配置。

**示例响应：**

```json
{
  "code": 200,
  "msg": "ok",
  "data": {
    "allowTokenLogin": true,
    "githubLoginEnabled": true,
    "steamLoginEnabled": false,
    "googleLoginEnabled": true,
    "storageProviders": [
      { "type": "R2", "name": "Cloudflare R2", "enabled": true },
      { "type": "HF", "name": "Hugging Face", "enabled": false }
    ],
    "defaultStorage": "R2"
  }
}
```

### GitHub 登录

```
POST /rest/github/login
```

**输入：**

```json
{
  "code": "github_oauth_code"
}
```

**输出：** 返回 JWT token 和用户信息

### Token 登录 / 验证 Token

```
POST /rest/checkToken
```

**输入：**

```json
{
  "token": "Bearer <jwt_token> 或 <admin_token>"
}
```

- 如果传入 Admin Token，返回管理员 JWT
- 如果传入 JWT，验证有效性并返回用户信息

### Steam 登录 - 获取认证 URL

```
GET /rest/steam/login
```

返回 Steam OpenID 认证 URL。

### Steam 回调

```
GET /rest/steam/callback?openid.ns=...&openid.mode=...&openid.claimed_id=...
```

处理 Steam OpenID 认证回调，重定向到前端并携带 token。

### Google 登录 - 重定向

```
GET /rest/google/login
```

重定向到 Google OAuth 认证页面。

### Google 回调

```
GET /rest/google/callback?code=...&state=...
```

处理 Google OAuth 回调，重定向到前端并携带 token。

---

## 二、用户信息

需要认证（JWT 或 Admin Token）。

### 获取当前用户信息

```
GET /rest/user/me
```

### 获取当前用户统计

```
GET /rest/user/me/stats
```

**输出：**
| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `totalImages` | number | 用户图片总数 |
| `totalSize` | number | 总存储大小（bytes） |
| `totalViews` | number | 总查看次数 |
| `recentUploads` | number | 最近 7 天上传数 |

---

## 三、图片管理

### 上传图片

```
POST /rest/upload
```

认证方式：JWT 或 API Key

**请求格式：** `multipart/form-data`

| 字段          | 类型    | 必填 | 说明                                      |
| :------------ | :------ | :--- | :---------------------------------------- |
| `files`       | File[]  | 是   | 图片文件（支持多个）                      |
| `path`        | string  | 否   | 自定义路径/文件夹                         |
| `keepName`    | boolean | 否   | 是否保留原始文件名                        |
| `expireAt`    | number  | 否   | 过期时间戳（毫秒）                        |
| `tags`        | string  | 否   | 标签（逗号分隔）                          |
| `nsfw`        | boolean | 否   | 是否为 NSFW 内容                          |
| `nsfwScore`   | number  | 否   | NSFW 评分                                 |
| `storageType` | string  | 否   | 存储类型 (`R2` 或 `HF`，默认使用系统配置) |
| `albumId`     | number  | 否   | 上传到指定相册 ID                         |

**输出：**

```json
{
  "code": 200,
  "msg": "ok",
  "data": [
    {
      "key": "2025/01/01/abc123.jpg",
      "size": 102400,
      "url": "https://...",
      "filename": "photo.jpg",
      "delToken": "uuid-deletion-token",
      "storageType": "R2",
      "nsfw": false,
      "nsfwScore": 0
    }
  ]
}
```

### 列出图片

```
POST /rest/list
```

认证方式：JWT 或 API Key，限速

**输入：**

```json
{
  "limit": 20,
  "cursor": "0",
  "delimiter": "folder_name/",
  "keyword": "搜索关键词"
}
```

**输出：**
| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `list` | ImgItem[] | 图片列表 |
| `next` | boolean | 是否还有更多 |
| `cursor` | string | 下一页游标 |
| `prefixes` | string[] | 子文件夹列表 |
| `canViewAll` | boolean | 用户是否有权限查看所有图片 |
| `total` | number | 图片总数 |

### 更新图片标签

```
POST /rest/updateTags
```

需要认证。

**输入：**

```json
{
  "key": "图片的 key",
  "tags": ["tag1", "tag2"]
}
```

### 重命名图片

```
POST /rest/rename
```

需要认证。

**输入：**

```json
{
  "oldKey": "旧的 key",
  "newKey": "新的 key"
}
```

### 删除图片（单张）

```
GET /rest/del/:key
```

无需认证（通过 URL 直接删除），后台异步执行。兼容旧版本。

### 批量删除

```
DELETE /rest/
```

认证方式：JWT 或 API Key

**输入：**

```json
{
  "keys": "key1,key2,key3"
}
```

### 获取删除链接信息

```
GET /rest/delInfo/:token
```

公开接口。

### 确认删除（通过删除链接）

```
POST /rest/delImage/:token
```

公开接口。

### 设置图片私密

```
POST /rest/image/set-private
```

需要认证（JWT）。

**输入：**

```json
{
  "key": "图片的 key",
  "password": "访问密码"
}
```

**输出：**

```json
{
  "code": 200,
  "msg": "ok",
  "data": { "key": "...", "isPrivate": true }
}
```

### 取消图片私密

```
POST /rest/image/remove-private
```

需要认证（JWT）。

**输入：**

```json
{
  "key": "图片的 key"
}
```

### 解锁私密图片

```
POST /rest/image/unlock
```

公开接口。

**输入：**

```json
{
  "key": "图片的 key",
  "password": "访问密码"
}
```

**输出：**

```json
{
  "code": 200,
  "msg": "ok",
  "data": {
    "token": "uuid-unlock-token",
    "expiresAt": 1700000000000
  }
}
```

### 查看/访问图片

```
GET /rest/:key{.+}
```

公开接口（通过图片 key 直接访问），支持 Range 请求，支持过期检查。

---

## 四、文件夹管理

### 创建文件夹

```
POST /rest/folder
```

需要认证。

**输入：**

```json
{
  "name": "folder_name"
}
```

文件夹名仅允许字母、数字、下划线、连字符和中文。

---

## 五、分享

### 创建分享链接

```
POST /rest/share
```

需要认证。

**输入：**

```json
{
  "imageKey": "图片的 key",
  "imageUrl": "图片的 URL",
  "password": "可选密码",
  "expireAt": 1700000000000,
  "maxViews": 100
}
```

**输出：**

```json
{
  "id": "AbCdEfGh",
  "url": "https://.../s/AbCdEfGh",
  "hasPassword": false,
  "expireAt": null,
  "maxViews": null
}
```

### 获取我的分享列表

```
GET /rest/share/my
```

需要认证。

### 获取分享信息

```
GET /rest/share/:id
```

公开接口。

### 验证密码并获取图片

```
POST /rest/share/:id/verify
```

公开接口。

**输入：**

```json
{
  "password": "分享密码"
}
```

**输出：**

```json
{
  "imageUrl": "https://...",
  "imageKey": "图片 key",
  "views": 1,
  "maxViews": 100
}
```

### 删除分享链接

```
DELETE /rest/share/:id
```

需要认证。

---

## 六、相册

所有相册管理接口需要认证。

### 获取相册列表

```
GET /rest/albums?keyword=xxx
```

### 创建相册

```
POST /rest/albums
```

**输入：**

```json
{
  "name": "相册名称",
  "description": "相册描述",
  "coverImage": "https://...",
  "enableRandomImage": true
}
```

### 更新相册

```
PUT /rest/albums/:id
```

### 删除相册

```
DELETE /rest/albums/:id
```

### 获取相册详情（含图片）

```
GET /rest/albums/:id?page=1&limit=50
```

### 获取相册随机图片

```
GET /rest/albums/:id/random
```

公开接口。需要相册开启 `enableRandomImage` 功能。

### 添加图片到相册

```
POST /rest/albums/:id/add
```

**输入：**

```json
{
  "images": [{ "key": "图片 key", "url": "图片 URL" }]
}
```

### 从相册移除图片

```
POST /rest/albums/:id/remove
```

**输入：**

```json
{
  "keys": ["key1", "key2"]
}
```

### 设置相册封面

```
POST /rest/albums/:id/cover
```

**输入：**

```json
{
  "coverImage": "https://..."
}
```

### 分享相册

```
POST /rest/albums/:id/share
```

**输入：**

```json
{
  "password": "可选密码",
  "expireAt": 1700000000000,
  "maxViews": 100
}
```

### 获取相册分享信息

```
GET /rest/share/album/:token
```

公开接口。

### 验证相册分享密码并获取内容

```
POST /rest/share/album/:token/verify
```

公开接口。

**输入：**

```json
{
  "password": "分享密码"
}
```

---

## 七、管理后台

所有管理接口需要认证且为管理员身份。

### 用户管理

#### 获取用户列表

```
GET /rest/admin/users?page=1&limit=10&q=keyword
```

#### 获取单个用户

```
GET /rest/admin/users/:login
```

#### 授权/取消授权查看所有图片

```
POST /rest/admin/users/:login/view-all
```

**输入：** `{ "grant": true }`

#### 设置用户角色

```
POST /rest/admin/users/:login/role
```

**输入：** `{ "role": "admin" | "user" }`

#### 设置用户存储配额

```
POST /rest/admin/users/:login/quota
```

**输入：** `{ "quota": 104857600 }`（单位：bytes）

### 统计

#### 系统总体统计

```
GET /rest/admin/stats
```

**输出：**
| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `userCount` | number | 用户总数 |
| `imageCount` | number | 图片总数 |
| `totalSize` | number | 总存储大小 |
| `recentUploads` | number | 最近 7 天上传数 |

#### 用户统计

```
GET /rest/admin/users/:login/stats
```

### 审计日志

```
GET /rest/admin/audit-logs?limit=50&offset=0&action=upload&user=xxx
```

### 访问分析

#### 访问统计概览

```
GET /rest/admin/analytics/overview
```

返回今日/本周/本月访问量、Top 10 国家、Top 10 来源网站。

#### 每日访问趋势

```
GET /rest/admin/analytics/trend
```

返回最近 30 天每日访问量。

#### 热门图片排行

```
GET /rest/admin/analytics/top-images?limit=10&days=30
```

#### 单张图片访问详情

```
GET /rest/admin/analytics/image/:key
```

#### 用户访问统计

```
GET /rest/admin/analytics/user/:login
```

### 同步 R2 数据

```
POST /rest/admin/sync-r2-to-d1
```

将历史 R2 文件元数据同步到 D1 数据库。

**输入：**

```json
{
  "limit": 100,
  "cursor": "optional_cursor",
  "dryRun": false
}
```

---

## 八、系统设置

需要管理员认证。

### 获取上传配置

```
GET /rest/settings/upload
```

### 更新上传配置

```
POST /rest/settings/upload
```

**输入：** `UploadConfigItem[]`

### 获取 Token 过期时间

```
GET /rest/settings/token-expire
```

### 更新 Token 过期时间

```
POST /rest/settings/token-expire
```

**输入：** `{ "days": 30 }`

---

## 九、API Key 管理

需要认证。

### 获取 API Key 列表

```
GET /rest/api-keys
```

### 创建 API Key

```
POST /rest/api-keys
```

**输入：**

```json
{
  "name": "我的博客",
  "expires_at": "2026-01-01T00:00:00Z"
}
```

### 撤销 API Key

```
DELETE /rest/api-keys/:id
```

### API Key 权限

API Key 仅允许以下操作：

| Method | Path           | 说明     |
| :----- | :------------- | :------- |
| POST   | `/rest/upload` | 上传图片 |
| POST   | `/rest/list`   | 列出图片 |
| DELETE | `/rest/`       | 批量删除 |

### 使用方式

```
X-API-Key: px_{prefix}.{secret}
```

---

## 快速参考

| 前缀                  | 模块     | 路径                                                                                                                        |
| :-------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `/rest/auth/*`        | 认证     | `/rest/auth/config`, `/rest/github/login`, `/rest/steam/*`, `/rest/google/*`, `/rest/checkToken`                            |
| `/rest/user/*`        | 用户     | `/rest/user/me`, `/rest/user/me/stats`                                                                                      |
| `/rest/upload`        | 上传     | `/rest/upload`                                                                                                              |
| `/rest/list`          | 图片列表 | `/rest/list`                                                                                                                |
| `/rest/del/*`         | 删除     | `/rest/del/:key`, `/rest/` (DELETE)                                                                                         |
| `/rest/delInfo/*`     | 删除链接 | `/rest/delInfo/:token`                                                                                                      |
| `/rest/delImage/*`    | 删除确认 | `/rest/delImage/:token`                                                                                                     |
| `/rest/updateTags`    | 标签更新 | `/rest/updateTags`                                                                                                          |
| `/rest/rename`        | 重命名   | `/rest/rename`                                                                                                              |
| `/rest/image/*`       | 图片私密 | `/rest/image/set-private`, `/rest/image/remove-private`, `/rest/image/unlock`                                               |
| `/rest/:key`          | 图片访问 | `/rest/:key` (catch-all)                                                                                                    |
| `/rest/folder`        | 文件夹   | `/rest/folder`                                                                                                              |
| `/rest/share/*`       | 分享     | `/rest/share`, `/rest/share/my`, `/rest/share/:id`                                                                          |
| `/rest/albums*`       | 相册     | `/rest/albums`, `/rest/albums/:id/*`                                                                                        |
| `/rest/share/album/*` | 相册分享 | `/rest/share/album/:token`                                                                                                  |
| `/rest/admin/*`       | 管理后台 | `/rest/admin/users*`, `/rest/admin/stats`, `/rest/admin/audit-logs`, `/rest/admin/analytics/*`, `/rest/admin/sync-r2-to-d1` |
| `/rest/settings/*`    | 系统设置 | `/rest/settings/upload`, `/rest/settings/token-expire`                                                                      |
| `/rest/api-keys*`     | API Key  | `/rest/api-keys`, `/rest/api-keys/:id`                                                                                      |
