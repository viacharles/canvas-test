import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('tCanvas', { static: true }) tCanvas?: ElementRef<HTMLCanvasElement>
  title = 'canvas-test';

  private ctx?: CanvasRenderingContext2D;

  ngOnInit(): void {
    this.ctx = this.tCanvas?.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(0, 0, 100, 100);
    this.ctx.strokeRect(0, 0, 100, 50);
    this.ctx.clearRect(30, 30, 30, 30);
    this.ctx.rect(150, 150, 30, 30);
    this.begin(100, 100, this.ctx)
      .draw((x, y, ctx) => this.triangle(x, y, ctx))
    this.begin(200, 100, this.ctx)
      .draw((x, y, ctx) => this.circle(x, y, ctx))
    this.begin(200, 300, this.ctx)
      .draw((x, y, ctx) => this.heart(x, y, ctx))
  }

  private begin(x: number, y: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    return {
      draw: (drawFunction: (x: number, y: number, ctx: CanvasRenderingContext2D) => void) => {
        return drawFunction(x, y, ctx);
      }
    }
  }

  private triangle(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    ctx.lineTo(x, y + 200);
    ctx.lineTo(x + 100, y + 200);
    ctx.fill();
  }

  private circle(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    ctx.arc(x, y, 50, 0, 1 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
  }

  private heart(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    ctx.bezierCurveTo(x + 0, y - 3,x - 5,y - 15,x - 25,y - 15)
    ctx.bezierCurveTo(x - 55,y - 15,x - 55,y + 22.5,x - 55,y + 22.5)
    ctx.bezierCurveTo(x - 55,y + 40,x - 35,y + 62,x + 0,y + 80)
    ctx.bezierCurveTo(x + 110,y + 102,x + 130,y + 80,x + 130,y + 62.5)
    ctx.bezierCurveTo(x + 130,y + 62.5,x + 130,y + 25,x + 100,y + 25)
    ctx.bezierCurveTo(x + 85,y + 25,x + 75,y + 37,x + 75,y + 40)

    // ctx.bezierCurveTo(x + 75,y + 37,x + 70,y + 25,x + 50,y + 25)
    // ctx.bezierCurveTo(x + 20,y + 25,x + 20,y + 62.5,x + 20,y + 62.5)
    // ctx.bezierCurveTo(x + 20,y + 80,x + 40,y + 102,x + 75,y + 120)
    // ctx.bezierCurveTo(x + 110,y + 102,x + 130,y + 80,x + 130,y + 62.5)
    // ctx.bezierCurveTo(x + 130,y + 62.5,x + 130,y + 25,x + 100,y + 25)
    // ctx.bezierCurveTo(x + 85,y + 25,x + 75,y + 37,x + 75,y + 40)
    ctx.fillStyle = "blue";
    ctx.fill();
  }
}
