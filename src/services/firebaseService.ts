/**
 * FANGKHAM ASSET & BORROW SYSTEM - Firebase Cloud Service
 * ระบบเชื่อมต่อ Firebase Cloud Firestore & Realtime Database แบบ Real-time
 * โปรเจกต์: duty-fangkham (อบต.ฝางคำ)
 * มีระบบ LocalStorage Fallback อัตโนมัติเมื่อออฟไลน์
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  Firestore 
} from 'firebase/firestore';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue,
  off,
  Database as RTDatabase 
} from 'firebase/database';
import {
  Asset,
  CitizenBorrower,
  EmployeeBorrower,
  BorrowRequest,
  QueueItem,
  DamageCase,
  LostCase,
  AuditLog,
  SystemRuleConfig,
  OrgSettings,
} from '../types';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// คอนฟิก Firebase โปรเจกต์ duty-fangkham ของ อบต.ฝางคำ
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyCmCyAPpiFe4NIuyaTCQ400J0iN4NpiX6c",
  authDomain: "duty-fangkham.firebaseapp.com",
  databaseURL: "https://duty-fangkham-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "duty-fangkham",
  storageBucket: "duty-fangkham.firebasestorage.app",
  messagingSenderId: "223843550015",
  appId: "1:223843550015:web:5b7e007de0c5196002498a",
  measurementId: "G-LC6LW3X625"
};

const ROOT_PATH = 'borrow_system';

class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private rtdb: RTDatabase | null = null;
  private isConnected = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  public init(customConfig?: FirebaseConfig) {
    const config = customConfig || DEFAULT_FIREBASE_CONFIG;
    try {
      if (getApps().length === 0) {
        this.app = initializeApp(config);
      } else {
        this.app = getApp();
      }

      if (this.app) {
        // Firestore
        try {
          this.db = getFirestore(this.app);
        } catch (e) {
          console.warn('[Firebase] Firestore init notice:', e);
        }

        // Realtime Database
        try {
          if (config.databaseURL) {
            this.rtdb = getDatabase(this.app, config.databaseURL);
          } else {
            this.rtdb = getDatabase(this.app);
          }
        } catch (e) {
          console.warn('[Firebase] RTDB init notice:', e);
        }

        this.isConnected = true;
        console.log('[Firebase] Connected to project:', config.projectId);
      }
    } catch (e) {
      console.warn('[Firebase] Initialization error (using LocalStorage fallback):', e);
      this.isConnected = false;
    }
  }

  public getStatus(): boolean {
    return this.isConnected;
  }

  // ==========================================
  // SYNC TO CLOUD (SAVE ALL DATA)
  // ==========================================
  public async syncAllToCloud(payload: {
    assets: Asset[];
    citizens: CitizenBorrower[];
    employees: EmployeeBorrower[];
    borrowRequests: BorrowRequest[];
    queues: QueueItem[];
    damageCases: DamageCase[];
    lostCases: LostCase[];
    auditLogs: AuditLog[];
    rulesConfig: SystemRuleConfig;
    orgSettings: OrgSettings;
  }): Promise<boolean> {
    if (!this.rtdb && !this.db) return false;

    try {
      // 1. Sync to Realtime Database
      if (this.rtdb) {
        const rootRef = ref(this.rtdb, ROOT_PATH);
        await set(rootRef, {
          ...payload,
          lastUpdated: new Date().toISOString()
        });
      }

      // 2. Sync to Firestore as backup / search index
      if (this.db) {
        await setDoc(doc(this.db, ROOT_PATH, 'settings'), payload.orgSettings, { merge: true });
        await setDoc(doc(this.db, ROOT_PATH, 'rules'), payload.rulesConfig, { merge: true });
      }

      return true;
    } catch (e) {
      console.warn('[Firebase] syncAllToCloud error:', e);
      return false;
    }
  }

  // ==========================================
  // SYNC FROM CLOUD (FETCH ALL DATA)
  // ==========================================
  public async fetchAllFromCloud(): Promise<{
    assets?: Asset[];
    citizens?: CitizenBorrower[];
    employees?: EmployeeBorrower[];
    borrowRequests?: BorrowRequest[];
    queues?: QueueItem[];
    damageCases?: DamageCase[];
    lostCases?: LostCase[];
    auditLogs?: AuditLog[];
    rulesConfig?: SystemRuleConfig;
    orgSettings?: OrgSettings;
  } | null> {
    if (this.rtdb) {
      try {
        const snapshot = await get(ref(this.rtdb, ROOT_PATH));
        if (snapshot.exists()) {
          const val = snapshot.val();
          return {
            assets: val.assets || undefined,
            citizens: val.citizens || undefined,
            employees: val.employees || undefined,
            borrowRequests: val.borrowRequests || undefined,
            queues: val.queues || undefined,
            damageCases: val.damageCases || undefined,
            lostCases: val.lostCases || undefined,
            auditLogs: val.auditLogs || undefined,
            rulesConfig: val.rulesConfig || undefined,
            orgSettings: val.orgSettings || undefined,
          };
        }
      } catch (e) {
        console.warn('[Firebase RTDB] Fetch error:', e);
      }
    }
    return null;
  }

  // ==========================================
  // REAL-TIME LISTENER FOR UPDATES
  // ==========================================
  public subscribeToUpdates(onUpdate: (data: any) => void): () => void {
    if (!this.rtdb) {
      return () => {};
    }

    try {
      const dataRef = ref(this.rtdb, ROOT_PATH);
      const callback = (snapshot: any) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.val());
        }
      };

      onValue(dataRef, callback);

      const unsubscribe = () => {
        off(dataRef, 'value', callback);
      };
      this.listeners.push(unsubscribe);
      return unsubscribe;
    } catch (e) {
      console.warn('[Firebase] Subscription error:', e);
      return () => {};
    }
  }

  // ==========================================
  // UPDATE SPECIFIC ENTITIES
  // ==========================================
  public async saveBorrowRequests(requests: BorrowRequest[]) {
    if (this.rtdb) {
      try {
        await set(ref(this.rtdb, `${ROOT_PATH}/borrowRequests`), requests);
      } catch (e) {
        console.warn('[Firebase] saveBorrowRequests notice:', e);
      }
    }
  }

  public async saveAssets(assets: Asset[]) {
    if (this.rtdb) {
      try {
        await set(ref(this.rtdb, `${ROOT_PATH}/assets`), assets);
      } catch (e) {
        console.warn('[Firebase] saveAssets notice:', e);
      }
    }
  }

  public async saveQueues(queues: QueueItem[]) {
    if (this.rtdb) {
      try {
        await set(ref(this.rtdb, `${ROOT_PATH}/queues`), queues);
      } catch (e) {
        console.warn('[Firebase] saveQueues notice:', e);
      }
    }
  }
}

export const firebaseService = new FirebaseService();
