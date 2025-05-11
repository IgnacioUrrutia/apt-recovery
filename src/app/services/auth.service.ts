import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, user, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  injuries?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.user$ = user(this.auth);
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: credential.user.uid,
        email: credential.user.email as string,
        displayName,
        createdAt: Date.now(),
        injuries: []
      };

      await setDoc(doc(this.firestore, 'users', credential.user.uid), userProfile);

      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}
