# 3D 数字人模型目录

将 GLB 模型文件放到此目录，前端会自动加载。

## 默认加载路径

```
public/models/avatar.glb    ← 优先加载
```

## 支持的格式

| 格式 | 说明 | 推荐 |
|------|------|------|
| `.glb` | 二进制 glTF 2.0 | ✅ |
| `.gltf` | JSON glTF 2.0 | 可用 |

## 模型不存在时

如果 `avatar.glb` 不存在，页面不会白屏，自动显示程序化 Fallback 几何体数字人（白大褂 + 肤色 + 蓝裤装）。

## 方式一：Mixamo（推荐，免费）

1. 访问 [mixamo.com](https://www.mixamo.com/)（Adobe 账号，免费注册）
2. 选择角色 → 下载 FBX（含骨骼）
3. 选择动画 → 下载 FBX（idle/talking/gesture/walking 等）
4. Blender 导入 → NLA Editor 命名动画轨道 → 导出 GLB
5. 重命名为 `avatar.glb`，放入本目录

## 方式二：SMPL-X 导出

```python
# 后端 Python 示例
import trimesh
mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
mesh.export('avatar.glb')
```

SMPL-X 默认顶点数：10475，面片数：20908

## 方式三：Ready Player Me / VRM

支持导出 GLB 的任意数字人平台均可。

## 动画状态映射

如果模型包含动画 clips，前端的映射关系：

| 前端状态 | 动画 clip 名称 |
|----------|--------------|
| idle | idle / breathing |
| talking | talking / speaking |
| gesture | wave / explain / pointing |
| walking | walk / walking |

## 当前状态

- ❌ 没有 GLB → Fallback 几何体模式
- ✅ 有 GLB → 自动加载 + 骨骼动画
