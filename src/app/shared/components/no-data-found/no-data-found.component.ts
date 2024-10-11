import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-no-data-found',
  templateUrl: './no-data-found.component.html',
  styleUrls: ['./no-data-found.component.scss'],
})
export class NoDataFoundComponent implements OnInit {
@Input() messageHeader;
@Input() messageDescription;
@Input() image = 'assets/no-data/sad-face-2691.svg';
@Input() mentorButton;
@Input() noResult;
  constructor(private router: Router) { }

  ngOnInit() {}

  onSubmit(){
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.MENTOR_DIRECTORY}`], { replaceUrl: true });
  }

}
