import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem,
  IonLabel, IonInput, IonButton, IonGrid, IonRow,
  IonCol, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonText, IonAlert, AlertController,
  IonBackButton, IonButtons
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-forgot-password',
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
                <ion-card-title class="ion-text-center">Recuperar Contraseña</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <p class="ion-text-center ion-padding-bottom">
                  Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                </p>

                <form (ngSubmit)="onResetPassword()">
                  <ion-item>
                    <ion-label position="floating">Correo electrónico</ion-label>
                    <ion-input
                      type="email"
                      [(ngModel)]="email"
                      name="email"
                      required
                    ></ion-input>
                  </ion-item>

                  <div class="ion-padding">
                    <ion-button
                      expand="block"
                      type="submit"
                      [disabled]="isLoading"
                    >
                      {{ isLoading ? 'Enviando...' : 'Enviar correo' }}
                    </ion-button>
                  </div>
                </form>

                <div class="ion-text-center ion-padding-top">
                  <ion-text>
                    <p>
                      <a routerLink="/login">Volver al inicio de sesión</a>
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
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  async onResetPassword() {
    if (!this.email) {
      this.presentAlert('Error', 'Por favor, ingresa tu correo electrónico.');
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.resetPassword(this.email);
      this.presentAlert(
        'Correo enviado',
        'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.'
      );
      this.email = '';
    } catch (error) {
      console.error('Error al enviar correo de recuperación', error);
      this.presentAlert(
        'Error',
        'No se pudo enviar el correo de recuperación. Verifica que el correo electrónico sea correcto.'
      );
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
