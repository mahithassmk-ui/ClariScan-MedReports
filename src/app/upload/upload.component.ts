import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';

interface ReportSection {
  title: string;
  bullets: string[];
  paragraphs: string[];
}

type RiskLevel = 'low' | 'medium' | 'high';
type PreviewType = 'none' | 'image' | 'pdf';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  selectedFile: File | null = null;
  loading = false;
  simplifiedText = '';
  reportTitle = '';
  reportSections: ReportSection[] = [];
  riskLevel: RiskLevel = 'low';
  riskLabel = 'Low Priority';
  riskMessage = 'No obvious urgent terms detected in this summary.';
  previewType: PreviewType = 'none';
  previewUrl = '';
  fileName = '';
  private readonly apiUrl = 'http://127.0.0.1:8000/simplify';
  private readonly requestTimeoutMs = 180000;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.fileName = this.selectedFile?.name ?? '';
    this.simplifiedText = '';
    this.reportTitle = '';
    this.reportSections = [];
    this.setRiskFromText('');
    this.setupPreview();
  }

  submitReport(): void {
    if (!this.selectedFile) return;

    this.loading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.http.post<{ simplified_text: string }>(this.apiUrl, formData)
      .pipe(timeout(this.requestTimeoutMs))
      .subscribe({
        next: (res) => {
          this.simplifiedText = (res?.simplified_text || '[Empty response from backend]').trim();
          this.parseSimplifiedText();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.simplifiedText = '[Request failed/timed out. Verify backend is running on 127.0.0.1:8000 and Ollama is running with the configured model.]';
          this.parseSimplifiedText();
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  downloadCurrentViewPdf(): void {
    const prevTitle = document.title;
    document.title = `simplified-report-${Date.now()}`;
    window.print();
    document.title = prevTitle;
  }

  sectionTone(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('safety')) return 'tone-red';
    if (t.includes('question')) return 'tone-amber';
    if (t.includes('summary')) return 'tone-blue';
    if (t.includes('finding')) return 'tone-cyan';
    return 'tone-green';
  }

  private setupPreview(): void {
    this.revokePreviewUrl();
    this.previewType = 'none';
    this.previewUrl = '';

    if (!this.selectedFile) return;
    const type = this.selectedFile.type.toLowerCase();
    const name = this.selectedFile.name.toLowerCase();

    if (type.startsWith('image/')) {
      this.previewType = 'image';
      this.previewUrl = URL.createObjectURL(this.selectedFile);
      return;
    }

    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      this.previewType = 'pdf';
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  private revokePreviewUrl(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }

  private parseSimplifiedText(): void {
    const text = (this.simplifiedText || '').trim();
    this.reportTitle = '';
    this.reportSections = [];
    this.setRiskFromText(text);
    if (!text) return;

    const lines = text.split(/\r?\n/).map((line) => line.trim());
    let current: ReportSection | null = null;

    for (const line of lines) {
      if (!line) continue;

      if (line.startsWith('## ')) {
        this.reportTitle = line.replace(/^##\s+/, '').trim();
        continue;
      }

      if (line.startsWith('### ')) {
        if (current) this.reportSections.push(current);
        current = { title: line.replace(/^###\s+/, '').trim(), bullets: [], paragraphs: [] };
        continue;
      }

      const bulletMatch = line.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        if (!current) current = { title: 'Report Details', bullets: [], paragraphs: [] };
        current.bullets.push(bulletMatch[1].trim());
        continue;
      }

      if (!current) current = { title: 'Report Details', bullets: [], paragraphs: [] };
      current.paragraphs.push(line);
    }

    if (current) this.reportSections.push(current);
    if (!this.reportTitle) this.reportTitle = 'Easy-to-Understand Report';
  }

  private setRiskFromText(text: string): void {
    const t = (text || '').toLowerCase();
    const highTerms = ['urgent', 'emergency', 'critical', 'aneurysm', 'metast', 'stroke', 'hemorrhage', 'bleed', 'high risk'];
    const mediumTerms = ['follow-up', 'increased in size', 'worsened', 'suspicious', 'abnormal', 'moderate', 'needs evaluation'];

    if (highTerms.some((term) => t.includes(term))) {
      this.riskLevel = 'high';
      this.riskLabel = 'High Priority';
      this.riskMessage = 'Please consult your doctor soon. Seek urgent care for severe sudden symptoms.';
      return;
    }

    if (mediumTerms.some((term) => t.includes(term))) {
      this.riskLevel = 'medium';
      this.riskLabel = 'Medium Priority';
      this.riskMessage = 'Please discuss these findings with your doctor in a timely follow-up visit.';
      return;
    }

    this.riskLevel = 'low';
    this.riskLabel = 'Low Priority';
    this.riskMessage = 'No urgency required, but still review with your doctor.';
  }

}
