# LLD：多源数据处理模块

## 0) 模块职责与边界

本模块负责把 **5 种不同类型的原始输入** 统一转化为标准 Observation，为后续 SMPL-X fitting 提供一致入口。

**做：**
- 图片、视频、3D scan、SMPL-X 参数文件、人体尺寸 → 统一 Observation
- 每种输入一个 Adapter，文件校验 + 格式转换
- 为后续 YOLO 检测、SMPLify-X fitting 预留插入位

**不做：**
- 不在此模块内生成 mesh
- 不在此模块内做 YOLO 推理（预留接口，当前 stub）
- 不在此模块内做 SMPL-X fitting（留给 layer 2）
- 不复现 SMPL 论文训练过程
- 不把真实数据、模型权重、obj/pkl/npz 提交 Git

## 1) 3 层架构

```text
┌──────────────────────────────────────────────────────┐
│                                                      │
│  层 3: SMPL-X Backend（已有，不改）                    │
│  betas + theta → vertices + faces + mesh              │
│  [smplx_export.py, smplx_mocap_backend.py]            │
│                                                      │
└──────────────────────────────────────────────────────┘
                         ↑
                  SMPL-X params
                         ↑
┌──────────────────────────────────────────────────────┐
│                                                      │
│  层 2: Fitting（预留，全 stub）                        │
│  Observation → SMPL-X params                          │
│  [project/model/.../fitting/smplx_fitting_backend.py] │
│  4 条路线接口 + TODO                                   │
│                                                      │
└──────────────────────────────────────────────────────┘
                         ↑
                   Observation
                         ↑
┌──────────────────────────────────────────────────────┐
│                                                      │
│  层 1: 多源输入（Adapter → Unified Observation）       │
│                                                      │
│  ImageAdapter  VideoAdapter  ScanAdapter              │
│  ParamAdapter  MeasurementAdapter                     │
│       │             │            │                    │
│       └─────────────┼────────────┘                    │
│                     ▼                                 │
│  BodyObservation / BodySequenceObservation            │
│  ScanObservation / SMPLXParamInput                    │
│  [domain/observations.py]                             │
│                                                      │
│  职责：校验输入 → 转成统一 Observation                   │
│  不做：YOLO 检测、关键点提取、mesh 生成                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

| 层 | 一句话 |
|---|---|
| 层 1 | 不管什么格式进来，都给统一的 Observation |
| 层 2 | 不管 Observation 从哪来的，都转成 SMPL-X 参数（预留） |
| 层 3 | 给 SMPL-X 参数就出 mesh（已有） |

## 2) 输入类型与 Adapter

### 2.1 5 种输入

| 输入类型 | source_type | 输入格式 | Adapter |
|---|---|---|---|
| 图片 | `image` | .jpg / .png | ImageInputAdapter |
| 视频 | `video` | .mp4 / .avi | VideoInputAdapter |
| 3D scan | `scan` | .obj / .ply / 点云 | ScanInputAdapter |
| SMPL-X 参数 | `smplx-param` | .npz / .pkl | SMPLXParamInputAdapter |
| 人体尺寸 | `measurement` | json / dict | MeasurementInputAdapter |

### 2.2 Adapter 统一契约

每个 Adapter 实现 `InputAdapter` 协议（已有 `project/backend/.../ports/input_port.py`）：

```text
load(input_path) → BodyInput
```

当前阶段 Adapter 的 `load()` 返回的 `BodyInput` 的 `metadata` 中包含序列化后的 Observation 数据。后续 Fitting 层可以直接从 `metadata` 中读取 Observation 字段。

### 2.3 各 Adapter 核心流程

**ImageInputAdapter:**
```text
image_path → 校验文件存在 + 后缀 → 读取图片宽高(如果OpenCV可用) →
  BodyObservation(source_type=image, image_path=..., image_size=(w,h)) →
  BodyInput(metadata={observation: ...})
```

**VideoInputAdapter:**
```text
video_path → 校验文件存在 + 后缀 → 读取帧数/fps(如果OpenCV可用) →
  BodySequenceObservation(source_type=video, video_path=..., fps=..., frame_count=...) →
  BodyInput(metadata={observation: ...})
```

**ScanInputAdapter:**
```text
scan_path(.obj/.ply) → 校验文件存在 + 后缀 → 基础顶点/面片统计(如果trimesh可用) →
  ScanObservation(scan_path=..., format=..., vertex_count=...) →
  BodyInput(metadata={observation: ...})
```

**SMPLXParamInputAdapter:**
```text
npz/pkl_path → 校验文件存在 → 读取 beta/theta 等参数 →
  SMPLXParamInput(betas=..., body_pose=..., ...) →
  BodyInput(metadata={observation: ...})
```

**MeasurementInputAdapter:**
```text
json_path / dict → 校验字段 → 结构化为身高/体重/肩宽/腿长等 →
  BodyObservation(source_type=measurement, measurements={...}) →
  BodyInput(metadata={observation: ...})
```

## 3) Unified Observation 类型

### 3.1 BodyObservation（单帧人体观测）

```text
BodyObservation
- source_type: str               # image | video_frame | measurement
- image_path: str | None          # 图片路径
- video_path: str | None          # 来源视频路径
- frame_index: int | None         # 视频帧序号
- image_size: (int, int) | None   # 图像宽高
- bbox: [x, y, w, h] | None      # 人体检测框（后续 YOLO 产出）
- keypoints_2d: list | None       # 2D 关键点 [[x,y,conf], ...]
- measurements: dict | None       # 人体尺寸 {height_cm, weight_kg, ...}
- metadata: dict                  # 扩展字段
```

### 3.2 BodySequenceObservation（连续动作观测）

```text
BodySequenceObservation
- source_type: str               # video
- video_path: str
- fps: float
- frame_count: int
- duration_seconds: float
- frame_observations: list[BodyObservation]  # 每帧的观测
- tracking_id: str | None        # 跟踪 ID
- metadata: dict
```

### 3.3 ScanObservation（3D scan 观测）

```text
ScanObservation
- scan_path: str
- texture_path: str | None
- format: str                    # obj / ply / pointcloud
- vertex_count: int | None
- face_count: int | None
- coordinate_system: str         # y-up / z-up
- scale: float                   # 尺度因子
- metadata: dict
```

### 3.4 SMPLXParamInput（已有 SMPL-X 参数）

```text
SMPLXParamInput
- source_type: str               # smplx-param
- param_path: str
- gender: str
- betas: list[float]             # 体型参数
- body_pose: list[float] | None  # 身体姿态
- global_orient: list[float] | None
- transl: list[float] | None
- left_hand_pose: list[float] | None
- right_hand_pose: list[float] | None
- expression: list[float] | None
- jaw_pose: list[float] | None
- metadata: dict
```

## 4) Fitting 层（层 2，全 stub）

当前只定义接口和 4 条路线，不做实现。

### 4.1 4 条路线

| 路线 | 输入 | 算法 | 状态 |
|---|---|---|---|
| A | 2D keypoints | SMPLify-X 优化拟合 | TODO |
| B | 图片/视频 | HMR / VIBE / PARE / CLIFF | TODO |
| C | 3D scan | ICP + scan-to-SMPL-X fitting | TODO |
| D | 已有 npz/pkl 参数 | 直接透传 | TODO |

### 4.2 统一接口

```text
fit(observation) → SMPL-X params dict
params = {
    "betas": [...],
    "body_pose": [...],
    "global_orient": [...],
    "transl": [...],
    ...
}
```

当前所有路线返回 mock 参数（全零或从 SMPL-X 默认值）。

## 5) YOLO 在本系统中的作用

**YOLO 不属于此模块的当前实现范围，但预留了插入位。**

1. **YOLO Detection：** 可以做人检测，输出 bbox `[x, y, w, h]`。结果填入 `BodyObservation.bbox`。
2. **YOLO-Pose：** 可以做 2D 人体姿态关键点检测，输出 `[[x, y, confidence], ...]`（COCO 17 点或更多）。结果填入 `BodyObservation.keypoints_2d`。
3. **YOLO 用于视频逐帧姿态检查：** 对视频逐帧跑 YOLO-Pose，检查连续帧之间关键点是否剧烈跳动。如果有明显跳变，可以标记该帧置信度低或丢弃。
4. **YOLO 不能直接输出 SMPL-X 的 beta / theta：** YOLO 输出的只是 2D 像素坐标和置信度值，不是 SMPL-X 的体型参数或 3D 姿态参数。
5. **YOLO 输出需要经过 Fitting 层才能转成 SMPL-X 参数：** keypoints_2d → SMPLify-X 优化 → betas + body_pose → SMPL-X Backend → mesh。这个流程在当前架构中是层 1（YOLO 产出 keypoints）→ 层 2（SMPLify-X fitting）→ 层 3（mesh 生成）。
6. **如果目标是连续平滑动作：** 仅做逐帧独立 YOLO 检测是不够的。需要增加 tracking（保证同一个人 ID 连续）、temporal smoothing（对 keypoints 做时间序列平滑）、pose prior（限制关节旋转角度在人体合理范围内）、joint limit（防止关节扭到不可能的角度）、IK 或连续性约束。

## 6) 视频输入与平滑动作生成

**单张图片只能生成静态 mesh。** 只有视频输入才能生成连续动作。

### 6.1 完整视频流程

```text
video (.mp4)
  ↓
OpenCV 抽帧 → frame_0000.jpg, frame_0001.jpg, ...
  ↓
YOLO Detection → bbox per frame
  ↓
YOLO-Pose → 2D keypoints per frame
  ↓
Tracking → 保证同一 person ID 连续
  ↓
低置信度 keypoints 过滤 → 丢弃 conf < threshold 的点
  ↓
Temporal Smoothing → 对 keypoints 序列做平滑（如 Savitzky-Golay 或 Kalman）
  ↓
SMPL-X Fitting → 每帧 keypoints → SMPL-X params
  ↓
Pose Sequence Smoothing → 对 body_pose 序列做平滑
  ↓
连续 mesh 输出 / animation（可接入已有 MoCap 动画播放器）
```

### 6.2 必须做时间平滑和连续性约束

**逐帧独立拟合会抖动。** 原因是：
- YOLO 每帧检测结果有微小漂移
- SMPLify-X 优化可能收敛到不同的局部最优
- 没有帧间约束时，关节角度可能突变

**解决方向：**
1. **Keypoints temporal smoothing：** 在输入 Fitting 之前，对连续帧的 2D keypoints 做平滑（Kalman filter、Savitzky-Golay、EMA）。
2. **Pose prior：** 在 SMPLify-X 优化中加入 pose prior（如 Gaussian Mixture Model over poses、VPoser），使拟合结果保持在人体自然姿态流形上。
3. **Temporal consistency loss：** 在优化目标中加入相邻帧的 pose 差异惩罚项。
4. **Joint limit constraints：** 关节旋转角度不能超过人体解剖学合理范围。
5. **Video-based methods：** 使用 VIBE、MEVA、GLAMR 等考虑时序的视频级 HMR 方法，而非逐帧独立方法。

### 6.3 四肢自然移动

要让四肢自然移动，除了上述时间平滑外，还需要：
- **IK（Inverse Kinematics）：** 如果已知手/脚目标位置，IK 能生成自然的四肢姿态
- **Grounded contact：** 走路时脚应该接触地面、不滑动
- **姿态先验（pose prior）：** 训练好的 pose prior（如 VPoser）限制姿态在自然范围内

## 7) 当前阶段边界

### 7.1 当前做

- 搭建 3 层多源输入处理架构
- 统一不同输入的数据格式（4 种 Observation dataclass）
- 实现 5 个 Adapter 的文件校验和格式转换
- Fitting 层 4 条路线的接口预留
- Demo 脚本验证链路

### 7.2 当前不做

- 不复现 SMPL 论文训练过程
- 不重新训练 shape space / pose blend shapes
- 不直接下载大型数据到 Git
- 不下载 YOLO / HMR / SMPLify-X 模型权重
- 不承诺 YOLO 能直接生成 mesh
- 不承诺单张图片能生成医疗级精确人体
- 不做商业/医疗合规判断

## 8) 工程目录

```text
project/backend/src/smpl_service/modeling/
├── domain/
│   ├── contracts.py           # BodyInput, ModelResult, Manifest（已有）
│   └── observations.py        # Observation 类型（新建）
├── ports/
│   └── input_port.py           # InputAdapter 协议（已有）
├── adapters/
│   ├── mock_input_adapter.py        # 已有
│   ├── dataset_obj_input_adapter.py # 已有
│   ├── mocap_npz_input_adapter.py   # 已有
│   ├── image_input_adapter.py       # 新建
│   ├── video_input_adapter.py       # 新建
│   ├── scan_input_adapter.py        # 新建
│   ├── smplx_param_input_adapter.py # 新建
│   └── measurement_input_adapter.py # 新建
├── app/
│   └── pipeline.py            # 已有，后续可扩展路由
└── entrypoints/
    └── cli.py                 # 已有

project/model/src/smpl_model/
└── app/
    └── fitting/
        ├── __init__.py
        └── smplx_fitting_backend.py  # 新建，全 stub

project/scripts/
└── demo_all_inputs.py         # 新建，统一 demo 脚本
```

## 9) Failure Modes

- 图片/视频文件不存在或无法解码。
- 3D scan 格式不支持（非 obj/ply）。
- SMPL-X 参数文件格式不正确（缺少必要字段）。
- 人体尺寸 JSON 字段不完整。
- 视频抽帧失败（编码格式不兼容）。
- Fitting 结果异常（后续，当前不在范围内）。

## 10) 测试策略与 DoD

- 所有 Observation dataclass 可正常导入和序列化。
- 5 个 Adapter 可导入，mock 输入能返回合法的 Observation。
- 文件不存在时 Adapter 抛出明确错误。
- Demo 脚本可独立运行，输出 JSON。
- 不破坏现有 16 个 backend 测试和 19 个 model 测试。
- 所有新建文件不提交真实数据、模型权重、obj/pkl/npz。

## References

- HLD：`documents/02-design/01-hld-smpl-service.md`
- LLD M0：`documents/02-design/02-lld-foundations-m0-overview.md`
- LLD M1：`documents/02-design/03-lld-data-m1-input-adapters.md`
- LLD M5：`documents/02-design/07-lld-model-m5-smpl-module.md`
- SMPL 论文笔记：`documents/99-knowledge-base/01-smpl-paper-notes.md`
- 数据集笔记：`documents/99-knowledge-base/02-dataset-notes.md`
- FAQ：`documents/03-faq/README.md`
