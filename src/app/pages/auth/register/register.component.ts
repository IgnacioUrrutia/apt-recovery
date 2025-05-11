import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem,
  IonLabel, IonInput, IonButton, IonGrid, IonRow,
  IonCol, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonText, IonAlert, AlertController,
  IonBackButton, IonButtons
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
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
    IonBackButton,
    IonButtons
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>APT Recovery</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-sm="8" size-md="6" size-lg="4">
            <ion-card>
              <ion-card-header>
                <ion-card-title class="ion-text-center">Registro</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <form (ngSubmit)="onRegister()">
                  <ion-item>
                    <ion-label position="floating">Nombre completo</ion-label>
                    <ion-input
                      type="text"
                      [(ngModel)]="displayName"
                      name="displayName"
                      required
                    ></ion-input>
                  </ion-item>

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
                      minlength="6"
                    ></ion-input>
                  </ion-item>

                  <ion-item>
                    <ion-label position="floating">Confirmar contraseña</ion-label>
                    <ion-input
                      type="password"
                      [(ngModel)]="confirmPassword"
                      name="confirmPassword"
                      required
                    ></ion-input>
                  </ion-item>

                  <div class="ion-padding">
                    <ion-button
                      expand="block"
                      type="submit"
                      [disabled]="isLoading"
                    >
                      {{ isLoading ? 'Registrando...' : 'Registrarme' }}
                    </ion-button>
                  </div>
                </form>

                <div class="ion-text-center ion-padding-top">
                  <ion-text>
                    <p>
                      ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a>
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
export class RegisterComponent {
  displayName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async onRegister() {
    if (!this.displayName || !this.email || !this.password || !this.confirmPassword) {
      this.presentAlert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.presentAlert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (this.password.length < 6) {
      this.presentAlert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.register(this.email, this.password, this.displayName);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al registrarse', error);
      this.presentAlert('Error de registro', 'No se pudo completar el registro. Por favor, inténtalo de nuevo.');
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
