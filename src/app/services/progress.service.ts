import { Injectable } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, getDoc,
  query, where, orderBy
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ProgressEntry } from './routine.service';

export interface ProgressStats {
  totalWorkouts: number;
  completedWorkouts: number;
  avgPainLevel: number;
  avgDifficultyLevel: number;
  streakDays: number;
  weeklyProgress: WeeklyProgressData[];
  monthlyProgress: MonthlyProgressData;
}

export interface WeeklyProgressData {
  day: string;
  completed: number;
  pain?: number;
}

export interface MonthlyProgressData {
  labels: string[];
  completedExercises: number[];
  painLevels: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  // Obtener todas las entradas de progreso del usuario
  getUserProgress(): Observable<ProgressEntry[]> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);

        const progressRef = collection(this.firestore, 'progress');
        const userProgressQuery = query(
          progressRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );

        return collectionData(userProgressQuery, { idField: 'id' }) as Observable<ProgressEntry[]>;
      })
    );
  }

  // Obtener estadísticas de progreso del usuario
  getProgressStats(): Observable<ProgressStats> {
    return this.getUserProgress().pipe(
      map(progressEntries => {
        // Inicializar estadísticas
        const stats: ProgressStats = {
          totalWorkouts: 0,
          completedWorkouts: 0,
          avgPainLevel: 0,
          avgDifficultyLevel: 0,
          streakDays: this.calculateStreakDays(progressEntries),
          weeklyProgress: this.calculateWeeklyProgress(progressEntries),
          monthlyProgress: this.calculateMonthlyProgress(progressEntries)
        };

        if (progressEntries.length === 0) {
          return stats;
        }

        // Calcular estadísticas generales
        const uniqueRoutineIds = new Set<string>();
        let totalPain = 0;
        let painCount = 0;
        let totalDifficulty = 0;
        let difficultyCount = 0;

        progressEntries.forEach(entry => {
          uniqueRoutineIds.add(entry.routineId);

          if (entry.completed) {
            stats.completedWorkouts++;
          }

          if (entry.pain !== undefined) {
            totalPain += entry.pain;
            painCount++;
          }

          if (entry.difficulty !== undefined) {
            totalDifficulty += entry.difficulty;
            difficultyCount++;
          }
        });

        stats.totalWorkouts = uniqueRoutineIds.size;
        stats.avgPainLevel = painCount > 0 ? totalPain / painCount : 0;
        stats.avgDifficultyLevel = difficultyCount > 0 ? totalDifficulty / difficultyCount : 0;

        return stats;
      })
    );
  }

  // Calcular días consecutivos de ejercicio
  private calculateStreakDays(progressEntries: ProgressEntry[]): number {
    if (progressEntries.length === 0) return 0;

    // Ordenar por fecha (más reciente primero)
    const sortedEntries = [...progressEntries].sort((a, b) => {
      const dateA = this.getDateFromEntry(a);
      const dateB = this.getDateFromEntry(b);
      return dateB.getTime() - dateA.getTime();
    });

    // Agrupar por día
    const entriesByDay = new Map<string, ProgressEntry[]>();
    sortedEntries.forEach(entry => {
      const date = this.getDateFromEntry(entry);
      const dateStr = date.toISOString().split('T')[0];

      if (!entriesByDay.has(dateStr)) {
        entriesByDay.set(dateStr, []);
      }

      entriesByDay.get(dateStr)!.push(entry);
    });

    // Convertir a array de fechas ordenadas
    const uniqueDates = Array.from(entriesByDay.keys()).sort().reverse();

    // Calcular racha
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);

      if (i === 0) {
        // Verificar si la primera entrada es de hoy o ayer
        const timeDiff = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
        if (timeDiff > 1) break; // La racha se rompió
        streak++;
      } else {
        const prevDate = new Date(uniqueDates[i - 1]);
        const timeDiff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));

        if (timeDiff === 1) {
          // Días consecutivos
          streak++;
        } else {
          break; // La racha se rompió
        }
      }
    }

    return streak;
  }

  // Calcular datos de progreso semanal
  private calculateWeeklyProgress(progressEntries: ProgressEntry[]): WeeklyProgressData[] {
    const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const result: WeeklyProgressData[] = weekDays.map(day => ({ day, completed: 0 }));

    // Obtener fecha de hace 7 días
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Filtrar y agrupar entradas por día de la semana
    progressEntries
      .filter(entry => {
        const entryDate = this.getDateFromEntry(entry);
        return entryDate >= oneWeekAgo;
      })
      .forEach(entry => {
        const entryDate = this.getDateFromEntry(entry);
        const dayIndex = entryDate.getDay(); // 0 = Domingo, 6 = Sábado

        if (entry.completed) {
          result[dayIndex].completed++;
        }

        if (entry.pain !== undefined) {
          if (result[dayIndex].pain === undefined) {
            result[dayIndex].pain = entry.pain;
          } else {
            result[dayIndex].pain = (result[dayIndex].pain! + entry.pain) / 2;
          }
        }
      });

    return result;
  }

  // Calcular datos de progreso mensual
  private calculateMonthlyProgress(progressEntries: ProgressEntry[]): MonthlyProgressData {
    const result: MonthlyProgressData = {
      labels: [],
      completedExercises: [],
      painLevels: []
    };

    // Obtener fecha de hace 30 días
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    // Crear estructura para 30 días
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));

      const dayStr = date.getDate().toString().padStart(2, '0');
      const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');

      result.labels.push(`${dayStr}/${monthStr}`);
      result.completedExercises.push(0);
      result.painLevels.push(0);
    }

    // Agrupar entradas por día
    const entriesByDay = new Map<string, ProgressEntry[]>();

    progressEntries
      .filter(entry => {
        const entryDate = this.getDateFromEntry(entry);
        return entryDate >= oneMonthAgo;
      })
      .forEach(entry => {
        const entryDate = this.getDateFromEntry(entry);
        const dateStr = entryDate.toISOString().split('T')[0];

        if (!entriesByDay.has(dateStr)) {
          entriesByDay.set(dateStr, []);
        }

        entriesByDay.get(dateStr)!.push(entry);
      });

    // Procesar datos por día
    entriesByDay.forEach((entries, dateStr) => {
      const date = new Date(dateStr);
      const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));

      if (daysAgo < 30) {
        const index = 29 - daysAgo;

        let completedCount = 0;
        let painSum = 0;
        let painCount = 0;

        entries.forEach(entry => {
          if (entry.completed) {
            completedCount++;
          }

          if (entry.pain !== undefined) {
            painSum += entry.pain;
            painCount++;
          }
        });

        result.completedExercises[index] = completedCount;
        result.painLevels[index] = painCount > 0 ? painSum / painCount : 0;
      }
    });

    return result;
  }

  // Convertir el campo date de Firestore a objeto Date
  private getDateFromEntry(entry: ProgressEntry): Date {
    if (!entry.date) return new Date();

    if (typeof entry.date === 'object' && 'seconds' in entry.date) {
      // Timestamp de Firestore
      return new Date((entry.date as any).seconds * 1000);
    }

    // Ya es un objeto Date o string de fecha
    return new Date(entry.date);
  }
}
