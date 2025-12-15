// 用户类型定义
export interface User {
  id: string;
  email?: string;
  username?: string;
  created_at?: string;
}

// 用户资料类型
export interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
}

// 其他类型定义可以在这里添加
