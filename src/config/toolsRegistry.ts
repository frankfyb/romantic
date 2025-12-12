import { ToolKey } from '@/types/tool';
import WarmTextCardDisplayUI from '@/tools/warm-text-card/DisplayUI';
import { defaultConfig as warmTextDefaultConfig } from '@/tools/warm-text-card/config';
import TimeCapsuleDisplayUI from '@/tools/time-capsule/DisplayUI';
import TimeCapsuleConfigUI from '@/tools/time-capsule/ConfigUI';
import { defaultConfig as timeCapsuleDefaultConfig } from '@/tools/time-capsule/config';
import StarrySkyDisplayUI from '@/tools/starry-sky/DisplayUI';
import StarrySkyConfigUI from '@/tools/starry-sky/ConfigUI';
import { defaultConfig as starrySkyDefaultConfig } from '@/tools/starry-sky/config';
import MemoryBoxDisplayUI from '@/tools/memory-box/DisplayUI';
import MemoryBoxConfigUI from '@/tools/memory-box/ConfigUI';
import { defaultConfig as memoryBoxDefaultConfig } from '@/tools/memory-box/config';
import { DEFAULT_CONFIG as christmasDefaultConfig } from '@/tools/christmas-card/config';
import ChristmasCardDisplayUI from '@/tools/christmas-card/DisplayUI';
import ChristmasCardConfigUI from '@/tools/christmas-card/ConfigUI';

// ========================== 类型定义（强化类型约束）==========================
/**
 * 工具基础配置项类型
 */
interface ToolBasicConfig {
  // 工具显示名称
  name: string;
  // 工具可视化组件
  DisplayUI: React.ComponentType<any>;
  // 工具配置组件
  ConfigUI: React.ComponentType<any>;
  // 工具默认配置
  defaultConfig: Record<string, any>;
}

/**
 * 工具注册表类型（关联工具标识和完整配置）
 */
type ToolRegistry = Record<ToolKey, ToolBasicConfig>;

// ========================== 核心配置（聚合管理）==========================
/**
 * 工具核心配置注册表（所有工具配置统一管理）
 * 新增/删除工具只需修改这个对象，无需维护多个分散的注册表
 */
const toolRegistry: ToolRegistry = {
  'warm-text-card': {
    name: '温馨文字卡片',
    DisplayUI: WarmTextCardDisplayUI,
    ConfigUI: () => null, // 这个工具还没有配置UI
    defaultConfig: warmTextDefaultConfig,
  },
  'time-capsule': {
    name: '时光胶囊',
    DisplayUI: TimeCapsuleDisplayUI,
    ConfigUI: TimeCapsuleConfigUI,
    defaultConfig: timeCapsuleDefaultConfig,
  },
  'starry-sky': {
    name: '星河情书',
    DisplayUI: StarrySkyDisplayUI,
    ConfigUI: StarrySkyConfigUI,
    defaultConfig: starrySkyDefaultConfig,
  },
  'memory-box': {
    name: '回忆盲盒',
    DisplayUI: MemoryBoxDisplayUI,
    ConfigUI: MemoryBoxConfigUI,
    defaultConfig: memoryBoxDefaultConfig,
  },
  'christmas-card': {
    name: '圣诞贺卡',
    DisplayUI: ChristmasCardDisplayUI,
    ConfigUI: ChristmasCardConfigUI,
    defaultConfig: christmasDefaultConfig,
  },
};

// ========================== 通用工具函数（统一封装）==========================
/**
 * 通用获取工具配置的方法（基础封装，避免重复逻辑）
 */
const getToolConfig = <T extends keyof ToolBasicConfig>(
  toolKey: ToolKey,
  configKey: T
): ToolBasicConfig[T] => {
  const toolConfig = toolRegistry[toolKey];
  if (!toolConfig) {
    throw new Error(`未找到工具【${toolKey}】的基础配置`);
  }

  const targetConfig = toolConfig[configKey];
  if (!targetConfig) {
    throw new Error(`未找到工具【${toolKey}】的${configKey}配置`);
  }

  return targetConfig;
};

/**
 * 获取工具UI组件
 */
export const getToolUI = (toolKey: ToolKey) => {
  return getToolConfig(toolKey, 'DisplayUI');
};

/**
 * 获取工具配置UI组件
 */
export const getToolConfigUI = (toolKey: ToolKey) => {
  return getToolConfig(toolKey, 'ConfigUI');
};

/**
 * 获取工具默认配置
 */
export const getToolDefaultConfig = (toolKey: ToolKey) => {
  return getToolConfig(toolKey, 'defaultConfig');
};

/**
 * 获取工具显示名称
 */
export const getToolName = (toolKey: ToolKey) => {
  return getToolConfig(toolKey, 'name');
};

/**
 * 获取所有工具标识列表（方便遍历/下拉选择等场景）
 */
export const getToolKeyList = (): ToolKey[] => {
  return Object.keys(toolRegistry) as ToolKey[];
};

/**
 * 获取工具的完整配置（适用于需要同时使用多个配置项的场景）
 */
export const getToolFullConfig = (toolKey: ToolKey): ToolBasicConfig => {
  const toolConfig = toolRegistry[toolKey];
  if (!toolConfig) {
    throw new Error(`未找到工具【${toolKey}】的完整配置`);
  }
  // 返回深拷贝，避免外部修改影响原始配置
  return JSON.parse(JSON.stringify(toolConfig));
};

// ========================== 导出完整注册表（可选，供特殊场景使用）==========================
export { toolRegistry };
