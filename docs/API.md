# API Key 接口

所有 API Key 接口都需要认证（JWT 登录或 Admin Token）。

请求头：
```
Authorization: Bearer <jwt_token>
```

响应格式：

```json
{
    "code": 200,
    "msg": "ok",
    "data": { ... }
}
```

错误响应：

```json
{
    "code": 500,
    "msg": "错误信息",
    "data": null
}
```

---

## 获取 API Key 列表

```
GET /rest/api-keys
```

### 输入参数

无（认证用户，基于 JWT 中的 `user_login` 过滤）

### 输出参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | integer | 200 成功 |
| `msg` | string | "ok" |
| `data` | array[ApiKey] | API Key 列表 |

### ApiKey 对象

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `id` | string | UUID |
| `name` | string | 用户自定义名称 |
| `key_prefix` | string | Key 前缀（前 8 位） |
| `created_at` | string | 创建时间 |
| `last_used_at` | string \| null | 最后使用时间 |
| `expires_at` | string \| null | 过期时间 |
| `is_active` | integer | 是否激活（0/1） |

### 示例响应

```json
{
    "code": 200,
    "msg": "ok",
    "data": [
        {
            "id": "a1b2c3d4-...",
            "name": "我的博客",
            "key_prefix": "a1b2c3d4",
            "created_at": "2025-01-01T00:00:00.000Z",
            "last_used_at": "2025-01-15T12:00:00.000Z",
            "expires_at": null,
            "is_active": 1
        }
    ]
}
```

---

## 创建 API Key

```
POST /rest/api-keys
```

### 请求头

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### 输入参数

| 字段 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|
| `name` | string | 是 | Key 名称（例如："我的个人博客"） |
| `expires_at` | string | 否 | ISO 8601 过期时间，不传则永不过期 |

### 输出参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | integer | 200 成功 |
| `msg` | string | "ok" |
| `data.id` | string | UUID |
| `data.name` | string | Key 名称 |
| `data.key` | string | **完整 API Key（仅创建时返回一次）** |
| `data.expires_at` | string \| null | 过期时间 |
| `data.created_at` | string | 创建时间 |

> **注意：** `key` 字段仅在创建时返回，出于安全考虑不会再显示。格式为 `px_{prefix}.{secret}`。

### 示例请求

```json
{
    "name": "我的个人博客",
    "expires_at": "2026-01-01T00:00:00Z"
}
```

### 示例响应

```json
{
    "code": 200,
    "msg": "ok",
    "data": {
        "id": "a1b2c3d4-e5f6-...",
        "name": "我的个人博客",
        "key": "px_a1b2c3d4.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "expires_at": "2026-01-01T00:00:00Z",
        "created_at": "2025-01-01T00:00:00.000Z"
    }
}
```

---

## 撤销 API Key

```
DELETE /rest/api-keys/:id
```

### 输入参数

| 字段 | 类型 | 位置 | 说明 |
|:---|:---|:---|:---|
| `id` | string | URL 参数 | API Key 的 UUID |

### 权限说明

- 普通用户只能撤销自己的 API Key
- 管理员可以撤销任何 API Key

### 输出参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | integer | 200 成功 |
| `msg` | string | "ok" |
| `data.id` | string | 被撤销的 API Key 的 UUID |

### 示例响应

```json
{
    "code": 200,
    "msg": "ok",
    "data": {
        "id": "a1b2c3d4-e5f6-..."
    }
}
```

---

## API Key 认证方式

API Key 仅允许以下操作：

| Method | Path | 说明 |
|:---|:---|:---|
| POST | `/rest/upload` | 上传图片 |
| POST | `/rest/list` | 列出图片 |
| DELETE | `/rest/` | 批量删除 |
| GET | `/rest/checkToken` | 验证 Token |
| GET | `/rest/del/*` | 删除图片（单张） |

### 使用方式

请求头：
```
X-API-Key: px_{prefix}.{secret}
```
