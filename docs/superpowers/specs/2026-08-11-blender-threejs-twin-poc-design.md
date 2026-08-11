# Blender + MCP + Codex 产线孪生 POC 设计

## 目标

验证一条完整的本地工作流：Codex 通过 Blender MCP 驱动 Blender 生成一条低面数产线，产线包含一个异常工站和一个 AGV；Blender 导出带稳定对象 ID 的 GLB；独立的 `digital-twin-screen` Web 项目加载 GLB，并将模拟状态、选中检查器和告警处置绑定到对应对象。

POC 采用参考图的工业控制台风格：黑色底、青色线框与数据光效、橙红异常状态、中央三维场景、四周 KPI 与事件面板。参考图只作为视觉方向，不复制其中的飞机资产或具体版式。

## 工具职责

- Figma：只用于记录大屏栅格、面板层级、色彩变量和状态图例；不是运行时依赖。
- Blender + Blender MCP：开发期资产生成、对象命名、材质和 GLB 导出。MCP 通过本机 socket 连接 Blender，不暴露公网。
- Codex：创建 Blender Python 脚本、配置 MCP、实现 Web 端和验证命令。
- Three.js：浏览器运行时加载 GLB、相机控制、对象命中检测和状态材质更新。

## POC 流程

```text
Codex → Blender MCP → Blender 场景 → GLB
                                   ↓
              digital-twin-screen（Vue + Three.js）
                 ↑ 本地模拟遥测 / 告警状态机
```

Blender MCP 不进入浏览器运行链路。浏览器只依赖版本化的 GLB 和本地模拟数据，因此后续可把模拟器替换为 WebSocket/MQTT 网关而不改三维渲染层。

## POC 验收

1. Blender 中存在 `LINE_MAIN`、`STATION_01`、`AGV_01` 三个稳定对象 ID，并可通过 MCP 查询场景。
2. GLB 能在浏览器中加载，默认相机看到完整产线；AGV 沿路线移动，三维场景有非空像素和可操作相机。
3. 点击 `STATION_01` 显示资产检查器；触发故障后该对象变为橙红色，KPI 与事件面板同步变化。
4. 点击“确认处置”后，事件追加恢复记录，工站材质和状态恢复；重置可回到种子状态。
5. 运行 `npm run build` 和浏览器截图检查通过。

## 安全与边界

MCP 服务器使用本地 STDIO，Blender 插件 socket 只绑定 `localhost:9876`。POC 不启用 Poly Haven、Sketchfab、Hyper3D 或任何外部 API，不写入真实生产数据。Blender 插件具备执行 Python 的能力，安装来源和代码必须可追溯；无法验证来源时停止安装并报告。

POC 不做真实 CAD 精度、物理仿真、后端数据接入、历史持久化、权限、工单系统或完整 Figma 插件同步。
