import { request } from '../request';

export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
}
export interface AndroidApp {
  id: number;
  packageName: string;
  appName: string;
  iconUrl?: string;
  latestReleaseId?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface AndroidRelease {
  id: number;
  appId: number;
  versionCode: number;
  versionName: string;
  buildNo: number;
  originalFilename: string;
  fileSize: number;
  sha256: string;
  signatureSha256?: string;
  minSdk?: string;
  targetSdk?: string;
  releaseNotes?: string;
  updateMode: string;
  status: string;
  downloadCount: number;
  createdAt: string;
}
export interface DashboardSummary {
  appCount: number;
  releaseCount: number;
  downloadCount: number;
  storageBytes: number;
}
export interface SystemMenu {
  id: number;
  parentId: number;
  menuType: '1' | '2';
  menuName: string;
  routeName: string;
  routePath: string;
  component: string;
  order: number;
  i18nKey: string;
  icon?: string;
  iconType: string;
  status: '0' | '1';
  hideInMenu: number;
  children?: SystemMenu[];
}
export interface ApkUploadMetadata {
  packageName: string;
  appName: string;
  iconDataUrl?: string;
  versionCode: number;
  versionName: string;
  filename: string;
  fileSize: number;
  sha256: string;
  minSdk?: string;
  targetSdk?: string;
  releaseNotes: string;
  updateMode: string;
}

export function fetchDashboardSummary() {
  return request<DashboardSummary>({ url: '/api/dashboard/summary' });
}
export function fetchApps(params: {
  page?: number;
  size?: number;
  appName?: string;
  packageName?: string;
  status?: string;
}) {
  return request<PageResult<AndroidApp>>({ url: '/api/apps', params });
}
export function fetchApp(id: number) {
  return request<AndroidApp>({ url: `/api/apps/${id}` });
}
export function fetchReleases(appId: number, params: { page?: number; size?: number; keyword?: string }) {
  return request<PageResult<AndroidRelease>>({ url: `/api/apps/${appId}/releases`, params });
}
export function deleteRelease(id: number) {
  return request<void>({ url: `/api/releases/${id}`, method: 'delete' });
}
export function deleteApp(id: number) {
  return request<void>({ url: `/api/apps/${id}`, method: 'delete' });
}
export function uploadApk(
  file: File,
  metadata: ApkUploadMetadata,
  onUploadProgress?: (event: { loaded: number; total?: number }) => void
) {
  const encodedMetadata = btoa(unescape(encodeURIComponent(JSON.stringify(metadata))));
  return request<AndroidRelease>({
    url: '/api/apps/upload',
    method: 'post',
    data: file,
    timeout: 5 * 60 * 1000,
    headers: { 'Content-Type': 'application/vnd.android.package-archive', 'X-Apk-Metadata': encodedMetadata },
    onUploadProgress
  });
}
export function fetchUsers(params: { page?: number; size?: number; keyword?: string }) {
  return request<PageResult<Record<string, any>>>({ url: '/api/system/users', params });
}
export function createUser(data: {
  username: string;
  displayName: string;
  email?: string;
  password: string;
  roleCodes: string[];
}) {
  return request<void>({ url: '/api/system/users', method: 'post', data });
}
export function updateUser(
  id: number,
  data: { displayName: string; email?: string; password?: string; roleCodes: string[]; status: string }
) {
  return request<void>({ url: `/api/system/users/${id}`, method: 'put', data });
}
export function deleteUser(id: number) {
  return request<void>({ url: `/api/system/users/${id}`, method: 'delete' });
}
export function fetchRoles() {
  return request<Record<string, any>[]>({ url: '/api/system/roles' });
}
export function fetchSystemMenus() {
  return request<SystemMenu[]>({ url: '/api/system/menus' });
}
export function updateSystemMenu(
  id: number,
  data: Pick<SystemMenu, 'menuName' | 'icon' | 'order' | 'status' | 'hideInMenu'>
) {
  return request<void>({ url: `/api/system/menus/${id}`, method: 'put', data });
}
export function deleteSystemMenu(id: number) {
  return request<void>({ url: `/api/system/menus/${id}`, method: 'delete' });
}
export function createRole(data: { code: string; name: string; description?: string }) {
  return request<void>({ url: '/api/system/roles', method: 'post', data });
}
export function updateRole(id: number, data: { name: string; description?: string; status: string }) {
  return request<void>({ url: `/api/system/roles/${id}`, method: 'put', data });
}
export function deleteRole(id: number) {
  return request<void>({ url: `/api/system/roles/${id}`, method: 'delete' });
}
export function fetchLogs(params: {
  page?: number;
  size?: number;
  keyword?: string;
  action?: string;
  resourceType?: string;
}) {
  return request<PageResult<Record<string, any>>>({ url: '/api/system/logs', params });
}
