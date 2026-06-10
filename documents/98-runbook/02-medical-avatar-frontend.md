# Runbook：医疗数字人 React 前端

## 0) 路径

```text
/home/yfn/polyu-internship-project/project/medical-avatar-frontend
```

## 1) 启动 mock 模式

```bash
cd /home/yfn/polyu-internship-project/project/medical-avatar-frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

访问：

```text
http://localhost:5173
http://192.168.1.91:5173
```

## 2) 启动真实后端模式

先启动后端 AI API：

```bash
cd /home/yfn/polyu-internship-project/project/backend
PYTHONPATH=src uvicorn smpl_service.modeling.entrypoints.chat_api:app --host 0.0.0.0 --port 8001
```

再启动前端：

```bash
cd /home/yfn/polyu-internship-project/project/medical-avatar-frontend
VITE_API_BASE=http://localhost:8001 npm run dev -- --host 0.0.0.0 --port 5173
```

## 3) 验证

```bash
npm run test:architecture
npm run build
```

## 4) 常见问题

如果页面走 mock 回答，检查是否设置了：

```text
VITE_API_BASE=http://localhost:8001
```

如果 Vite 提示 `5173` 被占用，说明已有前端进程在跑；可直接刷新浏览器，或改用 Vite 自动分配的新端口。
