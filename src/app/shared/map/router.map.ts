import { ERole } from '../enum/common.enum';
import { IMenuParams } from '../interface/router.interface';
import { EAdminPages, EModule, EPortfolioPages, EProjectPages, EIndividualPages, ELogin, ESettingPages, EMenuItemFunctionMark } from './../enum/router.enum';

/** 主Menu */
export const MenuMap = new Map<EModule, IMenuParams>([
  [ EModule.Canvas, {
    title: 'nav.canvas',
    isExpand: false,
    path: `${EModule.Canvas}`,
  }],
  [ EModule.DataTable, {
    title: 'nav.data-table',
    // icon: 'fa fa-user',
    isExpand: false,
    path: `${EModule.DataTable}`,
  }],
])

export const IndividualPageQueue: EIndividualPages[] = [
  EIndividualPages.Home,
]
