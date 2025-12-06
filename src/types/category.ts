// 分类基础信息
export interface Category {
  id: string;
  name: string;
  description?: string;
  sort: number;
  createdAt: string; // ISO格式日期字符串
  updatedAt: string; // ISO格式日期字符串
}

// 分类列表查询参数
export interface CategoryListQuery {
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// 分类列表响应数据
export interface CategoryListResponse {
  items: Category[];
  total: number;
  page: number;
  pageSize: number;
}

// 分类下的工具信息
export interface ToolInCategory {
  toolKey: string;
  toolName: string;
  description?: string;
  tag?: string;
}

// 分类下的工具列表查询参数
export interface CategoryToolsListQuery {
  categoryIdOrName: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'toolName' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// 分类下的工具列表响应数据
export interface CategoryToolsListResponse {
  items: ToolInCategory[];
  total: number;
  page: number;
  pageSize: number;
}