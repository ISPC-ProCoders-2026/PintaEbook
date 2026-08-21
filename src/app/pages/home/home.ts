import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from "../../shared/components/navbar/navbar";

@Component({
  selector: 'app-home',
  imports: [Navbar, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
