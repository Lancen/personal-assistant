# API规格：管理员 - 用户管理

## 基础信息

- **基础路径**: `/api/admin`
- **认证**: 需要认证 + 管理员权限
- **权限**: 只有管理员可以访问

---

## 接口列表

### GET /api/admin/users

获取用户列表。

**请求参数**:
- `page` (query, optional): 页码，默认 1
- `pageSize` (query, optional): 每页条数，默认 20

**响应成功**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "userId": "string",
      "email": "string",
      "name": "string",
      "isAdmin": "boolean",
      "isActive": "boolean",
      "createdAt": "string (ISO date)"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### POST /api/admin/users

新增用户。

**请求体**:
```json
{
  "email": "string",
  "name": "string",
  "password": "string",
  "isAdmin": "boolean (optional, default false)"
}
```

**响应成功**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "number",
      "userId": "string",
      "email": "string",
      "name": "string",
      "isAdmin": "boolean",
      "isActive": "boolean",
      "createdAt": "string"
    }
  }
}
```

---

### PUT /api/admin/users/:id

更新用户信息。

**请求体**:
```json
{
  "name": "string (optional)",
  "password": "string (optional)",
  "isAdmin": "boolean (optional)",
  "isActive": "boolean (optional)"
}
```

**响应成功**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "number",
      "userId": "string",
      "email": "string",
      "name": "string",
      "isAdmin": "boolean",
      "isActive": "boolean",
      "createdAt": "string"
    }
  }
}
```

---

### DELETE /api/admin/users/:id

删除用户。

**响应成功**:
```json
{
  "success": true,
  "data": {
    "message": "删除成功"
  }
}
```
