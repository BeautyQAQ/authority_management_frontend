export interface SysMenu { id: number; parentId: number; name: string; perms: string; icon: string; path: string; component: string; type: number; statu: number; orderNum: number; builtin?: boolean; children: SysMenu[] }
export interface SysRole { id: number; name: string; code: string; remark: string; statu: number; menuIds: number[] }
export interface SysUser { id: number; username: string; password?: string; email: string; phone: string; statu: number; avatar: string; roles: SysRole[]; created?: string }

export interface ApiResult<T> { code: number; msg: string; data: T }
export interface Page<T> { records: T[]; total: number; current: number; size: number }
