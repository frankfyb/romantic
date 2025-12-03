import { ToolKey } from '@/types/tool';
import WarmTextCardDisplayUI from '@/tools/warm-text-card/DisplayUI';
import { defaultConfig as warmTextDefaultConfig } from '@/tools/warm-text-card/config';
import TimeCapsuleDisplayUI from '@/tools/time-capsule/DisplayUI';
import { defaultConfig as timeCapsuleDefaultConfig } from '@/tools/time-capsule/config';



// 工具UI映射（关联工具标识和可视化组件）
export const toolUIRegistry: Record<ToolKey, React.ComponentType<{
  config: Record<string, any>;
  isPreview: boolean;
  onConfigChange?: (config: Record<string, any>) => void;
}>> = {
  'warm-text-card': WarmTextCardDisplayUI,
  'time-capsule': TimeCapsuleDisplayUI,
};

// 获取工具UI组件（带校验）
export const getToolUI = (toolKey: ToolKey) => {
  const UIComponent = toolUIRegistry[toolKey];
  if (!UIComponent) {
    throw new Error(`未找到工具${toolKey}的UI组件`);
  }
  return UIComponent;
};

const toolDefaultConfigRegistry: Record<ToolKey, Record<string, any>> = {
  'warm-text-card': warmTextDefaultConfig,
  'time-capsule': timeCapsuleDefaultConfig,
};

export const getToolDefaultConfig = (toolKey: ToolKey) => {
  const cfg = toolDefaultConfigRegistry[toolKey];
  if (!cfg) {
    throw new Error(`未找到工具${toolKey}的默认配置`);
  }
  return cfg;
};

const toolNameRegistry: Record<ToolKey, string> = {
  'warm-text-card': '温馨文字卡片',
  'time-capsule': '时光胶囊',
};

export const getToolName = (toolKey: ToolKey) => {
  const name = toolNameRegistry[toolKey];
  if (!name) {
    throw new Error(`未找到工具${toolKey}的名称`);
  }
  return name;
};
