import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressService, ProgressStats } from '../../services/progress.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonGrid, IonRow, IonCol, IonIcon, IonItem, IonLabel,
  IonButtons, IonBackButton, IonBadge, IonSkeletonText,
  IonProgressBar, IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, trophyOutline, fitnessOutline,
  flameOutline, barChartOutline, analyticsOutline,
  pulseOutline, trendingUpOutline, trendingDownOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-progress',
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
    IonButtons,
    IonBackButton,
    IonBadge,
    IonSkeletonText,
    IonProgressBar,
    IonChip
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mi Progreso</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-skeleton-text [animated]="true" style="width: 60%"></ion-skeleton-text>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-skeleton-text [animated]="true" style="width: 90%"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" style="width: 80%"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" style="width: 85%"></ion-skeleton-text>
          </ion-card-content>
        </ion-card>
      </div>

      <div *ngIf="!loading">
        <ion-card class="summary-card">
          <ion-card-header>
            <ion-card-title>Resumen de progreso</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6">
                  <div class="stat-container">
                    <ion-icon name="fitness-outline" class="stat-icon"></ion-icon>
                    <div class="stat-value">{{ progressStats.completedWorkouts }}</div>
                    <div class="stat-label">Ejercicios completados</div>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="stat-container">
                    <ion-icon name="flame-outline" class="stat-icon"></ion-icon>
                    <div class="stat-value">{{ progressStats.streakDays }}</div>
                    <div class="stat-label">Días seguidos</div>
                  </div>
                </ion-col>
              </ion-row>

              <ion-row>
                <ion-col size="6">
                  <div class="stat-container">
                    <ion-icon name="pulse-outline" class="stat-icon"></ion-icon>
                    <div class="stat-value">{{ progressStats.avgPainLevel.toFixed(1) }}</div>
                    <div class="stat-label">Nivel de dolor promedio</div>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="stat-container">
                    <ion-icon name="trending-down-outline" class="stat-icon" [ngClass]="{'trend-down': progressStats.avgPainLevel < 5}"></ion-icon>
                    <div class="stat-progress">
                      <ion-progress-bar [value]="progressStats.avgPainLevel / 10" [color]="getPainColor(progressStats.avgPainLevel)"></ion-progress-bar>
                    </div>
                    <div class="stat-label">{{ getPainTrend(progressStats.avgPainLevel) }}</div>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Progreso semanal</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="weekly-chart">
              <div class="chart-container">
                <div
                  *ngFor="let day of progressStats.weeklyProgress"
                  class="chart-bar-container"
                >
                  <div class="day-label">{{ day.day.slice(0, 3) }}</div>
                  <div
                    class="chart-bar"
                    [style.height.%]="getBarHeight(day.completed)"
                    [class.active-day]="isToday(day.day)"
                  ></div>
                  <div class="bar-value">{{ day.completed }}</div>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Consejos para tu recuperación</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item lines="none" class="tip-item">
              <ion-icon name="trophy-outline" slot="start" class="tip-icon"></ion-icon>
              <ion-label>
                <h3>Mantén la consistencia</h3>
                <p>Realizar tus ejercicios de forma regular es clave para la recuperación.</p>
              </ion-label>
            </ion-item>

            <ion-item lines="none" class="tip-item">
              <ion-icon name="pulse-outline" slot="start" class="tip-icon"></ion-icon>
              <ion-label>
                <h3>Escucha a tu cuerpo</h3>
                <p>Si sientes dolor intenso, detente y consulta con tu especialista.</p>
              </ion-label>
            </ion-item>

            <ion-item lines="none" class="tip-item">
              <ion-icon name="trending-up-outline" slot="start" class="tip-icon"></ion-icon>
              <ion-label>
                <h3>Progresión gradual</h3>
                <p>Aumenta la intensidad de forma gradual conforme avances.</p>
              </ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Tu evolución reciente</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div *ngIf="progressStats.totalWorkouts === 0" class="ion-text-center">
              <p>Aún no tienes suficientes datos para mostrar tu evolución.</p>
              <p>Completa algunos ejercicios para ver estadísticas aquí.</p>
            </div>

            <div *ngIf="progressStats.totalWorkouts > 0">
              <div class="evolution-stats">
                <ion-item lines="none">
                  <ion-label>
                    <h3>Racha actual</h3>
                    <p>{{ progressStats.streakDays }} día(s) consecutivo(s)</p>
                  </ion-label>
                  <ion-badge slot="end" color="success">
                    {{ getStreakStatus(progressStats.streakDays) }}
                  </ion-badge>
                </ion-item>

                <ion-item lines="none">
                  <ion-label>
                    <h3>Nivel de dolor</h3>
                    <p>
                      <ion-icon
                        [name]="getPainTrendIcon(progressStats.avgPainLevel)"
                        [color]="getPainColor(progressStats.avgPainLevel)"
                      ></ion-icon>
                      {{ getPainDescription(progressStats.avgPainLevel) }}
                    </p>
                  </ion-label>
                </ion-item>

                <ion-item lines="none">
                  <ion-label>
                    <h3>Porcentaje de completitud</h3>
                    <p>
                      <ion-chip [color]="getCompletionColor(getCompletionRate())">
                        {{ (getCompletionRate() * 100).toFixed(0) }}%
                      </ion-chip>
                      de las rutinas asignadas
                    </p>
                  </ion-label>
                </ion-item>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-button expand="block" routerLink="/statistics" color="tertiary" class="ion-margin-vertical">
          <ion-icon name="analytics-outline" slot="start"></ion-icon>
          Ver estadísticas detalladas
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .summary-card {
      border-left: 5px solid var(--ion-color-primary);
    }

    .stat-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;
      text-align: center;
    }

    .stat-icon {
      font-size: 2rem;
      color: var(--ion-color-primary);
      margin-bottom: 5px;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--ion-color-dark);
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--ion-color-medium);
      text-align: center;
      margin-top: 5px;
    }

    .stat-progress {
      width: 100%;
      margin: 5px 0;
    }

    .weekly-chart {
      height: 200px;
      padding: 10px 0;
    }

    .chart-container {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 100%;
    }

    .chart-bar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      width: 12%;
      height: 100%;
    }

    .day-label {
      margin-bottom: 10px;
      font-size: 0.8rem;
      color: var(--ion-color-medium);
    }

    .chart-bar {
      width: 100%;
      background-color: var(--ion-color-primary);
      border-radius: 4px 4px 0 0;
      min-height: 5px;
      transition: height 0.3s ease;
    }

    .active-day {
      background-color: var(--ion-color-tertiary);
    }

    .bar-value {
      margin-top: 5px;
      font-size: 0.9rem;
      font-weight: bold;
    }

    .tip-item {
      margin-bottom: 10px;
    }

    .tip-icon {
      font-size: 1.5rem;
      color: var(--ion-color-primary);
    }

    .evolution-stats {
      margin-top: 10px;
    }

    .trend-down {
      color: var(--ion-color-success);
    }
  `]
})
export class ProgressComponent implements OnInit {
  progressStats: ProgressStats = {
    totalWorkouts: 0,
    completedWorkouts: 0,
    avgPainLevel: 0,
    avgDifficultyLevel: 0,
    streakDays: 0,
    weeklyProgress: [],
    monthlyProgress: {
      labels: [],
      completedExercises: [],
      painLevels: []
    }
  };
  loading: boolean = true;

  constructor(private progressService: ProgressService) {
    addIcons({
      calendarOutline, trophyOutline, fitnessOutline,
      flameOutline, barChartOutline, analyticsOutline,
      pulseOutline, trendingUpOutline, trendingDownOutline
    });
  }

  ngOnInit() {
    this.loadProgressStats();
  }

  loadProgressStats() {
    this.loading = true;

    this.progressService.getProgressStats().subscribe(
      stats => {
        this.progressStats = stats;
        this.loading = false;
      },
      error => {
        console.error('Error loading progress stats:', error);
        this.loading = false;
      }
    );
  }

  getBarHeight(value: number): number {
    // Calcular altura proporcional para la barra del gráfico
    if (value === 0) return 5; // Altura mínima para barras con valor 0

    // Encontrar el máximo en la semana
    const maxValue = Math.max(...this.progressStats.weeklyProgress.map(day => day.completed));

    if (maxValue === 0) return 5;

    return (value / maxValue) * 95; // Altura proporcional (max 95%)
  }

  isToday(dayName: string): boolean {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = new Date().getDay();
    return days[today] === dayName;
  }

  getPainColor(painLevel: number): string {
    if (painLevel < 3) return 'success';
    if (painLevel < 6) return 'warning';
    return 'danger';
  }

  getPainTrend(painLevel: number): string {
    if (painLevel < 3) return 'Dolor bajo';
    if (painLevel < 6) return 'Dolor moderado';
    return 'Dolor alto';
  }

  getPainTrendIcon(painLevel: number): string {
    if (painLevel < 3) return 'trending-down-outline';
    if (painLevel < 6) return 'pulse-outline';
    return 'trending-up-outline';
  }

  getPainDescription(painLevel: number): string {
    if (painLevel < 3) return 'Evolución positiva, dolor disminuyendo';
    if (painLevel < 6) return 'Evolución normal, dolor moderado';
    return 'Evolución lenta, dolor persistente';
  }

  getStreakStatus(streakDays: number): string {
    if (streakDays === 0) return 'Inicia hoy';
    if (streakDays < 3) return 'Buen inicio';
    if (streakDays < 7) return 'Constante';
    return '¡Excelente!';
  }

  getCompletionRate(): number {
    if (this.progressStats.totalWorkouts === 0) return 0;
    return this.progressStats.completedWorkouts / this.progressStats.totalWorkouts;
  }

  getCompletionColor(rate: number): string {
    if (rate < 0.3) return 'danger';
    if (rate < 0.7) return 'warning';
    return 'success';
  }
}
