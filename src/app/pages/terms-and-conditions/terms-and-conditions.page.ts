import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.page.html',
  styleUrls: ['./terms-and-conditions.page.scss'],
})
export class TermsAndConditionsPage implements OnInit {
  items: any;
  notChecked: boolean=true;
  public headerConfig: any = {
    menu: false,
    notification: false,
    backButton: true,
  };
  constructor(private router: Router, private profileService: ProfileService,
    private authService: AuthService) {
    this.items = [
      { key: "User Agreement", value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In rutrum libero id consequat finibus. Maecenas sollicitudin est vel condimentum aliquet. Proin laoreet quis neque id cursus. Phasellus libero tortor, vulputate eu finibus eu, tristique a diam. Nullam vel tincidunt est. Quisque cursus vulputate ante, eget interdum tellus scelerisque vel.", expanded: false },
      { key: "Privacy Policy", value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In rutrum libero id consequat finibus. Maecenas sollicitudin est vel condimentum aliquet. Proin laoreet quis neque id cursus. Phasellus libero tortor, vulputate eu finibus eu, tristique a diam. Nullam vel tincidunt est. Quisque cursus vulputate ante, eget interdum tellus scelerisque vel.", expanded: false },
      { key: "Terms of use", value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In rutrum libero id consequat finibus. Maecenas sollicitudin est vel condimentum aliquet. Proin laoreet quis neque id cursus. Phasellus libero tortor, vulputate eu finibus eu, tristique a diam. Nullam vel tincidunt est. Quisque cursus vulputate ante, eget interdum tellus scelerisque vel.", expanded: false },
    ];
  }

  ngOnInit() {
  }
  expandItem(item): void {
    if (item.expanded) {
      item.expanded = false;
    } else {
      this.items.map(listItem => {
        if (item == listItem) {
          listItem.expanded = !listItem.expanded;
        } else {
          listItem.expanded = false;
        }
        return listItem;
      });
    }
  }
  goToHome(){
    this.authService.acceptTermsAndConditions();
  }
  checked(){
    this.notChecked = (this.notChecked == true) ? false : true;
  }
}
