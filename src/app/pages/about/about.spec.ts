import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { ThemeService } from '../../service/theme/theme';

import { About } from './about';

describe('About', () => {
  let component: About;
  let fixture: ComponentFixture<About>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: { isDark: signal(false), toggle: () => undefined } }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(About);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('identifies the page and its sections without duplicate logo announcements', () => {
    const view = fixture.nativeElement as HTMLElement;
    expect(view.querySelectorAll('main').length).toBe(1);
    expect(view.querySelectorAll('h1').length).toBe(1);
    expect(view.querySelector('h1 .sr-only')?.textContent).toContain('Sobre nosotros');
    expect(view.querySelector('h1 img')?.getAttribute('alt')).toBe('');
    for (const section of view.querySelectorAll('main section[aria-labelledby]')) {
      const heading = view.querySelector(`#${section.getAttribute('aria-labelledby')}`);
      expect(heading?.textContent?.trim()).toBeTruthy();
    }
    expect(view.querySelectorAll('.team-card h3').length).toBe(5);
    expect(view.querySelector('h4')).toBeNull();
  });

  it('provides valid destinations for registration and plan links', () => {
    const view = fixture.nativeElement as HTMLElement;
    expect(view.querySelector('.cta-primary')?.getAttribute('href')).toBe('/register');
    expect(view.querySelector('app-cta a[href="/credits#planes"]')).not.toBeNull();
  });

  it('includes the reading content in DOM tab order before the final links', () => {
    const view = fixture.nativeElement as HTMLElement;
    const stops = Array.from(view.querySelectorAll<HTMLElement>('main [tabindex="0"], main a[href]'));
    expect(stops[0].id).toBe('about-title');
    expect(stops[1].tagName).toBe('P');
    expect(stops[2].id).toBe('about-story-title');
    expect(stops.filter(element => element.classList.contains('team-card')).length).toBe(5);
    const teamIndex = stops.findIndex(element => element.id === 'about-team-title');
    const communityIndex = stops.findIndex(element => element.id === 'community-title');
    const firstLinkIndex = stops.findIndex(element => element.tagName === 'A');
    expect(teamIndex).toBeGreaterThan(2);
    expect(communityIndex).toBeGreaterThan(teamIndex + 5);
    expect(firstLinkIndex).toBeGreaterThan(communityIndex);
    expect(stops.slice(-2).map(element => element.getAttribute('href'))).toEqual(['/register', '/credits#planes']);
    for (const stop of stops) {
      expect(stop.tabIndex).toBe(0);
      stop.focus();
      expect(document.activeElement).toBe(stop);
    }
    for (const member of view.querySelectorAll<HTMLElement>('.team-card')) {
      expect(view.querySelector(`#${member.getAttribute('aria-labelledby')}`)?.textContent?.trim()).toBeTruthy();
      const descriptions = member.getAttribute('aria-describedby')!.split(' ');
      expect(descriptions.every(id => !!view.querySelector(`#${id}`)?.textContent?.trim())).toBe(true);
    }
  });
});
