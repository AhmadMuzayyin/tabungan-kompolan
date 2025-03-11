import { defineStore } from 'pinia';
import { auth, db } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.profile?.role === 'admin',
    userRole: (state) => state.profile?.role || 'member'
  },

  actions: {
    async init() {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.user = user;
            await this.fetchUserProfile();
          } else {
            this.user = null;
            this.profile = null;
          }
          resolve(user);
          // Tidak perlu unsubscribe karena kita ingin tetap mendengarkan perubahan auth state
        });
      });
    },

    async loginWithEmail(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        await this.fetchUserProfile();
        return userCredential.user;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loginWithGoogle() {
      this.loading = true;
      this.error = null;
      const provider = new GoogleAuthProvider();

      try {
        const userCredential = await signInWithPopup(auth, provider);
        this.user = userCredential.user;

        // Cek apakah profil sudah ada, jika tidak, buat baru dengan role member
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        if (!userDoc.exists()) {
          const userData = {
            name: userCredential.user.displayName,
            email: userCredential.user.email,
            photoURL: userCredential.user.photoURL,
            role: 'member',
            createdAt: new Date().toISOString()
          };

          await setDoc(doc(db, 'users', userCredential.user.uid), userData);
          this.profile = userData;
        } else {
          await this.fetchUserProfile();
        }

        return userCredential.user;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.user = null;
        this.profile = null;
        this.router.push('/login');
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async fetchUserProfile() {
      if (!this.user) return null;

      try {
        const docRef = doc(db, 'users', this.user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.profile = docSnap.data();
          return this.profile;
        } else {
          return null;
        }
      } catch (error) {
        // console.error('Error fetching user profile:', error);
        console.error('Error fetching user profile');
        return null;
      }
    }
  }
});