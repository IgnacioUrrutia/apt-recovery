import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InjuryService, Injury } from '../../services/injury.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonGrid, IonRow, IonCol, IonIcon, IonItem, IonLabel,
  IonButtons, IonBackButton, IonSearchbar, IonList, IonImg,
  IonSegment, IonSegmentButton, IonAlert, AlertController,
  IonSkeletonText, IonBadge, IonRippleEffect
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  fitnessOutline, bodyOutline, pulseOutline, imageOutline,
  informationCircleOutline, arrowForwardOutline, searchOutline
} from 'ionicons/icons';

interface BodyPart {
  id: string;
  name: string;
  image: string;
}

@Component({
  selector: 'app-injury-selector',
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
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonSearchbar,
    IonImg,
    IonSegment,
    IonSegmentButton,

    IonSkeletonText,


  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Selector de Lesiones</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-searchbar
        placeholder="Buscar lesión..."
        [(ngModel)]="searchTerm"
        (ionInput)="filterInjuries()"
        [debounce]="300"
      ></ion-searchbar>

      <ion-segment [(ngModel)]="selectionMode" (ionChange)="segmentChanged()">
        <ion-segment-button value="body">
          <ion-label>Por Zona</ion-label>
          <ion-icon name="body-outline"></ion-icon>
        </ion-segment-button>
        <ion-segment-button value="all">
          <ion-label>Todas</ion-label>
          <ion-icon name="fitness-outline"></ion-icon>
        </ion-segment-button>
      </ion-segment>

      <div *ngIf="selectionMode === 'body'">
        <h4 class="section-title">Selecciona la zona afectada</h4>

        <ion-grid>
          <ion-row>
            <ion-col size="6" size-md="4" *ngFor="let bodyPart of bodyParts">
              <ion-card class="body-part-card" (click)="selectBodyPart(bodyPart.id)">
                <ion-img [src]="bodyPart.image" class="body-part-image"></ion-img>
                <ion-card-header>
                  <ion-card-title>{{ bodyPart.name }}</ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <div *ngIf="selectedBodyPart || selectionMode === 'all'">
        <h4 class="section-title" *ngIf="selectedBodyPart">
          Lesiones en {{ getBodyPartName(selectedBodyPart) }}
        </h4>
        <h4 class="section-title" *ngIf="selectionMode === 'all'">
          Todas las Lesiones
        </h4>

        <div *ngIf="loading" class="loading-container">
          <ion-card *ngFor="let i of [1, 2, 3]">
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
            </ion-card-content>
          </ion-card>
        </div>

        <div *ngIf="!loading">
          <div *ngIf="filteredInjuries.length === 0" class="no-results">
            <ion-card>
              <ion-card-content class="ion-text-center">
                <ion-icon name="search-outline" class="no-results-icon"></ion-icon>
                <p>No se encontraron lesiones. Intenta con otra búsqueda o categoría.</p>
              </ion-card-content>
            </ion-card>
          </div>

          <ion-card *ngFor="let injury of filteredInjuries" class="injury-card" (click)="showInjuryDetails(injury)">
            <ion-card-header>
              <ion-card-title>{{ injury.name }}</ion-card-title>
              <ion-card-subtitle>{{ injury.bodyPart }} | Severidad: {{ injury.severity }}</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <ion-grid>
                <ion-row>
                  <ion-col size="4" *ngIf="injury.image">
                    <ion-img [src]="injury.image" class="injury-image"></ion-img>
                  </ion-col>
                  <ion-col size="{{ injury.image ? '8' : '12' }}">
                    <p>{{ injury.description | slice:0:100 }}{{ injury.description.length > 100 ? '...' : '' }}</p>
                    <p><strong>Tiempo de recuperación:</strong> {{ injury.recoveryTime }}</p>

                    <ion-button fill="clear" color="primary">
                      Más información
                      <ion-icon name="information-circle-outline" slot="end"></ion-icon>
                    </ion-button>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .section-title {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--ion-color-dark);
    }

    .body-part-card {
      cursor: pointer;
      transition: transform 0.2s ease;
      height: 100%;
    }

    .body-part-card:active {
      transform: scale(0.95);
    }

    .body-part-image {
      height: 120px;
      object-fit: contain;
      padding: 10px;
    }

    .body-part-card ion-card-title {
      font-size: 1rem;
      text-align: center;
    }

    .injury-card {
      margin-bottom: 1rem;
      cursor: pointer;
    }

    .injury-image {
      border-radius: 8px;
      overflow: hidden;
    }

    .no-results {
      margin-top: 2rem;
    }

    .no-results-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: var(--ion-color-medium);
    }

    .loading-container {
      margin-top: 1rem;
    }
  `]
})
export class InjurySelectorComponent implements OnInit {
  searchTerm: string = '';
  selectionMode: 'body' | 'all' = 'body';
  selectedBodyPart: string | null = null;

  injuries: Injury[] = [];
  filteredInjuries: Injury[] = [];
  loading: boolean = false;

  bodyParts: BodyPart[] = [
    { id: 'hombro', name: 'Hombro', image: 'assets/body-parts/shoulder.png' },
    { id: 'codo', name: 'Codo', image: 'assets/body-parts/elbow.png' },
    { id: 'muñeca', name: 'Muñeca', image: 'assets/body-parts/wrist.png' },
    { id: 'espalda', name: 'Espalda', image: 'assets/body-parts/back.png' },
    { id: 'rodilla', name: 'Rodilla', image: 'assets/body-parts/knee.png' },
    { id: 'tobillo', name: 'Tobillo', image: 'assets/body-parts/ankle.png' },
  ];

  constructor(
    private injuryService: InjuryService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({
      fitnessOutline, bodyOutline, pulseOutline, imageOutline,
      informationCircleOutline, arrowForwardOutline, searchOutline
    });
  }

  ngOnInit() {
    this.loadInjuries();
  }

  loadInjuries() {
    this.loading = true;

    this.injuryService.getInjuries().subscribe(
      injuries => {
        this.injuries = injuries;
        this.filterInjuries();
        this.loading = false;
      },
      error => {
        console.error('Error loading injuries:', error);
        this.loading = false;
      }
    );
  }

  segmentChanged() {
    if (this.selectionMode === 'all') {
      this.selectedBodyPart = null;
      this.filterInjuries();
    } else {
      // Restablecer la vista de partes del cuerpo
      this.selectedBodyPart = null;
      this.filteredInjuries = [];
    }
  }

  selectBodyPart(bodyPartId: string) {
    this.selectedBodyPart = bodyPartId;
    this.loading = true;

    this.injuryService.getInjuriesByBodyPart(bodyPartId).subscribe(
      injuries => {
        this.filteredInjuries = injuries;
        this.loading = false;
      },
      error => {
        console.error('Error loading injuries by body part:', error);
        this.loading = false;
      }
    );
  }

  filterInjuries() {
    if (this.selectionMode === 'all') {
      if (!this.searchTerm.trim()) {
        this.filteredInjuries = [...this.injuries];
      } else {
        const term = this.searchTerm.toLowerCase().trim();
        this.filteredInjuries = this.injuries.filter(injury =>
          injury.name.toLowerCase().includes(term) ||
          injury.description.toLowerCase().includes(term) ||
          injury.bodyPart.toLowerCase().includes(term)
        );
      }
    } else if (this.selectedBodyPart) {
      const bodyPartInjuries = this.injuries.filter(
        injury => injury.bodyPart.toLowerCase() === this.selectedBodyPart?.toLowerCase()
      );

      if (!this.searchTerm.trim()) {
        this.filteredInjuries = bodyPartInjuries;
      } else {
        const term = this.searchTerm.toLowerCase().trim();
        this.filteredInjuries = bodyPartInjuries.filter(injury =>
          injury.name.toLowerCase().includes(term) ||
          injury.description.toLowerCase().includes(term)
        );
      }
    }
  }

  getBodyPartName(bodyPartId: string): string {
    const bodyPart = this.bodyParts.find(bp => bp.id === bodyPartId);
    return bodyPart ? bodyPart.name : bodyPartId;
  }

  async showInjuryDetails(injury: Injury) {
    const alert = await this.alertController.create({
      header: injury.name,
      subHeader: `${injury.bodyPart} | Severidad: ${injury.severity}`,
      message: `
        <p>${injury.description}</p>
        <p><strong>Tiempo de recuperación:</strong> ${injury.recoveryTime}</p>
        <p><strong>Síntomas comunes:</strong></p>
        <ul>
          ${injury.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
        </ul>
        <p><strong>Número de ejercicios:</strong> ${injury.exercises.length}</p>
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Seleccionar lesión',
          handler: () => {
            this.selectInjury(injury);
          }
        }
      ]
    });

    await alert.present();
  }

  async selectInjury(injury: Injury) {
    this.loading = true;

    try {
      const success = await this.injuryService.selectInjury(injury.id);

      if (success) {
        const alert = await this.alertController.create({
          header: '¡Lesión seleccionada!',
          message: `Has seleccionado "${injury.name}". Ahora podrás acceder a rutinas de rehabilitación personalizadas para esta lesión.`,
          buttons: [
            {
              text: 'Ver mis rutinas',
              handler: () => {
                this.router.navigate(['/routines']);
              }
            },
            {
              text: 'Volver al inicio',
              handler: () => {
                this.router.navigate(['/home']);
              }
            }
          ]
        });

        await alert.present();
      } else {
        throw new Error('No se pudo seleccionar la lesión');
      }
    } catch (error) {
      console.error('Error selecting injury:', error);

      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Ocurrió un error al seleccionar la lesión. Por favor, inténtalo de nuevo.',
        buttons: ['OK']
      });

      await alert.present();
    } finally {
      this.loading = false;
    }
  }
}
