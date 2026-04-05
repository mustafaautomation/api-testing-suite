## Real-World Use Cases

### 1. CI API Smoke Test
```bash
npm run test:smoke
# Runs against staging before deploy
```

### 2. Contract Validation
```typescript
const response = await api.get("/api/users/1");
expect(response.body).toMatchSchema(userSchema);
```

### 3. Auth Flow Testing
```typescript
const token = await authHelper.login("user@example.com", "pass");
const response = await api.get("/api/profile").set("Authorization", `Bearer ${token}`);
expect(response.status).toBe(200);
```
