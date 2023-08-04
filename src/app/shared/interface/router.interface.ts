import { ERole } from "../enum/common.enum";
import { EMenuItemFunctionMark } from "../enum/router.enum";

export interface IMenuParams {
  title: string;
  icon?: string;
  path?: string;
  isExpand?: boolean;
  roles?: ERole[];
  subMenu?: Map<string, IMenuParams>;
  functionMark?: EMenuItemFunctionMark;
}
