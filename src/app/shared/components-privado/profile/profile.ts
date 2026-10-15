import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserProfile } from '../../../models/user-profile.model';
import { ProfileService } from '../../../service/profile/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  profile?: UserProfile;
  @ViewChild('profileDialog') private profileDialog?: ElementRef<HTMLDialogElement>;
  profileDraft = { first_name: '', last_name: '', email: '' };
  isLoading = true;
  hasError = false;
  isSaving = false;
  saveError = '';
  saveMessage = '';

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

  openEditDialog(): void {
    if (!this.profile) return;
    this.profileDraft = {
      first_name: this.profile.first_name,
      last_name: this.profile.last_name,
      email: this.profile.email,
    };
    this.saveError = '';
    this.profileDialog?.nativeElement.showModal();
  }

  closeEditDialog(): void {
    if (!this.isSaving) this.profileDialog?.nativeElement.close();
  }

  saveProfile(): void {
    if (!this.profile || this.isSaving) return;
    const changes = {
      first_name: this.profileDraft.first_name.trim(),
      last_name: this.profileDraft.last_name.trim(),
      email: this.profileDraft.email.trim(),
    };
    if (!changes.first_name || !changes.last_name || !changes.email) {
      this.saveError = 'Completá nombre, apellido y correo electrónico.';
      return;
    }

    this.isSaving = true;
    this.saveError = '';
    this.saveMessage = '';
    this.profileService.updateProfile(changes).subscribe({
      next: (updatedProfile) => {
        this.profile = { ...this.profile!, ...changes, ...updatedProfile };
        this.isSaving = false;
        this.saveMessage = 'Tu perfil se actualizó correctamente.';
        this.profileDialog?.nativeElement.close();
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.isSaving = false;
        this.saveError = 'No pudimos guardar los cambios. Revisá los datos e intentá nuevamente.';
        this.changeDetectorRef.markForCheck();
      },
    });
  }
}
