import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoutineService, Routine, RoutineExercise } from '../../services/routine.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonGrid, IonRow, IonCol, IonIcon, IonItem, IonLabel,
  IonButtons, IonBackButton, IonList, IonThumbnail,
  IonProgressBar, IonCheckbox, IonBadge, IonAccordion,
  IonAccordionGroup, IonNote, IonRange, IonInput, IonTextarea,
  AlertController, IonSkeletonText, IonChip, IonAlert,
  IonFab, IonFabButton, IonLoading, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, timeOutline, checkmarkCircleOutline,
  closeCircleOutline, barChartOutline, informationCircleOutline,
  refreshOutline, checkmarkDoneOutline, arrowForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonIcon,
    IonItem,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonList,
    IonProgressBar,
    IonCheckbox,
    IonBadge,
    IonAccordion,
    IonAccordionGroup,
    IonNote,
    IonRange,
    IonTextarea,
    IonSkeletonText,
    IonChip,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mis Rutinas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="loading-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-skeleton-text [animated]="true" style="width: 60%"></ion-skeleton-text>
            </ion-card-title>
            <ion-card-subtitle>
              <ion-skeleton-text [animated]="true" style="width: 40%"></ion-skeleton-text>
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-skeleton-text [animated]="true" style="width: 90%"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" style="width: 80%"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" style="width: 85%"></ion-skeleton-text>
          </ion-card-content>
        </ion-card>
      </div>

      <div *ngIf="!loading && !currentRoutine" class="no-routine">
        <ion-card>
          <ion-card-header>
            <ion-card-title class="ion-text-center">No hay rutina para hoy</ion-card-title>
          </ion-card-header>
          <ion-card-content class="ion-text-center">
            <p>Parece que no tienes una rutina asignada para hoy.</p>
            <ion-button expand="block" (click)="generateDailyRoutine()">
              Generar rutina diaria
              <ion-icon name="refresh-outline" slot="end"></ion-icon>
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>

      <div *ngIf="!loading && currentRoutine">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              Rutina de hoy
              <ion-chip *ngIf="currentRoutine.completed" color="success">
                <ion-icon name="checkmark-done-outline"></ion-icon>
                <ion-label>Completada</ion-label>
              </ion-chip>
            </ion-card-title>
            <ion-card-subtitle>
              Rehabilitación: {{ currentRoutine.injuryName }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <div class="progress-container">
              <p>Progreso: {{ (currentRoutine.progress * 100).toFixed(0) }}%</p>
              <ion-progress-bar [value]="currentRoutine.progress"></ion-progress-bar>
            </div>

            <ion-accordion-group>
              <ion-accordion *ngFor="let exercise of currentRoutine.exercises">
                <ion-item slot="header" [color]="exercise.completed ? 'light' : 'white'">
                  <ion-checkbox
                    slot="start"
                    [checked]="exercise.completed"
                    (ionChange)="toggleExercise(exercise, $event)"
                  ></ion-checkbox>
                  <ion-label>
                    <h2>{{ exercise.name }}</h2>
                    <p>{{ exercise.sets }} series × {{ exercise.reps }} repeticiones</p>
                  </ion-label>
                </ion-item>

                <div slot="content" class="ion-padding">
                  <div *ngIf="exercise.imageUrl" class="exercise-image-container">
                    <img [src]="exercise.imageUrl" alt="{{ exercise.name }}" class="exercise-image">
                  </div>

                  <p>{{ exercise.description }}</p>

                  <h4>Instrucciones:</h4>
                  <ol>
                    <li *ngFor="let instruction of exercise.instructions">{{ instruction }}</li>
                  </ol>

                  <div *ngIf="exercise.videoUrl" class="video-container">
                    <ion-button expand="block" href="{{ exercise.videoUrl }}" target="_blank">
                      Ver video de demostración
                    </ion-button>
                  </div>

                  <div *ngIf="exercise.completed">
                    <h4>Registra tu progreso:</h4>
                    <ion-item>
                      <ion-label position="stacked">Nivel de dolor (0-10)</ion-label>
                      <ion-range min="0" max="10" step="1" [(ngModel)]="exercise.painLevel">
                        <ion-icon name="happy-outline" slot="start"></ion-icon>
                        <ion-icon name="sad-outline" slot="end"></ion-icon>
                      </ion-range>
                    </ion-item>

                    <ion-item>
                      <ion-label position="stacked">Dificultad percibida (0-10)</ion-label>
                      <ion-range min="0" max="10" step="1" [(ngModel)]="exercise.difficultyLevel">
                        <ion-icon name="thumbs-up-outline" slot="start"></ion-icon>
                        <ion-icon name="thumbs-down-outline" slot="end"></ion-icon>
                      </ion-range>
                    </ion-item>

                    <ion-item>
                      <ion-label position="stacked">Notas</ion-label>
                      <ion-textarea
                        [(ngModel)]="exercise.notes"
                        placeholder="Escribe cualquier observación..."
                        rows="3"
                      ></ion-textarea>
                    </ion-item>

                    <ion-button
                      expand="block"
                      color="tertiary"
                      class="ion-margin-top"
                      (click)="saveExerciseProgress(exercise)"
                    >
                      Guardar progreso
                    </ion-button>
                  </div>
                </div>
              </ion-accordion>
            </ion-accordion-group>
          </ion-card-content>
        </ion-card>

        <ion-button expand="block" color="success" [disabled]="currentRoutine.completed" (click)="completeAllExercises()" class="ion-margin-top">
          <ion-icon name="checkmark-done-outline" slot="start"></ion-icon>
          Marcar rutina como completada
        </ion-button>
      </div>

      <ion-card *ngIf="!loading" class="ion-margin-top">
        <ion-card-header>
          <ion-card-title>Historial de Rutinas</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div *ngIf="routineHistory.length === 0" class="ion-text-center">
            <p>No hay rutinas pasadas registradas.</p>
          </div>

          <ion-list *ngIf="routineHistory.length > 0">
            <ion-item *ngFor="let routine of routineHistory" [detail]="true">
              <ion-label>
                <h2>{{ formatDate(routine.date) }}</h2>
                <p>{{ routine.injuryName }}</p>
              </ion-label>
              <ion-badge slot="end" [color]="routine.completed ? 'success' : 'warning'">
                {{ routine.completed ? 'Completada' : 'Parcial' }}
              </ion-badge>
              <ion-note slot="end">{{ (routine.progress * 100).toFixed(0) }}%</ion-note>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .loading-container {
      margin-top: 1rem;
    }

    .no-routine {
      margin-top: 2rem;
    }

    .progress-container {
      margin-bottom: 1.5rem;
    }

    ion-accordion-group {
      margin-top: 1rem;
    }

    .exercise-image-container {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .exercise-image {
      max-width: 100%;
      max-height: 200px;
      border-radius: 8px;
    }

    .video-container {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
  `]
})
export class RoutinesComponent implements OnInit {
  currentRoutine: Routine | null = null;
  routineHistory: Routine[] = [];
  loading: boolean = true;

  constructor(
    private routineService: RoutineService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({
      calendarOutline, timeOutline, checkmarkCircleOutline,
      closeCircleOutline, barChartOutline, informationCircleOutline,
      refreshOutline, checkmarkDoneOutline, arrowForwardOutline
    });
  }

  ngOnInit() {
    this.loadRoutines();
  }

  loadRoutines() {
    this.loading = true;

    // Cargar la rutina del día actual
    this.routineService.getDailyRoutine().subscribe(
      routine => {
        this.currentRoutine = routine;

        // Inicializar propiedades adicionales para la interfaz
        if (this.currentRoutine && this.currentRoutine.exercises) {
          this.currentRoutine.exercises.forEach(exercise => {
            (exercise as any).painLevel = 0;
            (exercise as any).difficultyLevel = 0;
            (exercise as any).notes = '';
          });
        }

        // Cargar historial de rutinas pasadas
        this.routineService.getUserRoutines().subscribe(
          routines => {
            // Filtrar la rutina actual del historial
            this.routineHistory = routines.filter(r =>
              !this.currentRoutine || r.id !== this.currentRoutine.id
            ).slice(0, 5); // Mostrar solo las últimas 5 rutinas

            this.loading = false;
          },
          error => {
            console.error('Error loading routine history:', error);
            this.loading = false;
          }
        );
      },
      error => {
        console.error('Error loading daily routine:', error);
        this.loading = false;
      }
    );
  }

  async generateDailyRoutine() {
    const loading = await this.loadingController.create({
      message: 'Generando rutina...'
    });
    await loading.present();

    try {
      const routineId = await this.routineService.generateDailyRoutine();

      if (routineId) {
        this.loadRoutines();
        this.presentAlert(
          'Rutina generada',
          'Se ha generado una nueva rutina para hoy.'
        );
      } else {
        throw new Error('No se pudo generar la rutina');
      }
    } catch (error) {
      console.error('Error generating routine:', error);
      this.presentAlert(
        'Error',
        'No se pudo generar la rutina. Por favor, asegúrate de haber seleccionado una lesión.'
      );
    } finally {
      loading.dismiss();
    }
  }

  async toggleExercise(exercise: RoutineExercise, event: any) {
    if (!this.currentRoutine) return;

    const completed = event.detail.checked;

    try {
      await this.routineService.completeExercise(
        this.currentRoutine.id,
        exercise.id,
        completed
      );

      exercise.completed = completed;

      // Actualizar el progreso en la vista
      const totalExercises = this.currentRoutine.exercises.length;
      const completedExercises = this.currentRoutine.exercises.filter(ex => ex.completed).length;
      this.currentRoutine.progress = totalExercises > 0 ? completedExercises / totalExercises : 0;
      this.currentRoutine.completed = completedExercises === totalExercises;
    } catch (error) {
      console.error('Error toggling exercise:', error);
      this.presentAlert(
        'Error',
        'No se pudo actualizar el ejercicio. Por favor, inténtalo de nuevo.'
      );

      // Revertir el cambio en la UI
      exercise.completed = !completed;
    }
  }

  async saveExerciseProgress(exercise: any) {
    if (!this.currentRoutine) return;

    const progressData = {
      pain: exercise.painLevel,
      difficulty: exercise.difficultyLevel,
      notes: exercise.notes
    };

    try {
      await this.routineService.completeExercise(
        this.currentRoutine.id,
        exercise.id,
        true,
        progressData
      );

      this.presentAlert(
        'Progreso guardado',
        'Se ha registrado correctamente tu progreso en este ejercicio.'
      );

      // Limpiar los campos
      exercise.notes = '';
    } catch (error) {
      console.error('Error saving exercise progress:', error);
      this.presentAlert(
        'Error',
        'No se pudo guardar el progreso. Por favor, inténtalo de nuevo.'
      );
    }
  }

  async completeAllExercises() {
    if (!this.currentRoutine) return;

    const alert = await this.alertController.create({
      header: 'Completar rutina',
      message: '¿Estás seguro de que deseas marcar todos los ejercicios como completados?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Completando rutina...'
            });
            await loading.present();

            try {
              // Marcar cada ejercicio como completado
              for (const exercise of this.currentRoutine!.exercises) {
                if (!exercise.completed) {
                  await this.routineService.completeExercise(
                    this.currentRoutine!.id,
                    exercise.id,
                    true
                  );
                  exercise.completed = true;
                }
              }

              // Actualizar el progreso en la vista
              this.currentRoutine!.progress = 1;
              this.currentRoutine!.completed = true;

              this.presentAlert(
                '¡Rutina completada!',
                'Has completado todos los ejercicios de la rutina de hoy. ¡Sigue así!'
              );
            } catch (error) {
              console.error('Error completing all exercises:', error);
              this.presentAlert(
                'Error',
                'No se pudieron completar todos los ejercicios. Por favor, inténtalo de nuevo.'
              );
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  formatDate(date: Date | any): string {
    if (!date) return '';

    if (typeof date === 'object' && date.seconds) {
      // Convertir timestamp de Firestore
      date = new Date(date.seconds * 1000);
    } else if (!(date instanceof Date)) {
      date = new Date(date);
    }

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
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
