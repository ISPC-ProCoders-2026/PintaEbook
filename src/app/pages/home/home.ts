import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from "../../shared/components/navbar/navbar";
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-home',
  imports: [Navbar, RouterLink, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
