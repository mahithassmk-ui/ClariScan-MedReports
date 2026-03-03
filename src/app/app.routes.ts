import { Routes } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { HelpComponent } from './help/help.component';

export const routes: Routes = [
  { path: '', component: UploadComponent },
  { path: 'help', component: HelpComponent },
  { path: '**', redirectTo: '' }
];
