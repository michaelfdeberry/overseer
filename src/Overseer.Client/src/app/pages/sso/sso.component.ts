import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-sso',
  template: "<div style='text-align:center;padding:20px;'>Redirecting...</div>",
  standalone: true,
})
export class SsoComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  redirectLogin() {
    this.redirect('/login');
  }

  redirectHome() {
    this.redirect('/');
  }

  redirect(path: string) {
    this.router.navigate([path]);
  }

  ngOnInit(): void {
    this.authenticationService.checkLogin().subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.redirectHome();
      } else {
        this.route.queryParamMap.subscribe((params) => {
          if (params.has('token')) {
            this.authenticationService.validatePreauthenticatedToken(params.get('token')!).subscribe((user) => {
              if (user) {
                this.redirectHome();
              } else {
                this.redirectLogin();
              }
            });
          } else {
            this.redirectLogin();
          }
        });
      }
    });
  }
}
