import { EQuestionSectionId } from "../enum/datatable.enum"

type QuartileConfig = {
  color: string,
  value: number
}

enum QuartileType  {
  Business = 'business',
  Risk = 'risk',
  TechnicalCost = 'cost'
}

/** 四分位數查表資料 */
export interface IQuartileCheckList extends Record<QuartileType, QuartileConfig[]> {
  businessImpatQuartile: {
    color: string,
    value: number
  }[],
  riskLevelQuartile: {
    color: string,
    value: number
  }[],
  technicalCostQuartile: {
    color: string,
    value: number
  }[],
  tenantId: string,
}

export interface ISystem6Rs {
  result6r: string
}

export interface IProjectList {
  projects: IProject[],
}

/** 專案
 * @自訂邏輯 result-system6r 沒有值===[]，結果有衝突===[{ result6r: "TBD" }]
 * @param editor-editorDate ex. "2023/4/7 12:01:02"
 * @param scores-section 第一階層類 ex, "Business Impact"
 * @param scores-firstScore 此第一階層類的得分
 * @param scores-firstRegular 此第一階層類的通用化分數
 * @param scores-firstQuartile 此第一階層類的四分位數描述 ex. "高"
 * @param scores-secondGroup 此第一階層類的第二階層群組
 * @param scores-secondGroup-groupName 此第二階層類名稱 ex. "業務規劃"
 * @param result-waveScore 上雲分數
 * @param result-waveLevel 上雲階段
 * @param result-system6r 系統適合的遷移策略組  */
export interface IProject {
  projectId: string,
  questionTemplateId: string,
  consult: string,
  isComplete: boolean,
  lastEditor: string,
  editor: {
    email: string,
    userId: string,
    userName: string,
    tenantId: string,
    editDate: string,
  },
  creator: {
    email: string,
    userId: string,
    userName: string,
    tenantId: string,
  },
  answers: {
    [key: string]: {
      value: (number | string)[],
      score: number,
      sectionId: string,
      groupId: string
    }
  },
  scores: IScore[] | null,
  result: {
    waveScore: number,
    waveLevel: string, // ex. wave1
    system6r: ISystem6Rs[] | null
  } | null
}

/** 答案(API要求格式)
 * @param value 欄位答案  */
export interface IAnswer {
  questionTemplateId: string,
  answers: {
    [key: string]: {
      value: (number | string)[],
    },
  }
}

/** 項目分數
 * @param originalScore 原始分數
 * @param originalRegular 規格化後分數   */
export interface IScore {
  section: string,
  sectionId: EQuestionSectionId,
  originalScore: number,
  originalRegular: number,
  groups:
  {
    groupId: string,
    groupName: string,
    originalScore: number,
    originalRegular: number
  }[]
}

/** 題目(評估表)
 * @param questionTemplateId 題目id (每次修改都不同)
 * @param createDate 建立時間 ex. "2023/4/7 12:01:02"
 * @param version 表單版本
 * @param section 所屬第一階層名稱
 * @param groupName 所屬第二階層名稱
 * @param groupOrder 第二階層排序(tab排序)
 * @param totalScore 所屬第二階層總分
 * @param questions-type 欄位類型： ex. 'input' 'select' 'textarea'
 * @param questions-config 欄位設定，參考 IColumnConfig
 * @param questions-className 欄位樣式，： ex. 'input' 'select' 'textarea'
 * @//自訂規則： 'ap-id': 代表此欄為 apID
 * @//自訂規則： 'ap-name': 代表此欄為 apName
 * @//自訂規則： 'cathay-email': 代表此欄需要在前端加 cathay email 驗證
 * @param questions-hideExpression 欄位隱藏規則
 * @param questions-questionDesc 欄位解說
 * @param options (option) select選項，type為'select'時才需要
 * @param options-value 選項值
 * @param options-score 選項得分
 * @param options-reportHighlight 選項是否用特殊色
 * @param options-reportAdvice 選項建議
 * @param options-desc 選項說明  */
export interface IQuestion {
  questionTemplateId: string,
  createDate: string,
  version: string,
  groups: IQuestionGroup[]
}

export interface IQuestionGroup {
  section: string,
  sectionId: string,
  groupName: string,
  groupId: string,
  groupWeight: number,
  groupOrder: number,
  totalScore: number,
  questions: {  // IQuestion
    [key: string]: IField
  }
  reportGroups?: {
    groupName: string,
    groupId: string,
  }[],
}


/** 單題 */
export interface IField {
  shortTitleEN: string,
  shortTitleCN: string,
  longTitleEN: string,
  longTitleCN: string,
  weight: number,
  questionOrder: number,
  placeholder: string,
  type: string,
  required: boolean,
  className: string,
  desc: string,

  hideExpression: Array<{
    key: string,
    value: string | number | null
  }>,
  disabled?: boolean,
  options?: Array<{
    label: string,
    value: number | number[],
    score: number,
    reportHighLight: false,
    reportAdvice: string,
    desc: string,
  }> | null,
  config?: {
    list?: {
      enable?: boolean,
      hasFilter?: boolean,
      inSearch?: boolean,
      filterConfig?: {
        customFilterOptions?: string[],
        isFuzzyFilter?: boolean,
      }
      hasSort?: boolean,
      className?: string,
      style?: string,
      fixedWidth?: string,
      fontColor?: string,
      colorMap?: string[],
      fontSize?: string,
    }
  }
}

/** 全部項目四分位顯示用資料 */
export interface IQuartileDisplay {
  sections: IQuartileSectionDisplay[],
  barChart?: IBarChart,
}

/** 單項目四分位顯示用資料 */
export interface IQuartileSectionDisplay {
  name: string
  levelI18n: string,
  regularValue: number,
  color: string,
  elements?: {
    value: number,
    name: string,
  }[],
  levels?: {
    color: string,
    value: number
  }[]
}

/** wave counts */
export interface IWaveCount {
    waveCounts: {
      wave1Count?: number,
      wave2Count?: number,
      wave3Count?: number,
      wave4Count?: number
    } | null
}

/** 顧問建議 */
export interface IConsultAdvice {
  consultId: string,
  createDate: string,
  editDate: string,
  advice: string,
  projectId: string,
  adviceId: string
}


export interface IBarChart {
  bars: IBar[][];
}

export interface IBar {
  group: {
    score: Number;
    color: string | ((params: any) => string);
    name: string;
  }[];
  name: string;
  width: string;
}

export type IColorString = string;


