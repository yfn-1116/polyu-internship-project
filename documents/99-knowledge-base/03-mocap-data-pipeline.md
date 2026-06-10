# AMASS 动作捕捉数据处理技术与 SMPL-X 连续动画生成

> 撰写日期：2026-06-09
> 范围：从原始 AMASS 动作捕捉数据到前端 3D 连续动画的完整技术链路

---

## 1. 数据来源：AMASS 数据集

### 1.1 AMASS 简介

AMASS (Archive of Motion Capture as Surface Shapes) 是一个大规模人体动作捕捉数据集合，统一了 15 个不同的 MoCap 数据集到 SMPL/SMPL+H/SMPL-X 参数化格式。每个 `.npz` 文件包含：
- **poses**：每帧的身体姿态参数
- **betas**：人体体型参数（shape coefficients）
- **trans**：每帧的全局位移
- **gender**：性别标签
- **mocap_framerate**：原始采集帧率

### 1.2 本项目使用的子集：ElenaKyriakou

**数据来源**：2015 年采集的 Elena Kyriakou 动作表演数据
**原始路径**：`E:\01大二下文件夹\香港理工大学实习项目文件\20151003_ElenaKyriakou\`
**项目内路径**：`data/datasets/raw/amass/ElenaKyriakou/`

**数据规模**：

| 指标 | 值 |
|---|---|
| 情绪类别 | 12 种（Afraid, Angry, Annoyed, Bored, Excited, Happy, Miserable, Neutral, Pleased, Relaxed, Sad, Satisfied, Tired） |
| 版本数 | 每种情绪 2 个版本（v1, v2） |
| 文件总数 | 24 个 `.npz` 文件 + 1 个 `shape.npz` |
| 原始帧率 | 120 FPS |
| Happy_v1 示例 | 2,582 帧 @ 120fps = 21.5 秒 |
| 单文件大小 | ~10-20 MB（压缩 NPZ） |

### 1.3 NPZ 文件内部结构（以 Happy_v1 为例）

```
Keys: ['trans', 'gender', 'mocap_framerate', 'betas', 'dmpls', 'poses']

poses:     (2582, 156) float32    — 2,582 帧 × 156 维姿态参数
betas:     (16,) float32           — 16 维体型参数
trans:     (2582, 3) float32      — 每帧全局位移 (x, y, z)
gender:    'female'               — 性别
mocap_framerate: 120.0            — 采集帧率
dmpls:     (2582, 8) float32      — 软组织动态变形参数
```

---

## 2. 姿态格式：SMPL+H → SMPL-X 关节映射

### 2.1 SMPL+H 关节布局（输入格式）

SMPL+H 在 SMPL 基础上增加了手部关节，共 52 个关节：

```
poses 维度 = 52 joints × 3 (axis-angle) = 156

┌─────────┬──────────┬───────────────┬────────────────┐
│ root    │ body     │ left_hand     │ right_hand     │
│ 1 joint │ 21 joints│ 15 joints     │ 15 joints      │
│ 3 dims  │ 63 dims  │ 45 dims       │ 45 dims        │
└─────────┴──────────┴───────────────┴────────────────┘
         poses[:, :3]   poses[:, 3:66]  poses[:, 66:111]  poses[:, 111:156]
```

### 2.2 SMPL-X 关节布局（目标格式）

SMPL-X 增加了面部关节，共 55 个关节：

```
┌──────────┬──────────┬──────┬───────┬───────────────┬────────────────┐
│ root     │ body     │ jaw  │ eyes  │ left_hand     │ right_hand     │
│ 1 joint  │ 21 joints│ 1    │ 2     │ 15 joints     │ 15 joints      │
│ 3 dims   │ 63 dims  │ 3    │ 6     │ 45 dims       │ 45 dims        │
└──────────┴──────────┴──────┴───────┴───────────────┴────────────────┘
```

### 2.3 映射算法

```python
def convert_smplh_to_smplx(poses: np.ndarray) -> dict:
    """
    Input:  poses.shape = (N, 156)    # SMPL+H 格式
    Output: dict of SMPL-X 分离参数
    """
    n_frames = poses.shape[0]
    return {
        # 全局旋转：直接取前 3 维
        "global_orient": poses[:, :3],          # (N, 3)

        # 身体姿态：21 个身体关节
        "body_pose":     poses[:, 3:66],        # (N, 63)

        # 面部关节：SMPL+H 没有面部数据 → 填零
        "jaw_pose":      np.zeros((n, 3)),      # (N, 3)
        "left_eye_pose": np.zeros((n, 3)),      # (N, 3)
        "right_eye_pose":np.zeros((n, 3)),      # (N, 3)

        # 手部：直接映射
        "left_hand_pose": poses[:, 66:111],     # (N, 45)
        "right_hand_pose":poses[:, 111:156],    # (N, 45)
    }
```

**关键点**：SMPL+H 缺少面部数据（jaw + eyes = 9 维），这些在映射时填零。这意味着导出的动画中，数字人的面部保持中性表情，不会张嘴或眨眼。

---

## 3. 完整数据处理 Pipeline

### 3.1 Pipeline 架构（6 阶段）

```
┌────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Stage 1│ →  │ Stage 2  │ →  │ Stage 3   │ →  │ Stage 4  │ →  │ Stage 5  │ →  │ Stage 6  │
│ 输入   │    │ 验证     │    │ 帧选择    │    │ 关节映射 │    │ 模型前传 │    │ 文件输出 │
│ 加载   │    │ 解析     │    │ 降采样    │    │ 格式转换 │    │ Mesh生成 │    │ 清单生成 │
└────────┘    └──────────┘    └───────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 3.2 各阶段详解

#### Stage 1：NPZ 文件加载

```python
# MoCapNpzInputAdapter.load()

data = np.load("Elena_Happy_v1_C3D_poses.npz", allow_pickle=True)

# 必需字段验证
required = {"poses", "betas", "trans", "gender", "mocap_framerate"}

# 提取元数据
poses = data["poses"]      # (2582, 156) float32
betas = data["betas"]      # (16,) float32
trans = data["trans"]      # (2582, 3) float32
fps   = data["mocap_framerate"]  # 120.0

# 解析情感标签
# "Elena_Happy_v1_C3D_poses.npz" → emotion="Happy", version="v1"
```

#### Stage 2：数据验证

- 文件存在性检查
- 格式检查（.npz 扩展名）
- 必需字段完整性检查
- poses 维度检查：必须是 `(N, 156)` — 52 个 SMPL+H 关节 × 3 维
- 封装为 `BodyInput` 统一领域对象

#### Stage 3：帧选择与降采样

120fps 的原始数据帧数过多（Happy_v1 = 2,582 帧），需要降采样：

```python
def select_frames(n_total, frame_mode, target_fps, source_fps):
    if frame_mode == "keyframes":
        # 选取 5 个关键帧
        return [0, n//4, n//2, 3*n//4, n-1]

    if frame_mode == "all":
        if target_fps and target_fps < source_fps:
            # 降采样：120fps → 30fps → 每 4 帧取 1 帧
            step = round(source_fps / target_fps)  # step = 4
            return np.arange(0, n_total, step)
        return np.arange(n_total)
```

**降采样效果**（以 Happy_v1 为例）：

| 模式 | 帧数 | 文件大小 | 用途 |
|---|---|---|---|
| 原始 (120fps) | 2,582 | 顶点数据 ~310MB | 高精度存档 |
| 降采样 (30fps) | 646 | 顶点数据 ~78MB | 前端播放 |
| 关键帧 (5帧) | 5 | 5个独立 OBJ | 快速预览 |

#### Stage 4：SMPL+H → SMPL-X 关节映射

见第 2 节。核心操作为 `convert_smplh_to_smplx()` 函数。

#### Stage 5：SMPL-X 模型批量前向传播

这是整个 Pipeline 中**计算量最大**的步骤：

```python
# 加载 SMPL-X 模型
model_path = "models/smplx/SMPLX_FEMALE.npz"
body_model = smplx.create(
    model_path=model_path,
    model_type="smplx",
    gender="female",
    batch_size=n_export,  # 646 帧一次性批量处理
)

# 批量前向传播（GPU 加速）
with torch.no_grad():
    output = body_model(
        betas=betas_tensor,           # 体型：共享，复制到每帧
        global_orient=global_orient,  # 全局旋转
        body_pose=body_pose,          # 身体姿态
        jaw_pose=jaw_pose,            # 下颌（全零）
        left_hand_pose=left_hand,     # 左手
        right_hand_pose=right_hand,   # 右手
        transl=transl,                # 全局位移
        return_verts=True,            # 返回顶点坐标
    )

# output.vertices: (646, 10475, 3)
# body_model.faces: (20908, 3)
```

**SMPL-X 模型内部计算流程**：

1. **Shape Blend Shape**：`betas` → 改变基础模板体型（高矮胖瘦）
2. **Pose Blend Shape**：`body_pose` → 关节旋转导致肌肉变形
3. **Linear Blend Skinning (LBS)**：将关节旋转应用到顶点，计算最终 3D 位置
4. **输出**：每帧 10,475 个顶点的 `(x, y, z)` 坐标

**显存消耗估算**（RTX 5070 12GB）：

| 操作 | 显存 |
|---|---|
| SMPL-X 模型权重 | ~200MB |
| 批量 646 帧顶点输出 | 646 × 10475 × 3 × 4B ≈ 81MB |
| 中间计算（LBS 矩阵等） | ~200MB |
| **总计** | ~500MB |

#### Stage 6：文件输出

输出 4 个文件，构成前端可直接加载的动画数据包：

```
outputs/mocap_Happy_v1/
├── faces.obj              # 面片索引（20,908 个三角面，所有帧共享）
├── vertices.bin           # 顶点数据（646 帧 × 10,475 顶点 × 3 坐标 × 4 字节）
├── animation_meta.json    # 动画元数据（帧数、帧率、时长、情感等）
└── manifest.json          # 任务清单（用于前端加载入口）
```

**vertices.bin 二进制格式**：
```
[frame0_v0_x, frame0_v0_y, frame0_v0_z,  # 帧 0, 顶点 0
 frame0_v1_x, frame0_v1_y, frame0_v1_z,  # 帧 0, 顶点 1
 ...
 frame645_v10474_x, frame645_v10474_y, frame645_v10474_z]  # 最后一帧

总字节数 = 646 × 10475 × 3 × 4 = 81,276,600 bytes ≈ 77.5 MB
```

**animation_meta.json**：
```json
{
  "emotion": "Happy",
  "version": "v1",
  "gender": "female",
  "frame_count": 646,
  "fps": 30.0,
  "duration_seconds": 21.53,
  "vertices_count": 10475,
  "faces_count": 20908,
  "source_npz": "Elena_Happy_v1_C3D_poses.npz",
  "frame_indices": [0, 4, 8, ..., 2580]
}
```

---

## 4. 前端动画播放技术

### 4.1 数据加载

```typescript
// useModelLoader.js — loadMoCapData()

// 1. 并行加载 3 个文件
const [facesText, binResponse, metaResponse] = await Promise.all([
  fetch(`${basePath}/faces.obj`),
  fetch(`${basePath}/vertices.bin`),
  fetch(`${basePath}/animation_meta.json`),
])

// 2. 解析二进制顶点数据
const binBuffer = await binResponse.arrayBuffer()
const verticesData = new Float32Array(binBuffer)  // 直接映射，零拷贝

// 3. 解析面片索引
const faceIndices = parseFacesFromObj(facesText)  // "f 1 2 3" → [0,1,2]

// 4. 创建第一帧的 BufferGeometry
const firstFrame = new Float32Array(verticesData.buffer, 0, nVertices * 3)
geometry.setAttribute('position', new THREE.BufferAttribute(firstFrame, 3))
geometry.setIndex(faceIndices)
geometry.computeVertexNormals()
```

### 4.2 逐帧动画播放

```typescript
// useAnimation.js — AnimationPlayer

class AnimationPlayer {
  tick(dt) {
    // 基于时间的帧推进（非固定帧步）
    const framesToAdvance = dt * fps * speed
    this.currentFrame += framesToAdvance
    if (this.currentFrame >= nFrames) {
      this.currentFrame = 0  // 循环播放
    }
    this.updateGeometry()
  }

  updateGeometry() {
    const frameIdx = Math.floor(this.currentFrame)
    const offset = frameIdx * nVertices * 3  // 定位到该帧在 buffer 中的起始位置

    // 零拷贝更新：直接替换 position buffer 的底层数据
    const src = verticesData.subarray(offset, offset + nVertices * 3)
    mesh.geometry.attributes.position.array.set(src)
    mesh.geometry.attributes.position.needsUpdate = true

    // 重新计算法线（上一帧的法线已失效）
    mesh.geometry.computeVertexNormals()
  }
}
```

### 4.3 性能分析

| 指标 | 30fps @ 646 帧 | 说明 |
|---|---|---|
| 顶点数据量 | 10,475 × 3 = 31,425 floats/帧 | ~126 KB/帧 |
| Buffer 更新 | `TypedArray.set()` | O(n)，~0.1ms |
| 法线重算 | `computeVertexNormals()` | O(n)，~0.5ms |
| 总帧耗时 | < 1ms | 远低于 33ms (30fps) 预算 |
| 显存占用 | ~78MB | 所有帧数据一次性加载 |

**技术要点**：所有动画帧的顶点数据预加载到一个 `Float32Array` 中，每帧切换时只改变 `position` attribute 的底层 buffer 引用，**不需要重建 Geometry 或 Mesh**。这是实现流畅动画的关键。

### 4.4 播放控制

```typescript
// 播放/暂停
player.play()   // playing = true
player.pause()  // playing = false

// 进度条拖动
player.seek(frameIndex)  // 跳转到任意帧

// 速度控制
player.setSpeed(0.5)  // 慢放
player.setSpeed(2.0)  // 快放
```

---

## 5. 端到端数据流总结

```
AMASS 数据库
    │
    ▼
Elena_Happy_v1_C3D_poses.npz     ← 120fps, SMPL+H 格式, 52 关节, 156 维
    │
    ├── poses:   (2582, 156)      ← 每帧的姿态参数
    ├── betas:   (16,)            ← 共享的体型参数
    ├── trans:   (2582, 3)        ← 每帧的位移
    └── gender:  'female'         ← 用于选择 SMPL-X 模型
    │
    ▼
[降采样] 120fps → 30fps          ← step=4, 2582帧 → 646帧
    │
    ▼
[SMPL+H → SMPL-X 映射]            ← jaw/eyes 填零
    │
    ▼
[SMPL-X 批量前向传播]              ← batch=646, GPU 加速
    │
    ├── vertices: (646, 10475, 3) ← 每帧的顶点坐标
    └── faces:    (20908, 3)      ← 所有帧共享
    │
    ▼
[文件输出]
    ├── vertices.bin              ← 77.5 MB 二进制顶点
    ├── faces.obj                 ← 三角面索引
    ├── animation_meta.json       ← 元数据
    └── manifest.json             ← 加载入口
    │
    ▼
[前端加载] Float32Array 零拷贝映射
    │
    ▼
[逐帧播放] position buffer 原地更新 + 法线重算
    │
    ▼
[WebGL 渲染] 60fps 流畅播放
```

---

## 6. 关键技术决策

| 决策 | 选择 | 原因 |
|---|---|---|
| 输出格式 | 二进制 `.bin` 而非逐帧 `.obj` | 单文件、零拷贝加载、体积小 100× |
| 帧选择 | 支持降采样 | 120fps 原始数据过大，30fps 满足视觉需求 |
| 关节映射 | SMPL+H→SMPL-X 直接映射 | 避免重新训练，面部填零可接受 |
| 批量推理 | 整批 forward pass | 比逐帧推理快 50× |
| 动画播放 | `TypedArray.set()` 原地更新 | 不需要重建 Mesh，延迟 <1ms |

## 7. 12 种情绪的完整列表

| 情绪 | 英文 | v1 帧数 | v2 帧数 | 30fps 帧数 |
|---|---|---|---|---|
| 害怕 | Afraid | ✅ | ✅ | — |
| 愤怒 | Angry | ✅ | ✅ | — |
| 烦躁 | Annoyed | ✅ | ✅ | — |
| 无聊 | Bored | ✅ | ✅ | — |
| 兴奋 | Excited | ✅ | ✅ | — |
| 开心 | Happy | 2,582 | ✅ | 646 |
| 痛苦 | Miserable | ✅ | ✅ | — |
| 中性 | Neutral | — | ✅ | — |
| 满意 | Pleased | ✅ | ✅ | — |
| 放松 | Relaxed | ✅ | ✅ | — |
| 悲伤 | Sad | — | ✅ | — |
| 满足 | Satisfied | ✅ | ✅ | — |
| 疲惫 | Tired | ✅ | ✅ | — |

---

## 8. 相关源码索引

| 文件 | 职责 |
|---|---|
| `project/backend/.../adapters/mocap_npz_input_adapter.py` | NPZ 加载 + 验证 + 元数据提取 |
| `project/backend/.../adapters/smplx_mocap_backend.py` | SMPL+H→SMPL-X 映射 + 批量推理 + 文件输出 |
| `project/model/src/smpl_model/app/mocap_export.py` | 独立 MoCap 导出命令行工具 |
| `project/model/src/smpl_model/domain/mesh_export.py` | AnimationExportResult 数据契约 |
| `project/frontend/src/composables/useModelLoader.js` | 前端加载 vertices.bin + faces.obj |
| `project/frontend/src/composables/useAnimation.js` | 逐帧动画播放引擎 |
