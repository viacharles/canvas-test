/** 第一階主題id */
export enum EQuestionSectionId {
  BASIC = "65b2fd2d74944849a6c75a3561301155",
  BUSINESS = "7dffe7782c8a40dab6998f1fb639c46e",
  TECH = "e8a4123e5c734bc797c645a07eb66888",
  RISK = "caacfc6d8e684b9b9b84093057866068"
}

/** 第二階主題id */
export enum EQuestionGroupId {
  BASIC = "86dd49e88bac409ca6fc8909adacb162", // "基本資訊"
  BUSINESS = "d05a830cc606489c976b6ab2d2b81c43", //"業務規劃"
  CLOUD = "706691a503fb4b4e8071828eb0a6385a", // "上雲價值"
  TECH_STRUCTURE = "0453e6494da748a08a971fd5deaf0d94", // "技術架構"
  SYS_REQUIRE = "e55ea232e3fa479cac0b3b8b85fb2b9f", // "系統要求"
  SYS_COMPLEX = "e389dfb18ff74f3182ad9035f42071d8"  , // "系統複雜度"
  IMPORTANT = "1d240faa8b53473e9feb7b04b4d7dad4"  , // "重大性"
  SLA = "0453e6494da748a08a971fd5deaf0d94", // "SLA"
  DX = "22c721a571684db687b9213b1a9fa480"  , // "開發體驗"
}

/** 四分位查表的項目名稱 */
export enum EQuartileCheckListTopicName {
  BUSINESS = "businessImpatQuartile",
  RISK = "riskLevelQuartile",
  TECH = "technicalCostQuartile"
}
