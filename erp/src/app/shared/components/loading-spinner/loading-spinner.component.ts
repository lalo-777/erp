import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'inline' | 'overlay' | 'button' = 'inline';
  @Input() color: 'primary' | 'secondary' | 'white' = 'primary';
  @Input() message?: string;

  get sizeClass(): string {
    const sizeMap = {
      sm: 'spinner-border-sm',
      md: '',
      lg: 'spinner-lg'
    };
    return sizeMap[this.size];
  }

  get colorClass(): string {
    return `text-${this.color}`;
  }
}
