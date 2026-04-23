# API规格：认证模块

## 基础信息

- **基础路径**: `/api/auth`
- **认证**: 部分接口需要认证

---

## 接口列表

### POST /api/auth/login

用户登录。

**请求体**:
```json
{
  "email": "string",
  "password": "string"
}
```

**响应成功**:
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "isAdmin": true
    }
  }
}
```

**响应失败**:
```json
{
  "success": false,
  "error": "邮箱或密码错误"
}
```

---

### GET /api/auth/me

获取当前登录用户信息。

**请求头**:
- `Authorization: Bearer {token}`

**响应成功**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "isAdmin": true
    }
  }
}
```

---

### POST /api/auth/logout

用户登出。

**请求头**:
- `Authorization: Bearer {token}`

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "登出成功"
  }
}
```
