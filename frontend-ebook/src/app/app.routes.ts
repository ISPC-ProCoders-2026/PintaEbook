import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { EbooksListPage } from './pages/ebooks-list/ebooks-list.page';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'ebooks' },
	{
		path: 'ebooks',
		canActivate: [authGuard],
		component: EbooksListPage
	},
	{ path: '**', redirectTo: 'ebooks' }
];
