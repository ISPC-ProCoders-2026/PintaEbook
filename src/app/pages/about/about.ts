import { Component } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { Footer } from "../../shared/components/footer/footer";
import { Cta } from '../../shared/components/cta/cta';
import { ProgressBar } from "../../shared/components/progress-bar/progress-bar";


@Component({
  selector: 'app-about',
  imports: [Navbar, Cta, Footer, ProgressBar],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {}
