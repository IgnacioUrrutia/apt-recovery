import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, UserProfile } from '../../services/auth.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonGrid, IonRow, IonCol, IonIcon, IonItem, IonLabel,
  IonProgressBar, IonText, IonMenuButton, IonButtons,
  IonMenu, IonMenuToggle, IonList, IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, fitnessOutline, analyticsOutline,
  pulseOutline, calendarOutline, notificationsOutline,
  personOutline, logOutOutline, menuOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonItem,
    IonLabel,
    IonProgressBar,
    IonMenuButton,
    IonButtons,
    IonMenu,
    IonMenuToggle,
    IonList,
    IonFooter
  ],
  template: `
    <!-- Side Menu -->
    <ion-menu contentId="main-content">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>APT Recovery</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/home" detail>
              <ion-icon name="home-outline" slot="start"></ion-icon>
              <ion-label>Inicio</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/injury-selector" detail>
              <ion-icon name="fitness-outline" slot="start"></ion-icon>
              <ion-label>Selector de Lesión</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/routines" detail>
              <ion-icon name="calendar-outline" slot="start"></ion-icon>
              <ion-label>Mis Rutinas</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/progress" detail>
              <ion-icon name="pulse-outline" slot="start"></ion-icon>
              <ion-label>Mi Progreso</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/statistics" detail>
              <ion-icon name="analytics-outline" slot="start"></ion-icon>
              <ion-label>Estadísticas</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/profile" detail>
              <ion-icon name="person-outline" slot="start"></ion-icon>
              <ion-label>Mi Perfil</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>

      <ion-footer>
        <ion-toolbar>
          <ion-item button (click)="logout()">
            <ion-icon name="log-out-outline" slot="start"></ion-icon>
            <ion-label>Cerrar Sesión</ion-label>
          </ion-item>
        </ion-toolbar>
      </ion-footer>
    </ion-menu>

    <div class="ion-page" id="main-content">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>APT Recovery</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <ion-grid>
          <ion-row>
            <ion-col size="12">
              <div class="welcome-container ion-padding ion-text-center">
                <h1>Bienvenido/a, {{ userProfile?.displayName || 'Usuario' }}!</h1>
                <p>Tu compañero para la recuperación deportiva</p>
              </div>
            </ion-col>
          </ion-row>

          <ion-row>
            <ion-col size="12">
              <ion-card *ngIf="!hasSelectedInjury">
                <ion-card-header>
                  <ion-card-title>Comienza tu recuperación</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <p>Para comenzar tu recuperación, selecciona el tipo de lesión que tienes.</p>
                  <ion-button expand="block" routerLink="/injury-selector" color="primary">
                    Seleccionar lesión
                    <ion-icon name="fitness-outline" slot="end"></ion-icon>
                  </ion-button>
                </ion-card-content>
              </ion-card>

              <ion-card *ngIf="hasSelectedInjury">
                <ion-card-header>
                  <ion-card-title>Estado de tu recuperación</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <p>Lesión actual: {{ currentInjury }}</p>
                  <p>Progreso general:</p>
                  <ion-progress-bar [value]="recoveryProgress"></ion-progress-bar>
                  <p class="ion-text-right">{{ (recoveryProgress * 100).toFixed(0) }}%</p>

                  <ion-button expand="block" routerLink="/routines" color="primary">
                    Ver mi rutina de hoy
                    <ion-icon name="calendar-outline" slot="end"></ion-icon>
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>

          <ion-row>
            <ion-col size="12" size-md="6">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Acceso rápido</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-button expand="block" routerLink="/progress" color="secondary" class="ion-margin-bottom">
                    <ion-icon name="pulse-outline" slot="start"></ion-icon>
                    Mi Progreso
                  </ion-button>

                  <ion-button expand="block" routerLink="/statistics" color="tertiary">
                    <ion-icon name="analytics-outline" slot="start"></ion-icon>
                    Estadísticas
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <ion-col size="12" size-md="6">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Recordatorios</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <p *ngIf="reminders.length === 0">No tienes recordatorios pendientes.</p>

                  <ion-item *ngFor="let reminder of reminders">
                    <ion-icon name="notifications-outline" slot="start"></ion-icon>
                    <ion-label>
                      <h2>{{ reminder.title }}</h2>
                      <p>{{ reminder.time }}</p>
                    </ion-label>
                  </ion-item>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    </div>
  `,
  styles: [`
    .welcome-container {
      margin-bottom: 1rem;
    }

    .welcome-container h1 {
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--ion-color-dark);
      margin-bottom: 0.5rem;
    }

    .welcome-container p {
      font-size: 1.1rem;
      color: var(--ion-color-medium);
    }

    ion-card {
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    ion-card-title {
      font-size: 1.3rem;
      font-weight: bold;
      color: var(--ion-color-primary);
    }
  `]
})
export class HomeComponent implements OnInit {
  userProfile: UserProfile | null = null;
  hasSelectedInjury: boolean = false;
  currentInjury: string = '';
  recoveryProgress: number = 0.3; // Ejemplo: 30% de progreso

  reminders = [
    { title: 'Ejercicios matutinos', time: '08:00 AM' },
    { title: 'Estiramientos', time: '06:00 PM' }
  ];

  constructor(private authService: AuthService) {
    addIcons({
      homeOutline, fitnessOutline, analyticsOutline,
      pulseOutline, calendarOutline, notificationsOutline,
      personOutline, logOutOutline, menuOutline
    });
  }

  async ngOnInit() {
    this.authService.user$.subscribe(async user => {
      if (user) {
        this.userProfile = await this.authService.getUserProfile(user.uid);

        // Verificar si el usuario tiene lesiones seleccionadas
        if (this.userProfile && this.userProfile.injuries && this.userProfile.injuries.length > 0) {
          this.hasSelectedInjury = true;
          this.currentInjury = this.userProfile.injuries[0]; // Tomamos la primera lesión como ejemplo
        }
      }
    });
  }

  async logout() {
    await this.authService.logout();
  }
}
