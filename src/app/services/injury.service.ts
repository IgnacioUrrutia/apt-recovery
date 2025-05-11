import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, updateDoc, arrayUnion, setDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, map, switchMap, of } from 'rxjs';

export interface Injury {
  id: string;
  name: string;
  description: string;
  bodyPart: string;
  severity: string;
  recoveryTime: string;
  image: string;
  symptoms: string[];
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  sets: number;
  reps: number;
  duration?: number;
  instructions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class InjuryService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  // Obtener todas las lesiones disponibles en la base de datos
  getInjuries(): Observable<Injury[]> {
    const injuriesRef = collection(this.firestore, 'injuries');
    return collectionData(injuriesRef, { idField: 'id' }) as Observable<Injury[]>;
  }

  // Obtener lesiones por parte del cuerpo
  getInjuriesByBodyPart(bodyPart: string): Observable<Injury[]> {
    return this.getInjuries().pipe(
      map(injuries => injuries.filter(injury => injury.bodyPart === bodyPart))
    );
  }

  // Obtener una lesión específica por ID
  async getInjuryById(injuryId: string): Promise<Injury | null> {
    try {
      const injuryDoc = await getDoc(doc(this.firestore, 'injuries', injuryId));
      if (injuryDoc.exists()) {
        return { id: injuryDoc.id, ...injuryDoc.data() } as Injury;
      }
      return null;
    } catch (error) {
      console.error('Error getting injury:', error);
      return null;
    }
  }

  // Seleccionar una lesión para el usuario actual
  async selectInjury(injuryId: string): Promise<boolean> {
    try {
      const user = await this.authService.user$.pipe(take(1)).toPromise();
      if (!user) {
        throw new Error('No user is currently logged in');
      }

      // Obtener la lesión para verificar que exista
      const injury = await this.getInjuryById(injuryId);
      if (!injury) {
        throw new Error('Injury not found');
      }

      // Actualizar el perfil del usuario para incluir la lesión seleccionada
      const userDocRef = doc(this.firestore, 'users', user.uid);

      // Crear un registro de rehabilitación para esta lesión
      const rehabRef = doc(this.firestore, 'rehabilitations', `${user.uid}_${injuryId}`);
      await setDoc(rehabRef, {
        userId: user.uid,
        injuryId: injuryId,
        injuryName: injury.name,
        startDate: new Date(),
        progress: 0,
        status: 'active',
        exercises: injury.exercises.map(ex => ({
          ...ex,
          completed: false,
          progress: 0
        }))
      });

      // Añadir la lesión al array de lesiones del usuario
      await updateDoc(userDocRef, {
        injuries: arrayUnion(injuryId)
      });

      return true;
    } catch (error) {
      console.error('Error selecting injury:', error);
      return false;
    }
  }

  // Obtener las lesiones seleccionadas por el usuario actual
  getUserInjuries(): Observable<Injury[]> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);

        return this.authService.getUserProfile(user.uid).then(profile => {
          if (!profile || !profile.injuries || profile.injuries.length === 0) {
            return [];
          }

          // Obtener los detalles de cada lesión
          return Promise.all(
            profile.injuries.map(injuryId => this.getInjuryById(injuryId))
          ).then(injuries => injuries.filter(injury => injury !== null) as Injury[]);
        });
      })
    );
  }
}

// Añadir la importación faltante
import { take } from 'rxjs/operators';
