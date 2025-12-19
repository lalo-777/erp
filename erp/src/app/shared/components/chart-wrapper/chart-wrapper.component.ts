import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container" [style.height]="height">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [
    `
      .chart-container {
        position: relative;
        width: 100%;
      }
    `,
  ],
})
export class ChartWrapperComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() chartConfig: any = null;
  @Input() height: string = '300px';

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartConfig'] && !changes['chartConfig'].firstChange) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private renderChart(): void {
    if (!this.chartCanvas || !this.chartConfig) return;

    this.destroyChart();

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: this.chartConfig.type as ChartType,
      data: this.chartConfig.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...this.chartConfig.options,
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  public refresh(): void {
    this.renderChart();
  }
}
