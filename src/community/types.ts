export interface CommunityPage<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number }
export interface CommunityUser { id: number; username: string; alias: string; email: string; avatar: string | null; status: boolean; active: boolean; bio?: string; createTime: string | null }
export type PostStatus = 'PUBLISHED' | 'PENDING' | 'HIDDEN'
export interface CommunityPost { id: number; title: string; username: string; status: PostStatus; top: boolean; essence: boolean; comments: number; collects: number; likes: number; createTime: string; modifyTime: string; content?: string; version?: number; tags?: (string | { id: number; name: string })[]; moderationReason?: string }
export interface CommunityComment { id: number; postId: number; postTitle: string; parentId: number | null; username: string; content: string; visible: boolean; createdAt: string }
export interface AuditEntry { id: number; actor: string; action: string; resource: string; resourceId: number; detail: string; createdAt: string }
export type CatalogResource = 'billboards' | 'tips' | 'promotions' | 'tags'
export interface CatalogItem { id: number; content?: string; visible?: boolean; createTime?: string; author?: string; enabled?: boolean; title?: string; link?: string; description?: string; name?: string; topicCount?: number }
export const formatTime = (value?: string | null) => value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—'
export const postStatusLabel: Record<PostStatus, string> = { PUBLISHED: '已发布', PENDING: '待审核', HIDDEN: '已下架' }
