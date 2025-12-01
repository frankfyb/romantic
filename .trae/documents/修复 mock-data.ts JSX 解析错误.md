## 问题分析
- 报错来源：`src/constants/mock-data.ts:30` 在常量数组中直接写了 JSX：`icon: <Gift className="..." />`。
- 解析失败原因：文件扩展名是 `.ts`，JSX 只能在 `.tsx` 中被正确解析；因此 Turbopack 报 “Expected '>', got 'className'”。
- 影响范围：该模块被 `src/app/page.tsx` 引入并在浏览器与 SSR 两侧加载，导致首页 500。日志中的 `GET /@vite/client 404` 属于无关噪音。

## 解决方案（首选）
1. 将 `src/constants/mock-data.ts` 重命名为 `src/constants/mock-data.tsx`，使编译器按 JSX 语法解析。
2. 在文件顶部补充类型导入：`import type { ReactNode } from 'react'`，并将 `Tool` 类型中的 `icon: React.ReactNode` 改为 `icon: ReactNode`，避免直接引用 `React` 命名空间类型。
3. 保持现有 `lucide-react` 图标用法不变，其他模块（如 `ToolCard`）无需修改。

## 备选方案（保持 .ts）
- 若必须保持常量文件为 `.ts`：
  - 将 `Tool.icon` 改为字符串键（如 `'gift' | 'calendar' | ...'`）。
  - 在 `ToolCard` 内用一个图标映射表根据键渲染对应的 `lucide-react` 图标，并应用样式。
  - 这会涉及类型与渲染逻辑的同步修改，改动面更大，故不作为首选。

## 验证步骤
- 运行开发服务器并访问 `/`，确认不再出现解析错误与 500 状态。
- 视觉检查首页“精选工具”区域，图标正常显示，交互与样式未受影响。
- 查看编译日志，确保无新的类型或运行时警告。

## 风险与注意事项
- `.tsx` 改名是最小改动，符合 Next.js 默认配置；无需额外更改 `tsconfig.json`。
- 若项目缺少 `@types/react`，需要确保安装（Next.js 通常已包含）。

## 预期结果
- 编译通过，首页正常渲染；错误日志中关于 `mock-data.ts:30:84` 的解析错误消失。