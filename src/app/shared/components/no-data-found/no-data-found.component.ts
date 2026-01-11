import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
    selector: 'app-no-data-found',
    templateUrl: './no-data-found.component.html',
    styleUrls: ['./no-data-found.component.scss'],
    standalone: false
})
export class NoDataFoundComponent implements OnInit {
@Input() messageHeader;
@Input() messageDescription;
@Input() image = 'assets/no-data/no_result_found.png';
@Input() exploreButton;
@Input() noResult;
  isMentor: boolean;
  constructor(private router: Router, private profileService: ProfileService) { this.isMentor = this.profileService.isMentor; }

  ngOnInit() {}

  onSubmit(){
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.MENTOR_DIRECTORY}`], { replaceUrl: true });
  }

}
