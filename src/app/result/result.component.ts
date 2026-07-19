import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent {
  simplifiedText = '';
  reportTitle = '';
  reportSections: any[] = [];
  riskLevel: 'low' | 'medium' | 'high' = 'low';
  riskLabel = '';
  riskMessage = '';
  previewDataUrl = '';
  previewUrl: SafeResourceUrl | null = null;
  previewType: 'none' | 'image' | 'pdf' = 'none';
  fileName = '';

  constructor(private router: Router, private sanitizer: DomSanitizer) {
    this.loadReportData();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  downloadCurrentViewPdf(): void {
    const prevTitle = document.title;
    document.title = `simplified-report-${Date.now()}`;
    window.print();
    document.title = prevTitle;
  }

  sectionTone(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('safety') || t.includes('risk')) return 'tone-red';
    if (t.includes('question') || t.includes('concern')) return 'tone-amber';
    if (t.includes('summary')) return 'tone-blue';
    if (t.includes('finding') || t.includes('observation')) return 'tone-cyan';
    return 'tone-green';
  }

  private loadReportData(): void {
    const stored = sessionStorage.getItem('reportData');
    if (!stored) {
      this.simplifiedText = sessionStorage.getItem('simplifiedText') || '';
      return;
    }

    try {
      const payload = JSON.parse(stored);
      this.simplifiedText = payload.simplifiedText || '';
      this.reportTitle = payload.reportTitle || 'Simplified Report';
      this.reportSections = payload.reportSections || [];
      this.riskLevel = payload.riskLevel || 'low';
      this.riskLabel = payload.riskLabel || '';
      this.riskMessage = payload.riskMessage || '';
      this.previewDataUrl = payload.previewDataUrl || '';
      this.previewType = payload.previewType || 'none';
      this.fileName = payload.fileName || '';
      this.previewUrl = this.previewDataUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(this.previewDataUrl) : null;
    } catch {
      this.simplifiedText = sessionStorage.getItem('simplifiedText') || '';
    }
  }
}
