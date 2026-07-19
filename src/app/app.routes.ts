import { Routes } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { HelpComponent } from './help/help.component';
import { ResultComponent } from './result/result.component';

export const routes: Routes = [
  { path: '', component: UploadComponent },
  { path: 'result', component: ResultComponent },
  { path: 'help', component: HelpComponent },
  { path: '**', redirectTo: '' }
];
