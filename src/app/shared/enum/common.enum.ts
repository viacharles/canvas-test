/** 角色 */
export enum ERole {
  SiteAdmin ='SITE_ADMIN',
  TenantAdmin = 'TENANT_ADMIN',
  Reviewer = 'REVIEWER',
}

/** 表單目的 */
export enum EFormMode {
  Edit = 'edit',
  View = 'view',
  Add = 'add',
}

/** 行為 */
export enum EAction {
  Add = 'add',
  Delete = 'delete',
  Clear = 'clear',
  Close = 'close',
  Cancel = 'cancel',
  Modify = 'modify',
  View = 'view',
}

/** 內容目的 */
export enum EContent {
  Success = 'success',
  Error = 'error',
  Info = 'inform',
  Warn = 'warn'
}


