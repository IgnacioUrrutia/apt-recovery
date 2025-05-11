import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem,
  IonLabel, IonInput, IonButton, IonGrid, IonRow,
  IonCol, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonText, IonAlert, AlertController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>APT Recovery</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-sm="8" size-md="6" size-lg="4">
            <ion-card>
              <ion-card-header>
                <ion-card-title class="ion-text-center">Iniciar Sesión</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <form (ngSubmit)="onLogin()">
                  <ion-item>
                    <ion-label position="floating">Correo electrónico</ion-label>
                    <ion-input
                      type="email"
                      [(ngModel)]="email"
                      name="email"
                      required
                    ></ion-input>
                  </ion-item>

                  <ion-item>
                    <ion-label position="floating">Contraseña</ion-label>
                    <ion-input
                      type="password"
                      [(ngModel)]="password"
                      name="password"
                      required
                    ></ion-input>
                  </ion-item>

                  <div class="ion-padding">
                    <ion-button
                      expand="block"
                      type="submit"
                      [disabled]="isLoading"
                    >
                      {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                    </ion-button>
                  </div>
                </form>

                <div class="ion-text-center ion-padding-top">
                  <ion-text>
                    <p>
                      <a routerLink="/forgot-password">¿Olvidaste tu contraseña?</a>
                    </p>
                    <p>
                      ¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a>
                    </p>
                  </ion-text>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin-top: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    ion-card-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--ion-color-primary);
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async onLogin() {
    if (!this.email || !this.password) {
      this.presentAlert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al iniciar sesión', error);
      this.presentAlert('Error de inicio de sesión', 'Correo electrónico o contraseña incorrectos.');
    } finally {
      this.isLoading = false;
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
