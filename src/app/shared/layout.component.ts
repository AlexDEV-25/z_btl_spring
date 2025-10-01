import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem } from './sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="layout-container">
      <app-sidebar 
        [menuItems]="menuItems"
        [userName]="userName"
        [userRole]="userRole">
      </app-sidebar>
      
      <div class="main-content" [class.sidebar-collapsed]="sidebarCollapsed">
        <div class="content-wrapper">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      margin-left: 280px;
      background: #f8fafc;
      overflow-y: auto;
      transition: margin-left 0.3s ease;
    }

    .main-content.sidebar-collapsed {
      margin-left: 70px;
    }

    .content-wrapper {
      padding: 0;
      min-height: 100%;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
      
      .main-content.sidebar-collapsed {
        margin-left: 0;
      }
    }
  `]
})
export class LayoutComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() userName: string = '';
  @Input() userRole: string = '';
  
  sidebarCollapsed = false;
}
