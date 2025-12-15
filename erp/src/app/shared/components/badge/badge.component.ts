import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  @Input() text = '';
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() pill = false;
  @Input() icon?: string;

  get badgeClasses(): string {
    const classes = [`badge bg-${this.color}`];

    if (this.pill) {
      classes.push('rounded-pill');
    }

    if (this.size === 'sm') {
      classes.push('badge-sm');
    } else if (this.size === 'lg') {
      classes.push('badge-lg');
    }

    return classes.join(' ');
  }
}
