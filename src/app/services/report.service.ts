import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private apiUrl = 'http://localhost:8000/simplify';

  constructor(private http: HttpClient) {}

  uploadReport(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
