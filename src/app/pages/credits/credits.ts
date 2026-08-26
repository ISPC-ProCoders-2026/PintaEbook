import { Component, HostListener, OnInit } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { Footer } from "../../shared/components/footer/footer";
import { Faqs } from "../../shared/components/faqs/faqs";
import { Cta } from "../../shared/components/cta/cta";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.html',
  styleUrls: ['./credits.css'],
  imports: [Navbar, Footer, Faqs, Cta, RouterLink]
})
export class Credits implements OnInit {
  isAnnual: boolean = false;
  readingProgress: number = 0;

  isRevealed: boolean = true;

  ngOnInit(): void {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.readingProgress = (scrollTop / docHeight) * 100;
  }

  toggleBilling(): void {
    this.isAnnual = !this.isAnnual;
  }

 
}