import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './admin.html',
    styleUrls: ['../shared/modern-theme.css']
})
export class AdminComponent { }


