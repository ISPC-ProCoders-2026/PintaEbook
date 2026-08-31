import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from "../../shared/components/navbar/navbar";
import { Footer } from '../../shared/components/footer/footer';
import { ProgressBar } from '../../shared/components/progress-bar/progress-bar';

@Component({
  selector: 'app-home',
  imports: [Navbar, RouterLink, Footer, ProgressBar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
