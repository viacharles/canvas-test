/** 主Menu */
export enum EModule {
  Canvas = 'canvas',
  DataTable = 'data-table',
}

/** 主Menu：會員管理 */
export enum EAdminPages {
  AuthConfig = 'authConfig',
  ResetPassword = 'resetPassword',
  Invite = 'invite',
  TenantConfig = 'tenantConfig',
  TenantConfigCreate = 'tenantConfig/create',
  ProjectUser = 'project-access',
}

/** 主Menu：問卷管理 */
export enum EProjectPages {
  Overview = 'overview',
  Select = 'select',
  Config = 'config',
  Add = 'add',
}

/** 主Menu：組合展示 */
export enum EPortfolioPages {
  Overview = 'overview',
  Analytic = 'analytic',
}

/** 主Menu：設定 */
export enum ESettingPages {
  Logout = 'logout',
  ResetPassword = 'resetPassword'
}

/** 獨立頁面 */
export enum EIndividualPages {
  Home = 'home',
}

export enum ELogin {
  Login = 'login',
  Register = 'register',
}

/** 菜單項目直接觸發的功能 */
export enum EMenuItemFunctionMark {
  Login = 'login',
}
