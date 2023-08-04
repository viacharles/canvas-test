import { Component, OnInit } from '@angular/core';
interface IStickSource {
  start: number, end: number, top: number, bottom: number, type: string
}
interface IStick {
  height: number, bottom: number,
}
@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {

  constructor() { }

  public data_json: any;

  // 声明所需变量
  private canvas: any; ctx: any; //canvas DOM    canvas上下文
  // 图表属性
  private cWidth: any; cHeight: any; cMargin: any; cSpace: any; //canvas中部的宽/高  canvas内边距/文字边距
  private originX: any; originY: any; //坐标轴原点
  // 图属性
  private bMargin: any; tobalBars: any; bWidth: any; maxValue: any; minValue: any; //每个k线图间间距  数量 宽度   所有k线图的最大值/最小值
  private totalYNomber: any; //y轴上的标识数量
  private showArr: any; //显示出来的数据部分（因为可以选择范围，所以需要这个数据）

  //范围选择属性
  private dragBarX: any; dragBarWidth: any; //范围选择条中的调节按钮的位置，宽度

  // 运动相关变量
  private ctr: any; numctr: any; speed: any; //运动的起步，共有多少步，运动速度（timer的时间）
  //鼠标移动
  private mousePosition: any = {}; //用户存放鼠标位置

  private MA5_ox1: any; MA5_oy1: any; MA5_ox2: any; MA5_oy2: any;
  private MA10_ox1: any; MA10_oy1: any; MA10_ox2: any; MA10_oy2: any;
  private MA20_ox1: any; MA20_oy1: any; MA20_ox2: any; MA20_oy2: any;
  private MA30_ox1: any; MA30_oy1: any; MA30_ox2: any; MA30_oy2: any;

  private point_MA5 = new Array();
  private point_MA10 = new Array();
  private point_MA20 = new Array();
  private point_MA30 = new Array();
  private mouseTimer: any = null;
  private dataArr = new Array();

  private MA5 = this.calculateMA(5, this.dataArr);
  private MA10 = this.calculateMA(10, this.dataArr);
  private MA20 = this.calculateMA(20, this.dataArr);
  private MA30 = this.calculateMA(30, this.dataArr);

  ngOnInit(): void {
    this.data_json = require('../../../assets/mockData/k-stick.json');
    const jsonArray = this.data_json;
    const FT = jsonArray.FT;
    for (var i = 0; i < FT.length; i++) {
      var A1 = new Array();
      A1[0] = this.setTime(FT[i].time);

      var A2 = new Array();
      A2[0] = parseFloat(FT[i].topen).toFixed(2);
      A2[1] = parseFloat(FT[i].tclose).toFixed(2);
      A2[2] = parseFloat(FT[i].minclose).toFixed(2);
      A2[3] = parseFloat(FT[i].maxclose).toFixed(2);

      A1[1] = A2;
      this.dataArr.push(A1);
    }
    this.goChart(document.getElementById("chart"), this.dataArr);
    this.drawLineLabelMarkers();  // 绘制图表轴、标签和标记
    this.drawBarAnimate(); // 绘制柱状图的动画
    //绘制拖动轴
    this.drawDragBar();
    this.addMouseMove();

    //监听拖拽
    this.canvas.onmousedown = (e: any) => {

      if (this.canvas.style.cursor != "all-scroll") {
        return false;
      }

      document.onmousemove = (e: any) => {
        e = e || window.event;
        if (e.offsetX || e.offsetX == 0) {
          this.dragBarX = e.offsetX * 2 - this.dragBarWidth / 2;
        } else if (e.layerX || e.layerX == 0) {
          this.dragBarX = e.layerX * 2 - this.dragBarWidth / 2;
        }

        if (this.dragBarX <= this.originX) {
          this.dragBarX = this.originX
        }
        if (this.dragBarX > this.originX + this.cWidth - this.dragBarWidth) {
          this.dragBarX = this.originX + this.cWidth - this.dragBarWidth
        }

        var nb = Math.ceil(this.dataArr.length * ((this.dragBarX - this.cMargin - this.cSpace) / this.cWidth));
        this.showArr = this.dataArr.slice(0, nb || 1);

        // 柱状图信息
        this.tobalBars = this.showArr.length;
        this.bWidth = parseFloat(`${this.cWidth / this.tobalBars / 3}`);
        this.bMargin = parseFloat(`${(this.cWidth - this.bWidth * this.tobalBars) / (this.tobalBars + 1)}`);
      }

      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };

      return true;
    }
  }

  // 绘制图表轴、标签和标记
  public drawLineLabelMarkers() {
    this.ctx.font = "24px Arial";
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = "#000";
    this.ctx.strokeStyle = "#000";
    // y轴
    this.drawLine(this.originX, this.originY, this.originX, this.cMargin);
    // x轴
    this.drawLine(this.originX, this.originY, this.originX + this.cWidth, this.originY);

    // 绘制标记
    this.drawMarkers();
  }

  public drawMoveLine(x: any, y: any, X: any, Y: any, color: any) {

    /*绘制二次贝塞尔曲线*/
    this.ctx.strokeStyle = "white";
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.quadraticCurveTo((X - x) / 4 + x, y, X, Y);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke();
  }

  // 画线的方法
  public drawLine(x: any, y: any, X: any, Y: any) {
    this.ctx.strokeStyle = "white";
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(X, Y);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  public drawLineWithColor(x: any, y: any, X: any, Y?: any, color?: any) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(X, Y);
    this.ctx.stroke();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.closePath();
  }
  public setTime(time: any) {
    time = time.substring(0, 11);
    return time;
  }
  // 绘制标记
  public drawMarkers() {
    this.ctx.strokeStyle = "#E0E0E0";
    // 绘制 y
    var oneVal = (this.maxValue - this.minValue) / this.totalYNomber;
    this.ctx.textAlign = "right";
    for (var i = 1; i <= this.totalYNomber; i++) {
      var markerVal = parseInt(i * oneVal + this.minValue);;
      var xMarker = this.originX - 10;
      var yMarker = parseInt(`${this.originY - this.cHeight * (markerVal - this.minValue) / (this.maxValue - this.minValue)}`);
      this.ctx.fillStyle = "white";
      this.ctx.font = "22px Verdana";
      this.ctx.fillText(markerVal, xMarker - 15, yMarker, this.cSpace); // 文字
      if (i > 0) {
        this.drawLine(this.originX + 1, yMarker - 3, this.originX - 9, yMarker - 3);
      }
    }

    // 绘制 x
    var textNb = 6;
    this.ctx.textAlign = "center";
    for (var i = 0; i < this.tobalBars; i++) {
      if (this.tobalBars > textNb && i % parseInt(`${this.tobalBars / 10}`) != 0) {
        continue;
      }
      var markerVal = +this.dataArr[i][0];
      var xMarker = parseInt(this.originX + this.cWidth * (i / this.tobalBars) + this.bMargin + this.bWidth / 2);
      var yMarker = +this.originY + 30;
      this.ctx.fillStyle = "white";
      this.ctx.font = "22px Verdana";
      this.ctx.fillText(markerVal, xMarker, yMarker, this.cSpace); // 文字
      if (i > 0) {
        this.drawLine(xMarker, this.originY, xMarker, this.originY - 10);
      }
    }
    // 绘制标题 y
    this.ctx.save();
    this.ctx.rotate(-Math.PI / 2);
    //this.ctx.fillText("指 数", -canvas.height / 2, cSpace - 20);
    this.ctx.restore();
    // 绘制标题 x
    //this.ctx.fillText("日 期", originX + cWidth / 2, originY + cSpace - 20);
  };
  //绘制k形图
  public drawBarAnimate(mouseMove?: any) {
    this.point_MA5 = new Array();
    this.point_MA10 = new Array();
    this.point_MA20 = new Array();
    this.point_MA30 = new Array();
    var parsent = this.ctr / this.numctr;
    for (var i = 0; i < this.tobalBars; i++) {
      var oneVal = parseInt(`${this.maxValue / this.totalYNomber}`);
      var data = this.dataArr[i][1];
      var color = "#30C7C9";
      var barVal = data[0];
      var disY = 0;
      //开盘0 收盘1 最低2 最高3   跌30C7C9  涨D7797F
      if (data[1] > data[0]) { //涨
        color = "#D7797F";
        barVal = data[1];
        disY = data[1] - data[0];
      } else {
        disY = data[0] - data[1];
      }
      var showH = disY / (this.maxValue - this.minValue) * this.cHeight * parsent;
      showH = showH > 2 ? showH : 2;

      var barH = parseInt(`${this.cHeight * (barVal - this.minValue) / (this.maxValue - this.minValue)}`);
      var y = this.originY - barH;
      var x = this.originX + ((this.bWidth + this.bMargin) * i + this.bMargin) * parsent;

      this.drawMA(this.MA5, i, x, "MA5");
      this.drawMA(this.MA10, i, x, "MA10");
      this.drawMA(this.MA20, i, x, "MA20");
      this.drawMA(this.MA30, i, x, "MA30");
    }
    this.drawBezier(this.point_MA5, "rgb(194,54,49)", 5);
    this.drawBezier(this.point_MA10, "rgb(47,69,84)", 10);
    this.drawBezier(this.point_MA20, "rgb(97,160,168)", 20);
    this.drawBezier(this.point_MA30, "rgb(212,130,101)", 30);

    for (var i = 0; i < this.tobalBars; i++) {
      var oneVal = parseInt(`${this.maxValue / this.totalYNomber}`);
      var data = this.dataArr[i][1];
      var color = "rgb(13,244,155)";
      var barVal = data[0];
      var disY = 0;
      //开盘0 收盘1 最低2 最高3   跌30C7C9  涨D7797F
      if (data[1] > data[0]) { //涨
        color = "rgb(253,16,80)";
        barVal = data[1];
        disY = data[1] - data[0];
      } else {
        disY = data[0] - data[1];
      }
      var showH = disY / (this.maxValue - this.minValue) * this.cHeight * parsent;
      showH = showH > 2 ? showH : 2;

      var barH = parseInt(`${this.cHeight * (barVal - this.minValue) / (this.maxValue - this.minValue)}`);
      var y = this.originY - barH;
      var x = this.originX + ((this.bWidth + this.bMargin) * i + this.bMargin) * parsent;

      this.drawRect(x, y, this.bWidth, showH, mouseMove, color, true); //开盘收盘  高度减一避免盖住x轴

      //最高最低的线
      showH = (data[3] - data[2]) / (this.maxValue - this.minValue) * this.cHeight * parsent;
      showH = showH > 2 ? showH : 2;

      y = this.originY - parseInt(`${this.cHeight * (data[3] - this.minValue) / (this.maxValue - this.minValue)}`);
      this.drawRect(parseInt(`${x + this.bWidth / 2 - 1}`), y, 2, showH, mouseMove, color); //最高最低  高度减一避免盖住x轴
    }

    if (this.ctr < this.numctr) {
      this.ctr++;
      setTimeout( () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawLineLabelMarkers();
        this.drawBarAnimate();
        this.drawDragBar();
      }, this.speed *= 0.03);
    }

  }
  public drawBezier(point: any, color: any, num: any) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.font = "20px SimSun";
    this.ctx.fillStyle = "#ffffff";
    for (let i = 0; i < point.length; i++) {

      if (i < num + 2) {
        this.ctx.moveTo(point[i].x, point[i].y);
      } else { //注意是从1开始
        var ctrlP = this.getCtrlPoint(point, i - 1);
        this.ctx.bezierCurveTo(ctrlP.pA.x, ctrlP.pA.y, ctrlP.pB.x, ctrlP.pB.y, point[i].x, point[i].y);
        //this.ctx.fillText("("+point[i].x+","+point[i].y+")",point[i].x,point[i].y);
      }
    }
    this.ctx.stroke();
  }
  public getCtrlPoint(ps: any, i: any, a?: any, b?: any) {
    if (!a || !b) {
      a = 0.25;
      b = 0.25;
    }
    //处理两种极端情形
    if (i < 1) {
      var pAx = ps[0].x + (ps[1].x - ps[0].x) * a;
      var pAy = ps[0].y + (ps[1].y - ps[0].y) * a;
    } else {
      var pAx = ps[i].x + (ps[i + 1].x - ps[i - 1].x) * a;
      var pAy = ps[i].y + (ps[i + 1].y - ps[i - 1].y) * a;
    }
    if (i > ps.length - 3) {
      var last = ps.length - 1
      var pBx = ps[last].x - (ps[last].x - ps[last - 1].x) * b;
      var pBy = ps[last].y - (ps[last].y - ps[last - 1].y) * b;
    } else {
      var pBx = ps[i + 1].x - (ps[i + 2].x - ps[i].x) * b;
      var pBy = ps[i + 1].y - (ps[i + 2].y - ps[i].y) * b;
    }
    return {
      pA: { x: pAx, y: pAy },
      pB: { x: pBx, y: pBy }
    }
  }
  public drawMA(MA: any, i: any, x: any, type: any) {
    var MAVal = MA[i];
    var MAH = parseInt(`${this.cHeight * (MAVal - this.minValue) / (this.maxValue - this.minValue)}`);
    var MAy = this.originY - MAH;
    if (type == "MA5") {
      this.MA5_ox1 = x + this.bWidth / 2;
      this.MA5_oy1 = MAy;
      this.point_MA5.push({ x: this.MA5_ox1, y: this.MA5_oy1 });
    }
    if (type == "MA10") {
      this.MA10_ox1 = x + this.bWidth / 2;
      this.MA10_oy1 = MAy;
      this.point_MA10.push({ x: this.MA10_ox1, y: this.MA10_oy1 });
    }
    if (type == "MA20") {

      this.MA20_ox1 = x + this.bWidth / 2;
      this.MA20_oy1 = MAy;
      this.point_MA20.push({ x: this.MA20_ox1, y: this.MA20_oy1 });
    }
    if (type == "MA30") {
      this.MA30_ox1 = x + this.bWidth / 2;
      this.MA30_oy1 = MAy;
      this.point_MA30.push({ x: this.MA30_ox1, y: this.MA30_oy1 });
    }
  }

  //绘制方块
  public drawRect(x: any, y: any, X: any, Y: any, mouseMove: any, color?: any, ifBigBar?: any, ifDrag?: any) {

    this.ctx.beginPath();

    if (parseInt(x) % 2 !== 0) { //避免基数像素在普通分辨率屏幕上出现方块模糊的情况
      x += 0;
    }
    if (parseInt(y) % 2 !== 0) {
      y += 0;
    }
    if (parseInt(X) % 2 !== 0) {
      X += 0;
    }
    if (parseInt(Y) % 2 !== 0) {
      Y += 0;
    }
    this.ctx.rect(parseInt(x), parseInt(y), parseInt(X), parseInt(Y));

    if (ifBigBar && mouseMove && this.ctx.isPointInPath(this.mousePosition.x * 2, this.mousePosition.y * 2)) { //如果是鼠标移动的到柱状图上，重新绘制图表
      this.ctx.strokeStyle = color;
      this.ctx.strokeWidth = 20;
      this.ctx.stroke();
    }
    //如果移动到拖动选择范围按钮
    this.canvas.style.cursor = "default";
    if (ifDrag && this.ctx.isPointInPath(this.mousePosition.x * 2, this.mousePosition.y * 2)) { //如果是鼠标移动的到调节范围按钮上，改变鼠标样式
      //console.log(123);
      this.canvas.style.cursor = "all-scroll";
    }
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.closePath();

  }
  public drawDragBar() {
    this.drawRect(this.originX, this.originY + this.cSpace, this.cWidth, this.cMargin, false, "white");
    this.drawRect(this.originX, this.originY + this.cSpace, this.dragBarX - this.originX, this.cMargin, false, "rgb(87,93,110)");
    this.drawRect(this.dragBarX, this.originY + this.cSpace, this.dragBarWidth, this.cMargin, false, "red", false, true);
  }

  public goChart(cBox: any, dataArr: any) {
    // 创建canvas并获得canvas上下文
    this.canvas = document.createElement("canvas");
    console.log('aa-chart', this.canvas)
    if (this.canvas && this.canvas.getContext) {
      this.ctx = this.canvas.getContext("2d");
    }

    this.canvas.innerHTML = "你的浏览器不支持HTML5 canvas";
    cBox.appendChild(this.canvas);

    this.initChart(cBox); // 图表初始化
  }

  // 图表初始化
  private initChart(cBox: any) {
    // 图表信息
    this.cMargin = 40;
    this.cSpace = 80;
    //将canvas扩大2倍，然后缩小，以适应高清屏幕
    this.canvas.width = cBox.getAttribute("width") * 2;
    this.canvas.height = cBox.getAttribute("height") * 2;
    this.canvas.style.height = this.canvas.height / 2 + "px";
    this.canvas.style.width = this.canvas.width / 2 + "px";
    this.cHeight = this.canvas.height - this.cMargin * 2 - this.cSpace * 2;
    this.cWidth = this.canvas.width - this.cMargin * 2 - this.cSpace * 2;
    this.originX = this.cMargin + this.cSpace;
    this.originY = this.cMargin + this.cHeight;

    this.showArr = this.dataArr.slice(0, parseInt(`${this.dataArr.length}`));
    // 柱状图信息
    this.tobalBars = this.showArr.length;
    this.bWidth = parseFloat(`${this.cWidth / this.tobalBars / 3}`);
    this.bMargin = parseFloat(`${(this.cWidth - this.bWidth * this.tobalBars) / (this.tobalBars + 1)}`);
    //算最大值，最小值
    this.maxValue = 0;
    this.minValue = 9999999;
    for (var i = 0; i < this.dataArr.length; i++) {
      var barVal = this.dataArr[i][1][3];
      if (barVal > this.maxValue) {
        this.maxValue = barVal;
      }
      var barVal2 = this.dataArr[i][1][2];
      if (barVal2 < this.minValue) {
        this.minValue = barVal2;
      }

    }
    this.maxValue += 2; //上面预留20的空间
    this.minValue -= 2; //下面预留20的空间
    this.totalYNomber = 10;
    // 运动相关
    this.ctr = 1;
    this.numctr = 20;
    this.speed = 0;

    this.dragBarWidth = 10;
    this.dragBarX = this.cWidth + this.cSpace + this.cMargin - this.dragBarWidth;
  }

public addMouseMove() {
  this.canvas.addEventListener("mousemove", (e: any) => {
    var parsent = this.ctr / this.numctr;
    var x = e.pageX - this.canvas.getBoundingClientRect().left - 60;
    var y = e.pageY + this.canvas.getBoundingClientRect().top + 400;
    if(y > 0 && x > 0) {
    var positionx = 1;
    for (var i = 0; i < this.tobalBars; i++) {
      if (x >= (1080 / this.tobalBars) * i) {
        positionx = i + 1;
      }
    }
    var xx = this.originX + ((this.bWidth + this.bMargin) * (positionx - 1) + this.bMargin) * parsent;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawLineLabelMarkers();
    this.drawBarAnimate(true);
    this.drawDragBar();
    this.drawLineWithColor(parseInt(`${xx + this.bWidth / 2 - 1}`), 40, parseInt(`${xx + this.bWidth / 2 - 1}`), 800);
    this.drawDashLine(this.ctx, 120, this.canvas.getBoundingClientRect().top + e.pageY * 2 - 90, 760 * 3, this.canvas.getBoundingClientRect().top + e.pageY * 2 - 90, 5);
    var vx = 10;
    var vy = this.canvas.getBoundingClientRect().top + e.pageY * 2 - 90 - 20;
    this.ctx.beginPath();
    this.ctx.moveTo(vx, vy);
    this.ctx.lineTo(vx + 100, vy);
    this.ctx.lineTo(vx + 100, vy + 40);
    this.ctx.lineTo(vx, vy + 40);
    this.ctx.lineTo(vx, vy); //绘制最后一笔使图像闭合
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = "rgb(104,113,130)";
    this.ctx.fill();
    this.ctx.stroke();


    var ch = parseFloat((this.maxValue - this.minValue) * y * 2 / this.cHeight + this.minValue).toFixed(2);

    this.ctx.fillStyle = "white";
    this.ctx.fillText(ch, vx + 50, vy + 30, 50); // 文字
    vx = parseInt(`${xx + this.bWidth / 2 - 1}`) + 20;
    vy = this.canvas.getBoundingClientRect().top + e.pageY * 2 - 90 + 20;
    this.ctx.beginPath();
    this.ctx.moveTo(vx, vy);
    this.ctx.lineTo(vx + 200, vy);
    this.ctx.lineTo(vx + 200, vy + 330);
    this.ctx.lineTo(vx, vy + 330);
    this.ctx.lineTo(vx, vy); //绘制最后一笔使图像闭合
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = "rgba(104,113,130,0.5)";
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "left";
    this.ctx.fillText(this.dataArr[positionx - 1][0], vx + 20, vy + 30, 150); // 文字
    this.ctx.fillText("开盘价：" + this.dataArr[positionx - 1][1][0], vx + 20, vy + 70, 150); // 文字
    this.ctx.fillText("收盘价：" + this.dataArr[positionx - 1][1][1], vx + 20, vy + 105, 150); // 文字
    this.ctx.fillText("最高价：" + this.dataArr[positionx - 1][1][2], vx + 20, vy + 140, 150); // 文字
    this.ctx.fillText("最低价：" + this.dataArr[positionx - 1][1][3], vx + 20, vy + 175, 150); // 文字
    this.ctx.fillText("MA5：" + this.MA5[positionx - 1], vx + 20, vy + 210, 150); // 文字
    this.ctx.fillText("MA10：" + this.MA10[positionx - 1], vx + 20, vy + 245, 150); // 文字
    this.ctx.fillText("MA20：" + this.MA20[positionx - 1], vx + 20, vy + 280, 150); // 文字
    this.ctx.fillText("MA30：" + this.MA30[positionx - 1], vx + 20, vy + 315, 150); // 文字
  } else {
    e = e || window.event;
    if (e.offsetX || e.offsetX == 0) {
      this.mousePosition.x = e.offsetX;
      this.mousePosition.y = e.offsetY;
    } else if (e.layerX || e.layerX == 0) {
      this.mousePosition.x = e.layerX;
      this.mousePosition.y = e.layerY;
    }
    if (this.mouseTimer) {
      clearTimeout(this.mouseTimer);
    }
    this.mouseTimer = setTimeout(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawLineLabelMarkers();
      this.drawBarAnimate(true);
      this.drawDragBar();
    }, 10);
  }
});
}

public getBeveling(x: any, y: any) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

public drawDashLine(context: any, x1: any, y1: any, x2: any, y2: any, dashLen: any) {
  dashLen = dashLen === undefined ? 5 : dashLen;
  //得到斜边的总长度
  var beveling = this.getBeveling(x2 - x1, y2 - y1);
  //计算有多少个线段
  var num = Math.floor(beveling / dashLen);

  for (var i = 0; i < num; i++) {
    context[i % 2 == 0 ? 'moveTo' : 'lineTo'](x1 + (x2 - x1) / num * i, y1 + (y2 - y1) / num * i);
  }
  context.stroke();
}
public calculateMA(dayCount: any, data: any) {

  var result = [];
  for (var i = 0, len = data.length; i < len; i++) {
    if (i < dayCount) {
      result.push("-");
      continue;
    }
    var sum = 0;
    for (var j = 0; j < dayCount; j++) {
      sum = parseFloat(`${sum}`) + parseFloat(data[i - j][1][1]);
    }

    result.push(parseFloat(`${parseFloat(`${sum}`) / parseFloat(dayCount)}`).toFixed(2));
  }
  return result;
}

}
