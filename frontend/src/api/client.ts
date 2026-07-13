/**
 * API Client — all backend requests go through here.
 * Uses the Vite proxy so relative URLs work in dev.
 */
import { translate } from '../i18n';

const errMsg = () => translate('error.requestFailed');

export interface User {
  id: number;
  basalt_id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryBrief {
  id: number;
  name: string;
  color: string;
}

export interface Category extends CategoryBrief {
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface UserBrief {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: CategoryBrief | null;
  creator: UserBrief | null;
  assignee: UserBrief | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  comment_count: number;
  attachment_count: number;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  page_size: number;
}

export interface Comment {
  id: number;
  ticket_id: number;
  user: UserBrief | null;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface Stats {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  total_users: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
}

// ── Auth ──

export async function fetchMe(): Promise<User> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export function loginUrl(): string {
  return '/api/auth/login';
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}

// ── Tickets ──

export async function fetchTickets(params: {
  page?: number;
  page_size?: number;
  status?: string;
  priority?: string;
  search?: string;
} = {}): Promise<TicketListResponse> {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.page_size) sp.set('page_size', String(params.page_size));
  if (params.status) sp.set('status', params.status);
  if (params.priority) sp.set('priority', params.priority);
  if (params.search) sp.set('search', params.search);
  const res = await fetch(`/api/tickets?${sp}`, { credentials: 'include' });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

export async function fetchTicket(id: number): Promise<Ticket> {
  const res = await fetch(`/api/tickets/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

export async function createTicket(data: {
  title: string;
  description: string;
  priority: string;
  category_id?: number | null;
}): Promise<Ticket> {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || errMsg());
  }
  return res.json();
}

export async function updateTicket(id: number, data: Record<string, unknown>): Promise<Ticket> {
  const res = await fetch(`/api/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || errMsg());
  }
  return res.json();
}

export async function assignTicket(id: number, assigneeId: number): Promise<Ticket> {
  const res = await fetch(`/api/tickets/${id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ assignee_id: assigneeId }),
  });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

export async function transferTicket(id: number, assigneeId: number, reason: string): Promise<Ticket> {
  const res = await fetch(`/api/tickets/${id}/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ assignee_id: assigneeId, reason }),
  });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

// ── Comments ──

export async function fetchComments(ticketId: number): Promise<Comment[]> {
  const res = await fetch(`/api/tickets/${ticketId}/comments`, { credentials: 'include' });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

export async function createComment(ticketId: number, content: string, isInternal: boolean = false): Promise<Comment> {
  const res = await fetch(`/api/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content, is_internal: isInternal }),
  });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

// ── Categories ──

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories', { credentials: 'include' });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

export async function createCategory(data: { name: string; description: string; color: string }): Promise<Category> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

export async function updateCategory(id: number, data: Record<string, unknown>): Promise<Category> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

// ── Admin ──

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/admin/users', { credentials: 'include' });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

export async function updateUserRole(userId: number, role: string): Promise<User> {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

export async function fetchHandlers(): Promise<User[]> {
  const res = await fetch('/api/admin/handlers', { credentials: 'include' });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch('/api/admin/stats', { credentials: 'include' });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

// ── Attachments ──

export async function uploadAttachment(ticketId: number, file: File): Promise<{ id: number; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error(errMsg());
  return res.json();
}

export function attachmentDownloadUrl(attachmentId: number): string {
  return `/api/attachments/${attachmentId}/download`;
}
