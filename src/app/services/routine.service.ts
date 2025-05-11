import { Injectable } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, getDoc, updateDoc,
  query, where, limit, orderBy, DocumentReference, setDoc
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, of, from, combineLatest } from 'rxjs';
import { switchMap, map, take } from 'rxjs/operators';
import { Exercise } from './injury.service';

export interface RoutineExercise extends Exercise {
  completed: boolean;
  progress: number;
  lastCompletedDate?: Date;
  // Propiedades adicionales para la UI
  painLevel?: number;
  difficultyLevel?: number;
  notes?: string;
}

export interface Routine {
  id: string;
  userId: string;
  injuryId: string;
  injuryName: string;
  date: Date;
  completed: boolean;
  progress: number;
  exercises: RoutineExercise[];
}

export interface ProgressEntry {
  id: string;
  userId: string;
  routineId: string;
  exerciseId: string;
  exerciseName: string;
  date: Date;
  completed: boolean;
  notes?: string;
  pain?: number; // Escala de dolor: 0-10
  difficulty?: number; // Escala de dificultad: 0-10
  duration?: number; // Duración en minutos
}

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  // Obtener las rutinas del usuario actual
  getUserRoutines(): Observable<Routine[]> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);

        const routinesRef = collection(this.firestore, 'routines');
        const userRoutinesQuery = query(
          routinesRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );

        return collectionData(userRoutinesQuery, { idField: 'id' }) as Observable<Routine[]>;
      })
    );
  }

  // Obtener rutina diaria
  getDailyRoutine(): Observable<Routine | null> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return of(null);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const routinesRef = collection(this.firestore, 'routines');
        const todayRoutineQuery = query(
          routinesRef,
          where('userId', '==', user.uid),
          where('date', '>=', today),
          orderBy('date', 'asc'),
          limit(1)
        );

        return collectionData(todayRoutineQuery, { idField: 'id' }).pipe(
          map(routines => routines.length > 0 ? routines[0] as Routine : null)
        );
      })
    );
  }

  // Obtener una rutina específica
  async getRoutineById(routineId: string): Promise<Routine | null> {
    try {
      const routineDoc = await getDoc(doc(this.firestore, 'routines', routineId));
      if (routineDoc.exists()) {
        return { id: routineDoc.id, ...routineDoc.data() } as Routine;
      }
      return null;
    } catch (error) {
      console.error('Error getting routine:', error);
      return null;
    }
  }

  // Marcar ejercicio como completado
  async completeExercise(routineId: string, exerciseId: string, completed: boolean, progressData?: Partial<ProgressEntry>): Promise<boolean> {
    try {
      const user = await this.authService.user$.pipe(take(1)).toPromise();
      if (!user) {
        throw new Error('No user logged in');
      }

      // Obtener la rutina actual
      const routine = await this.getRoutineById(routineId);
      if (!routine) {
        throw new Error('Routine not found');
      }

      // Actualizar el ejercicio
      const updatedExercises = routine.exercises.map(ex =>
        ex.id === exerciseId ?
        { ...ex, completed, lastCompletedDate: new Date() } :
        ex
      );

      // Calcular el progreso general de la rutina
      const totalExercises = updatedExercises.length;
      const completedExercises = updatedExercises.filter(ex => ex.completed).length;
      const routineProgress = totalExercises > 0 ? completedExercises / totalExercises : 0;

      // Actualizar la rutina
      const routineRef = doc(this.firestore, 'routines', routineId);
      await updateDoc(routineRef, {
        exercises: updatedExercises,
        progress: routineProgress,
        completed: routineProgress === 1
      });

      // Registrar el progreso si se proporcionan datos
      if (progressData) {
        const progressRef = doc(collection(this.firestore, 'progress'));
        await setDoc(progressRef, {
          userId: user.uid,
          routineId,
          exerciseId,
          exerciseName: updatedExercises.find(ex => ex.id === exerciseId)?.name || '',
          date: new Date(),
          completed,
          ...progressData
        });
      }

      // Actualizar el progreso general de rehabilitación
      await this.updateRehabilitationProgress(routine.userId, routine.injuryId);

      return true;
    } catch (error) {
      console.error('Error completing exercise:', error);
      return false;
    }
  }

  // Actualizar el progreso general de rehabilitación
  private async updateRehabilitationProgress(userId: string, injuryId: string): Promise<void> {
    try {
      const rehabRef = doc(this.firestore, 'rehabilitations', `${userId}_${injuryId}`);
      const rehabDoc = await getDoc(rehabRef);

      if (rehabDoc.exists()) {
        // Obtener todas las rutinas para esta rehabilitación
        const routinesRef = collection(this.firestore, 'routines');
        const routinesQuery = query(
          routinesRef,
          where('userId', '==', userId),
          where('injuryId', '==', injuryId)
        );

        const routinesSnapshot = await collectionData(routinesQuery, { idField: 'id' }).pipe(take(1)).toPromise();
        const routines = routinesSnapshot as Routine[];

        // Calcular el progreso general
        const totalProgress = routines.reduce((sum, routine) => sum + routine.progress, 0);
        const overallProgress = routines.length > 0 ? totalProgress / routines.length : 0;

        // Actualizar el documento de rehabilitación
        await updateDoc(rehabRef, {
          progress: overallProgress,
          status: overallProgress >= 1 ? 'completed' : 'active'
        });
      }
    } catch (error) {
      console.error('Error updating rehabilitation progress:', error);
    }
  }

  // Generar rutina para el día actual (si no existe)
  async generateDailyRoutine(): Promise<string | null> {
    try {
      const user = await this.authService.user$.pipe(take(1)).toPromise();
      if (!user) {
        throw new Error('No user logged in');
      }

      // Verificar si ya existe una rutina para hoy
      const existingRoutine = await this.getDailyRoutine().pipe(take(1)).toPromise();
      if (existingRoutine) {
        return existingRoutine.id;
      }

      // Obtener la rehabilitación activa del usuario
      const userProfile = await this.authService.getUserProfile(user.uid);
      if (!userProfile || !userProfile.injuries || userProfile.injuries.length === 0) {
        throw new Error('No active injuries found');
      }

      const injuryId = userProfile.injuries[0]; // Tomamos la primera lesión
      const rehabRef = doc(this.firestore, 'rehabilitations', `${user.uid}_${injuryId}`);
      const rehabDoc = await getDoc(rehabRef);

      if (!rehabDoc.exists()) {
        throw new Error('No rehabilitation plan found');
      }

      const rehabData = rehabDoc.data();

      // Crear la rutina del día
      const routineRef = doc(collection(this.firestore, 'routines'));
      await setDoc(routineRef, {
        userId: user.uid,
        injuryId,
        injuryName: rehabData['injuryName'],
        date: new Date(),
        completed: false,
        progress: 0,
        exercises: rehabData['exercises'] || []
      });

      return routineRef.id;
    } catch (error) {
      console.error('Error generating daily routine:', error);
      return null;
    }
  }

  // Obtener historial de progreso para un ejercicio
  getExerciseProgressHistory(exerciseId: string): Observable<ProgressEntry[]> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);

        const progressRef = collection(this.firestore, 'progress');
        const progressQuery = query(
          progressRef,
          where('userId', '==', user.uid),
          where('exerciseId', '==', exerciseId),
          orderBy('date', 'desc')
        );

        return collectionData(progressQuery, { idField: 'id' }) as Observable<ProgressEntry[]>;
      })
    );
  }
}
