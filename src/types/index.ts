import type { ReactNode, MouseEventHandler } from 'react';

// 通用按钮类型
export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  icon?: React.ElementType;
  disabled?: boolean;
}

// 卡片组件类型
export interface CardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

// 徽章组件类型
export interface BadgeProps {
  children: ReactNode;
  colorClass?: string;
}

// 弹窗组件类型
export interface ModalProps {
  isOpen: boolean;
  onClose: MouseEventHandler<HTMLButtonElement>;
  title: string;
  children: ReactNode;
}

// 导航项类型
export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

// 页面导航类型
export type PageKey = 'home' | 'tools' | 'profile';