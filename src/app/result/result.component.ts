import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  template: `
    <h2>Simplified Report</h2>
    <pre>{{ simplifiedText }}</pre>
    <button (click)="goBack()">Back</button>
  `,
  standalone: true
})
export class ResultComponent {
  simplifiedText = sessionStorage.getItem('simplifiedText') || '';

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}