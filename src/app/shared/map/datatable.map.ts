import { EQuartileCheckListTopicName, EQuestionSectionId } from "../enum/datatable.enum";
import { IColorString } from "../interface/datatable.interface"

/** 6R名稱 > 顏色 */
export const sixRColorMap: Map<ISixRName, IColorString> = new Map([
  ["Retain"," #a2a0a0"],
  ["Rehost"," #449bb7"],
  ["Replatform","#44b787"],
  ["Refactor","#efad49"],
  ["Replace","#fe8e3d"],
  ["Rewrite","#ef6149"],
  ["TBD","gray"],
])

export type ISixRName = "Retain" | "Rehost" | "Replatform" | "Refactor" | "Replace" | "Rewrite" | "TBD";

/** 專案內四分位數id vs 四分位數查表的項目名稱 */
export const QuartileMap = new Map<EQuestionSectionId, IQuartileMapParams>([
  [EQuestionSectionId.BUSINESS, {
    checkListTopicName: EQuartileCheckListTopicName.BUSINESS,
    titleI18n: 'project.table-biz-impact',
  }],
  [EQuestionSectionId.RISK, {
    checkListTopicName: EQuartileCheckListTopicName.RISK,
    titleI18n: 'project.table-risk-level',
  }],
  [EQuestionSectionId.TECH, {
    checkListTopicName: EQuartileCheckListTopicName.TECH,
    titleI18n: 'project.table-tech-cost',
  }],
])

export interface IQuartileMapParams {
  checkListTopicName: EQuartileCheckListTopicName,
  titleI18n: string,
  levels?: {
    color: string,
    value: number
  }[]
}


