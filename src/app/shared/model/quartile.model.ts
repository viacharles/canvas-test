import { TranslateService } from '@ngx-translate/core';
import { EQuartileCheckListTopicName, EQuestionSectionId } from "../enum/datatable.enum";
import { QuartileMap } from "../map/datatable.map";
import { IBarChart, IProject, IQuartileCheckList, IQuartileDisplay, IQuartileSectionDisplay, IScore } from "../interface/datatable.interface";

export class Quartile {
  public sourceSorted?: IQuartileCheckList;
  public display?: IQuartileDisplay;
  private colorMap = new Map<string, {
    value: number;
    color: string;
  }[]>();
  private getSingleBarColor?: (params: any) => string;
  private getStackBarColor?: (params: any) => string;
  constructor(checklist: IQuartileCheckList, project?: IProject, $translate?: TranslateService) {
    this.sourceSorted = this.getSortedQuartile(checklist);
    if (project && project.scores && $translate) {
      this.display = this.getQuartileDisplay(project.scores, $translate);
    }
  }

  /** 獲得某項分數的評價文字i18n & 顏色 & 該項所有區間分數差
 * @param scores 專案資料內所有具有分數屬性的項目  */
  public getColorAndI18nAndLevels(scores: IScore[], targetId: EQuestionSectionId): { color: string, levelI18n: string, levels: { value: number, color: string }[] } {
    const QuartileCheckList = this.sourceSorted;
    const Section = Object.values(scores).find(score => score.sectionId === targetId);
    let result = { color: '', levelI18n: '--', levels: [] as { color: string, value: number }[] };
    if (Section) {
      (QuartileCheckList as any)[QuartileMap.get(targetId)!.checkListTopicName]
        .forEach((quartileSeg: { color: string, value: number }, index: number, checkListArray: any[]) => {
          const Regular = Section.originalRegular;
          const isBiz = targetId === EQuestionSectionId.BUSINESS;
          if (index === 0 && Regular <= checkListArray[index + 1].value) {
            result.levelI18n = 'questions.low';
            result.color = isBiz ? checkListArray[3].color : quartileSeg.color;
          }
          else if (index === 1 && Regular > quartileSeg.value && Regular <= checkListArray[index + 1].value) {
            result.levelI18n = 'questions.low-medium';
            result.color = isBiz ? checkListArray[2].color : quartileSeg.color;
          }
          else if (index === 2 && Regular > quartileSeg.value && Regular <= checkListArray[index + 1].value) {
            result.levelI18n = 'questions.high-medium';
            result.color = isBiz ? checkListArray[1].color : quartileSeg.color;
          }
          else if (index === 3 && Regular > quartileSeg.value) {
            result.levelI18n = 'questions.high';
            result.color = isBiz ? checkListArray[0].color : quartileSeg.color;
          }
          result.levels.push(this.getLevelDiff(isBiz, quartileSeg, index, checkListArray));
        });
    }
    return result;
  }

  /** 獲得四分位顯示用資料 */
  public getQuartileDisplay(scores: IScore[], translate: TranslateService): IQuartileDisplay {
    if (!this.display) {
      let sections: IQuartileSectionDisplay[] = [];
      Object.entries(this.sourceSorted!)
        .map((section: [string, { color: string, value: number }[]]) => {
          if (section[1] && section[1].length > 0) {
            const SectionName = section[0] as EQuartileCheckListTopicName;
            const Section = scores.find((score: IScore) => QuartileMap.get(score.sectionId)?.checkListTopicName === SectionName);
            if (Section) {
              const { levelI18n, color, levels } = this.getColorAndI18nAndLevels(scores, Section.sectionId);
              const Name = translate.instant(QuartileMap.get(Section.sectionId)?.titleI18n!);
              sections.push(
                {
                  name: Name,
                  levelI18n: levelI18n,
                  regularValue: Section.originalRegular,
                  color: color,
                  levels: levels,
                  elements: Section.groups.map(group => ({
                    name: group.groupName,
                    value: group.originalRegular
                  }))
                }
              );
              this.colorMap.set(Name, [{ value: Section.originalRegular, color: color }, ...levels]);
            }
          }
        });
      this.setSingleBarColorFunction();
      this.setStackBarColorFunction();
      this.display = {
        sections: sections,
        barChart: this.getQuartileBarCharts(sections)
      };
    }
    return this.display;
  }

  private getLevelDiff(isBusiness: boolean, quartileSeg: { color: string, value: number }, index: number, checkListArray: any[]): { color: string, value: number } {
    let level: { value: number, color: string } | {} = {};
    switch (index) {
      case 0: level = {
        value: checkListArray[index + 1].value,
        color: isBusiness ? checkListArray[3].color : quartileSeg.color
      }; break;
      case 1: level = {
        value: Math.round((checkListArray[index + 1].value - quartileSeg.value)),
        color: isBusiness ? checkListArray[2].color : quartileSeg.color
      }; break;
      case 2: level = {
        value: Math.round(checkListArray[index + 1].value - quartileSeg.value),
        color: isBusiness ? checkListArray[1].color : quartileSeg.color
      }; break;
      case 3: level = {
        value: Math.round(100 - quartileSeg.value),
        color: isBusiness ? checkListArray[0].color : quartileSeg.color
      }; break;
    }
    return level as { value: number, color: string };
  }

  /** 獲得 bar chart 用四分位數資料 */
  private getQuartileBarCharts(sections: IQuartileSectionDisplay[]): IBarChart {
    return {
      bars: sections.map(section => ([
        {
          group: section.levels!.map((level, index) => ({
            score: level.value,
            color: this.getStackBarColor!,
            name: `stack-${section.name}-${index}`
          })),
          name: section.name,
          width: '18px'
        }, {
          group: [{
            score: section.regularValue,
            color: this.getSingleBarColor!,
            name: `bar-${section.name}`,
          }],
          name: section.name,
          width: '18px',
        }
      ]))
    };
  }

  /** 獲得 echart 單個bar顏色的回傳函數 */
  private setSingleBarColorFunction(): void {
    const ColorMap = this.colorMap;
    this.getSingleBarColor = (params: any) => {
      return ColorMap.get(params.name)![0].color;
    }
  }

  /** 獲得 echart stack bar顏色的回傳函數 */
  private setStackBarColorFunction(): void {
    const ColorMap = this.colorMap;
    this.getStackBarColor = (params: any) => {
      return ColorMap.get(params.name)![params.componentIndex + 1].color;
    }
  }

  /** 得到level排序後的quartile資料 */
  private getSortedQuartile(checklist: IQuartileCheckList): IQuartileCheckList {
    const SortedList = checklist;
    Object.keys(SortedList)
      .forEach(key => {
        const Section = (SortedList as any)[key];
        if (Section && Section.length > 0) {
          (SortedList as any)[key]
            .sort((a: { color: string, value: number }, b: { color: string, value: number }) => a.value - b.value);
        }
      });
    return SortedList;
  }
}
