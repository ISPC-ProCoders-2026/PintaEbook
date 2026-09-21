import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import { UserProfile } from '../../../models/user-profile.model';
import { ProfileService } from '../../../service/profile/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  profile?: UserProfile;
  isLoading = true;
  hasError = false;

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  get fullName(): string {
    return this.profile ? `${this.profile.first_name} ${this.profile.last_name}`.trim() : '';
  }

  get initials(): string {
    if (!this.profile) return '';

    return `${this.profile.first_name.charAt(0)}${this.profile.last_name.charAt(0)}`.toUpperCase();
  }

  get memberSince(): string {
    if (!this.profile?.created_at) return '';

    return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date(this.profile.created_at));
  }
}
