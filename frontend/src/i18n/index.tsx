import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

export type Locale = 'zh' | 'en';

type Dict = Record<string, string>;

const zh: Dict = {
  // ── common ──
  'common.loading': '加载中…',
  'common.initializing': '初始化中…',
  'common.logout': '退出登录',
  'common.searchPlaceholder': '快速搜索…',
  'common.account': '当前账户',
  'error.requestFailed': '请求失败',

  // ── sidebar nav ──
  'nav.dashboard': '工作台',
  'nav.tickets': '工单列表',
  'nav.newTicket': '创建工单',
  'nav.admin': '管理概览',
  'nav.categories': '分类管理',
  'nav.users': '用户管理',

  // ── shared status / priority / role ──
  'status.new': '新建',
  'status.assigned': '已分配',
  'status.in_progress': '处理中',
  'status.pending_user': '待用户回复',
  'status.resolved': '已解决',
  'status.closed': '已关闭',
  'status.cancelled': '已取消',

  'priority.low': '低',
  'priority.medium': '中',
  'priority.high': '高',
  'priority.urgent': '紧急',
  'priority.low.note': '不影响工作',
  'priority.medium.note': '有一定影响',
  'priority.high.note': '严重影响',
  'priority.urgent.note': '需要立即处理',

  'role.user': '普通用户',
  'role.handler': '处理人员',
  'role.lead': '组长',
  'role.admin': '管理员',

  // ── login ──
  'login.tagline': '工单运营平台',
  'login.heroKicker': 'Ticket Operations',
  'login.heroTitle': '清晰、稳定、可追踪的工单工作台',
  'login.heroDesc':
    '按控制台产品的方式组织工单、分类、处理人和状态流转。界面保持轻量，重点信息更容易扫描，长时间使用也不累。',
  'login.feature.thinCards': '细边线卡片',
  'login.feature.denseList': '高密度列表',
  'login.feature.unifiedStatus': '统一状态标签',
  'login.title': '登录',
  'login.subtitle': '使用 BasaltPass 账号进入 IssueTick',
  'login.button': '登录 IssueTick',
  'login.securedBy': '由 BasaltPass 提供安全认证',
  'login.error.invalid_state': '登录状态校验失败，请重新点击登录。',
  'login.error.token_exchange_failed': '登录凭证交换失败，请检查 BasaltPass 客户端配置。',
  'login.error.userinfo_failed': '获取用户信息失败，请确认 BasaltPass 用户信息接口可用。',
  'login.error.token_exchange_failed_status':
    '登录凭证交换失败（HTTP {status}），请检查 BasaltPass OAuth 客户端密钥和回调地址。',
  'login.error.userinfo_failed_status':
    '获取用户信息失败（HTTP {status}），请检查 BasaltPass 用户会话与权限。',
  'login.error.fallback': '登录失败：{code}',

  // ── dashboard ──
  'dashboard.greeting.morning': '早上好',
  'dashboard.greeting.afternoon': '下午好',
  'dashboard.greeting.evening': '晚上好',
  'dashboard.welcome': '欢迎回到 IssueTick 工单管理控制台',
  'dashboard.createTicket': '创建工单',
  'dashboard.stat.all': '全部工单',
  'dashboard.stat.open': '进行中',
  'dashboard.stat.resolved': '已解决',
  'dashboard.stat.users': '用户数',
  'dashboard.recent': '最近工单',
  'dashboard.viewAll': '查看全部 →',
  'dashboard.empty.title': '暂无工单',
  'dashboard.empty.desc': '点击右上角按钮创建您的第一个工单',

  // ── ticket list ──
  'tickets.title': '工单列表',
  'tickets.count': '共 {total} 条工单',
  'tickets.searchPlaceholder': '搜索工单标题或编号…',
  'tickets.search': '搜索',
  'tickets.empty.title': '没有找到工单',
  'tickets.empty.desc': '尝试调整筛选条件，或创建一个新工单',
  'tickets.col.ticket': '工单',
  'tickets.col.status': '状态',
  'tickets.col.priority': '优先级',
  'tickets.col.category': '分类',
  'tickets.col.assignee': '处理人',
  'tickets.col.created': '创建时间',
  'tickets.unassigned': '未分配',
  'tickets.page': '第 {page} / {total} 页',
  'tickets.prev': '上一页',
  'tickets.next': '下一页',
  'filter.status.all': '全部状态',
  'filter.priority.all': '全部优先级',

  // ── create ticket ──
  'create.back': '返回',
  'create.title': '创建工单',
  'create.subtitle': '填写以下信息提交您的问题或请求',
  'create.error.titleRequired': '请输入工单标题',
  'create.error.failed': '创建失败',
  'create.field.title': '标题',
  'create.field.titlePlaceholder': '简要描述您的问题',
  'create.field.description': '详细描述',
  'create.field.descriptionPlaceholder': '请详细说明问题的现象、影响范围、复现步骤等…',
  'create.field.priority': '优先级',
  'create.field.category': '分类',
  'create.field.categoryPlaceholder': '选择分类（可选）',
  'create.submit': '提交工单',
  'create.cancel': '取消',

  // ── ticket detail ──
  'detail.back': '返回列表',
  'detail.assign': '分配处理人',
  'detail.reassign': '重新分配',
  'detail.description': '问题描述',
  'detail.noDescription': '无描述',
  'detail.action.start': '开始处理',
  'detail.action.pending': '等待用户回复',
  'detail.action.resolve': '标记为已解决',
  'detail.action.cancel': '取消工单',
  'detail.action.close': '确认关闭',
  'detail.action.reopen': '重新打开',
  'detail.discussion': '讨论记录（{n}）',
  'detail.noDiscussion': '暂无讨论',
  'detail.internalNote': '内部备注',
  'detail.internalNoteHint': '内部备注（用户不可见）',
  'detail.replyPlaceholder': '输入回复内容…',
  'detail.sendReply': '发送回复',
  'detail.info': '工单信息',
  'detail.info.creator': '提交人',
  'detail.info.assignee': '处理人',
  'detail.info.category': '分类',
  'detail.info.created': '创建时间',
  'detail.info.resolved': '解决时间',
  'detail.info.closed': '关闭时间',
  'detail.unassigned': '未分配',
  'detail.uncategorized': '未分类',
  'detail.statusUpdateFailed': '状态更新失败',
  'detail.modal.assignTitle': '分配处理人',
  'detail.modal.selectHandler': '选择处理人',
  'detail.modal.selectHandlerPlaceholder': '选择一个处理人',
  'detail.modal.confirmAssign': '确认分配',

  // ── admin dashboard ──
  'admin.title': '管理面板',
  'admin.subtitle': '系统运行概览',
  'admin.stat.all': '全部工单',
  'admin.stat.open': '进行中',
  'admin.stat.resolved': '已解决',
  'admin.stat.closed': '已关闭',
  'admin.stat.users': '注册用户',
  'admin.byStatus': '按状态分布',
  'admin.byPriority': '按优先级分布',

  // ── categories ──
  'categories.title': '分类管理',
  'categories.subtitle': '管理工单分类标签',
  'categories.new': '新增分类',
  'categories.empty': '暂无分类，点击右上角新增',
  'categories.col.color': '颜色',
  'categories.col.name': '名称',
  'categories.col.description': '描述',
  'categories.col.status': '状态',
  'categories.col.actions': '操作',
  'categories.enabled': '启用',
  'categories.disabled': '禁用',
  'categories.modal.title': '新增分类',
  'categories.field.name': '分类名称',
  'categories.field.namePlaceholder': '如：技术支持',
  'categories.field.description': '描述',
  'categories.field.descriptionPlaceholder': '分类说明（可选）',
  'categories.field.color': '标签颜色',
  'categories.create': '创建分类',

  // ── users ──
  'users.title': '用户管理',
  'users.subtitle': '管理系统用户及其角色权限',
  'users.col.user': '用户',
  'users.col.email': '邮箱',
  'users.col.role': '角色',
  'users.col.registered': '注册时间',
  'users.col.actions': '操作',
  'users.editRole': '修改角色',
  'users.modal.title': '修改用户角色',
  'users.field.newRole': '新角色',
  'users.confirm': '确认修改',
};

const en: Dict = {
  // ── common ──
  'common.loading': 'Loading…',
  'common.initializing': 'Initializing…',
  'common.logout': 'Log Out',
  'common.searchPlaceholder': 'Quick search…',
  'common.account': 'Current Account',
  'error.requestFailed': 'Request failed',

  // ── sidebar nav ──
  'nav.dashboard': 'Dashboard',
  'nav.tickets': 'Tickets',
  'nav.newTicket': 'New Ticket',
  'nav.admin': 'Admin Overview',
  'nav.categories': 'Categories',
  'nav.users': 'Users',

  // ── shared status / priority / role ──
  'status.new': 'New',
  'status.assigned': 'Assigned',
  'status.in_progress': 'In Progress',
  'status.pending_user': 'Pending User',
  'status.resolved': 'Resolved',
  'status.closed': 'Closed',
  'status.cancelled': 'Cancelled',

  'priority.low': 'Low',
  'priority.medium': 'Medium',
  'priority.high': 'High',
  'priority.urgent': 'Urgent',
  'priority.low.note': 'No impact',
  'priority.medium.note': 'Minor impact',
  'priority.high.note': 'Major impact',
  'priority.urgent.note': 'Needs immediate attention',

  'role.user': 'Regular User',
  'role.handler': 'Handler',
  'role.lead': 'Team Lead',
  'role.admin': 'Admin',

  // ── login ──
  'login.tagline': 'Support Operations',
  'login.heroKicker': 'Ticket Operations',
  'login.heroTitle': 'A clear, stable, and trackable ticket workspace',
  'login.heroDesc':
    'Organize tickets, categories, handlers, and status flows the way a console product should. The interface stays lightweight, key info is easy to scan, and comfortable for long sessions.',
  'login.feature.thinCards': 'Thin-border cards',
  'login.feature.denseList': 'High-density lists',
  'login.feature.unifiedStatus': 'Unified status tags',
  'login.title': 'Sign In',
  'login.subtitle': 'Sign in to IssueTick with your BasaltPass account',
  'login.button': 'Sign in to IssueTick',
  'login.securedBy': 'Secured by BasaltPass',
  'login.error.invalid_state': 'Login state validation failed. Please click sign in again.',
  'login.error.token_exchange_failed': 'Token exchange failed. Please check the BasaltPass client configuration.',
  'login.error.userinfo_failed': 'Failed to retrieve user info. Please verify the BasaltPass user info endpoint is available.',
  'login.error.token_exchange_failed_status':
    'Token exchange failed (HTTP {status}). Please check the BasaltPass OAuth client secret and redirect URI.',
  'login.error.userinfo_failed_status':
    'Failed to retrieve user info (HTTP {status}). Please check the BasaltPass user session and permissions.',
  'login.error.fallback': 'Login failed: {code}',

  // ── dashboard ──
  'dashboard.greeting.morning': 'Good morning',
  'dashboard.greeting.afternoon': 'Good afternoon',
  'dashboard.greeting.evening': 'Good evening',
  'dashboard.welcome': 'Welcome back to the IssueTick ticket console',
  'dashboard.createTicket': 'New Ticket',
  'dashboard.stat.all': 'All Tickets',
  'dashboard.stat.open': 'In Progress',
  'dashboard.stat.resolved': 'Resolved',
  'dashboard.stat.users': 'Users',
  'dashboard.recent': 'Recent Tickets',
  'dashboard.viewAll': 'View All →',
  'dashboard.empty.title': 'No tickets yet',
  'dashboard.empty.desc': 'Click the button in the top-right to create your first ticket',

  // ── ticket list ──
  'tickets.title': 'Tickets',
  'tickets.count': '{total} tickets in total',
  'tickets.searchPlaceholder': 'Search by title or number…',
  'tickets.search': 'Search',
  'tickets.empty.title': 'No tickets found',
  'tickets.empty.desc': 'Try adjusting filters, or create a new ticket',
  'tickets.col.ticket': 'Ticket',
  'tickets.col.status': 'Status',
  'tickets.col.priority': 'Priority',
  'tickets.col.category': 'Category',
  'tickets.col.assignee': 'Assignee',
  'tickets.col.created': 'Created',
  'tickets.unassigned': 'Unassigned',
  'tickets.page': 'Page {page} of {total}',
  'tickets.prev': 'Previous',
  'tickets.next': 'Next',
  'filter.status.all': 'All Statuses',
  'filter.priority.all': 'All Priorities',

  // ── create ticket ──
  'create.back': 'Back',
  'create.title': 'Create Ticket',
  'create.subtitle': 'Fill in the details below to submit your issue or request',
  'create.error.titleRequired': 'Please enter a ticket title',
  'create.error.failed': 'Failed to create',
  'create.field.title': 'Title',
  'create.field.titlePlaceholder': 'Briefly describe your issue',
  'create.field.description': 'Description',
  'create.field.descriptionPlaceholder': 'Describe the symptoms, impact, and steps to reproduce…',
  'create.field.priority': 'Priority',
  'create.field.category': 'Category',
  'create.field.categoryPlaceholder': 'Select a category (optional)',
  'create.submit': 'Submit Ticket',
  'create.cancel': 'Cancel',

  // ── ticket detail ──
  'detail.back': 'Back to List',
  'detail.assign': 'Assign Handler',
  'detail.reassign': 'Reassign',
  'detail.description': 'Description',
  'detail.noDescription': 'No description',
  'detail.action.start': 'Start Processing',
  'detail.action.pending': 'Wait for User',
  'detail.action.resolve': 'Mark Resolved',
  'detail.action.cancel': 'Cancel Ticket',
  'detail.action.close': 'Confirm Close',
  'detail.action.reopen': 'Reopen',
  'detail.discussion': 'Discussion ({n})',
  'detail.noDiscussion': 'No discussion yet',
  'detail.internalNote': 'Internal Note',
  'detail.internalNoteHint': 'Internal note (hidden from user)',
  'detail.replyPlaceholder': 'Type your reply…',
  'detail.sendReply': 'Send Reply',
  'detail.info': 'Ticket Info',
  'detail.info.creator': 'Submitted By',
  'detail.info.assignee': 'Assignee',
  'detail.info.category': 'Category',
  'detail.info.created': 'Created',
  'detail.info.resolved': 'Resolved',
  'detail.info.closed': 'Closed',
  'detail.unassigned': 'Unassigned',
  'detail.uncategorized': 'Uncategorized',
  'detail.statusUpdateFailed': 'Failed to update status',
  'detail.modal.assignTitle': 'Assign Handler',
  'detail.modal.selectHandler': 'Select Handler',
  'detail.modal.selectHandlerPlaceholder': 'Select a handler',
  'detail.modal.confirmAssign': 'Confirm Assignment',

  // ── admin dashboard ──
  'admin.title': 'Admin Panel',
  'admin.subtitle': 'System overview',
  'admin.stat.all': 'All Tickets',
  'admin.stat.open': 'In Progress',
  'admin.stat.resolved': 'Resolved',
  'admin.stat.closed': 'Closed',
  'admin.stat.users': 'Registered Users',
  'admin.byStatus': 'By Status',
  'admin.byPriority': 'By Priority',

  // ── categories ──
  'categories.title': 'Categories',
  'categories.subtitle': 'Manage ticket category tags',
  'categories.new': 'New Category',
  'categories.empty': 'No categories yet. Click the top-right to add one.',
  'categories.col.color': 'Color',
  'categories.col.name': 'Name',
  'categories.col.description': 'Description',
  'categories.col.status': 'Status',
  'categories.col.actions': 'Actions',
  'categories.enabled': 'Enabled',
  'categories.disabled': 'Disabled',
  'categories.modal.title': 'New Category',
  'categories.field.name': 'Category Name',
  'categories.field.namePlaceholder': 'e.g. Technical Support',
  'categories.field.description': 'Description',
  'categories.field.descriptionPlaceholder': 'Category description (optional)',
  'categories.field.color': 'Tag Color',
  'categories.create': 'Create Category',

  // ── users ──
  'users.title': 'Users',
  'users.subtitle': 'Manage users and their role permissions',
  'users.col.user': 'User',
  'users.col.email': 'Email',
  'users.col.role': 'Role',
  'users.col.registered': 'Registered',
  'users.col.actions': 'Actions',
  'users.editRole': 'Edit Role',
  'users.modal.title': 'Edit User Role',
  'users.field.newRole': 'New Role',
  'users.confirm': 'Confirm',
};

const dictionaries: Record<Locale, Dict> = { zh, en };

const STORAGE_KEY = 'issuetick.locale';

export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'zh';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === 'en' ? 'en' : 'zh';
}

export function translate(
  key: string,
  params?: TranslateParams,
  locale: Locale = getLocale(),
): string {
  const dict = dictionaries[locale] ?? dictionaries.zh;
  let message = dict[key] ?? dictionaries.zh[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      message = message.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
    }
  }
  return message;
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'zh';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'zh' || saved === 'en') return saved;
  const navLang = window.navigator.language.toLowerCase();
  return navLang.startsWith('zh') ? 'zh' : 'en';
}

type TranslateParams = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: TranslateParams) => string;
  formatDate: (value: string | number | Date) => string;
  formatDateTime: (value: string | number | Date) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);
  const toggleLocale = useCallback(
    () => setLocaleState((prev) => (prev === 'zh' ? 'en' : 'zh')),
    [],
  );

  const t = useCallback(
    (key: string, params?: TranslateParams): string => {
      const dict = dictionaries[locale] ?? dictionaries.zh;
      let message = dict[key] ?? dictionaries.zh[key] ?? key;
      if (params) {
        for (const [name, value] of Object.entries(params)) {
          message = message.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
        }
      }
      return message;
    },
    [locale],
  );

  const formatDate = useCallback(
    (value: string | number | Date): string =>
      new Date(value).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US'),
    [locale],
  );

  const formatDateTime = useCallback(
    (value: string | number | Date): string =>
      new Date(value).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US'),
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t, formatDate, formatDateTime }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
