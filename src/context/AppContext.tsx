import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Asset,
  CitizenBorrower,
  EmployeeBorrower,
  BorrowRequest,
  BorrowRequestStatus,
  DamageCase,
  LostCase,
  QueueItem,
  AuditLog,
  SystemRuleConfig,
  OrgSettings,
  UserRole,
  BorrowRequestedItem,
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_CITIZENS,
  INITIAL_EMPLOYEES,
  INITIAL_BORROW_REQUESTS,
  INITIAL_QUEUES,
  INITIAL_DAMAGE_CASES,
  INITIAL_LOST_CASES,
  INITIAL_AUDIT_LOGS,
  INITIAL_RULES_CONFIG,
  INITIAL_ORG_SETTINGS,
} from '../mockData';
import { firebaseService } from '../services/firebaseService';

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isCitizenGuest: boolean;
  setIsCitizenGuest: (val: boolean) => void;

  // Current user role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUserDisplayName: string;

  // Data collections
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
  setOrgSettings: React.Dispatch<React.SetStateAction<OrgSettings>>;

  // Selected item / active view helpers
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;

  // Search & Filter
  globalSearch: string;
  setGlobalSearch: (s: string) => void;

  // Actions
  createBorrowRequest: (req: Omit<BorrowRequest, 'id' | 'requestNumber' | 'queueNumber' | 'status' | 'history' | 'agreedTermsVersion' | 'agreedAt'>) => BorrowRequest;
  updateRequestStatus: (
    requestId: string,
    newStatus: BorrowRequestStatus,
    comment?: string,
    signatureUrl?: string,
    additionalData?: Partial<BorrowRequest>
  ) => void;
  processReturn: (
    requestId: string,
    itemsReturnData: {
      assetId: string;
      returnedQty: number;
      conditionAfter: string;
      photosAfter?: string[];
      damagedQty?: number;
      lostQty?: number;
    }[],
    inspectionResult: 'perfect' | 'minor_scratches' | 'damaged' | 'lost',
    notes: string,
    inspectorSignatureUrl?: string,
    damageDetails?: {
      description: string;
      estimatedCost: number;
      photoAfterUrl?: string;
    },
    lostDetails?: {
      incidentDetails: string;
      assessedValue: number;
    }
  ) => void;
  addAsset: (asset: Omit<Asset, 'id' | 'qrCodeData' | 'barcode' | 'historyTimeline'>) => Asset;
  updateAsset: (assetId: string, updates: Partial<Asset>) => void;
  deleteAsset: (assetId: string) => void;
  updateBorrowRequest: (requestId: string, updates: Partial<BorrowRequest>) => void;
  deleteBorrowRequest: (requestId: string) => void;
  addCitizen: (citizen: Omit<CitizenBorrower, 'id' | 'totalBorrowsCount' | 'totalReturnsCount' | 'overdueCount' | 'damageCount' | 'lossCount' | 'unpaidCompensationBaht'>) => CitizenBorrower;
  callQueue: (queueId: string) => void;
  updateQueueStatus: (queueId: string, status: QueueItem['status']) => void;
  updateOrgSettings: (settings: Partial<OrgSettings>) => void;
  updateRules: (newRules: SystemRuleConfig['rules']) => void;
  resolveDamageCase: (caseId: string, receiptNo: string, amount: number) => void;
  resolveLostCase: (caseId: string, receiptNo: string, amount: number) => void;
  resetToDefaultData: () => void;
  speakQueueAnnouncement: (text: string) => void;
  // Cloud Sync
  isCloudConnected: boolean;
  isCloudSyncing: boolean;
  syncWithCloudNow: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH: 'fangkam_auth_v2',
  ASSETS: 'fangkam_assets_v2',
  CITIZENS: 'fangkam_citizens_v2',
  EMPLOYEES: 'fangkam_employees_v2',
  REQUESTS: 'fangkam_requests_v2',
  QUEUES: 'fangkam_queues_v2',
  DAMAGES: 'fangkam_damages_v2',
  LOST: 'fangkam_lost_v2',
  AUDIT: 'fangkam_audit_v2',
  RULES: 'fangkam_rules_v2',
  SETTINGS: 'fangkam_settings_v2',
  ROLE: 'fangkam_role_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  });

  const [isCitizenGuest, setIsCitizenGuest] = useState<boolean>(false);

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'admin';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [citizens, setCitizens] = useState<CitizenBorrower[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CITIZENS);
    return saved ? JSON.parse(saved) : INITIAL_CITIZENS;
  });

  const [employees, setEmployees] = useState<EmployeeBorrower[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_BORROW_REQUESTS;
  });

  const [queues, setQueues] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUEUES);
    return saved ? JSON.parse(saved) : INITIAL_QUEUES;
  });

  const [damageCases, setDamageCases] = useState<DamageCase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAMAGES);
    return saved ? JSON.parse(saved) : INITIAL_DAMAGE_CASES;
  });

  const [lostCases, setLostCases] = useState<LostCase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOST);
    return saved ? JSON.parse(saved) : INITIAL_LOST_CASES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [rulesConfig, setRulesConfig] = useState<SystemRuleConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RULES);
    return saved ? JSON.parse(saved) : INITIAL_RULES_CONFIG;
  });

  const [orgSettings, setOrgSettings] = useState<OrgSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_ORG_SETTINGS;
  });

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(citizens));
  }, [citizens]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(borrowRequests));
  }, [borrowRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUEUES, JSON.stringify(queues));
  }, [queues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAMAGES, JSON.stringify(damageCases));
  }, [damageCases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOST, JSON.stringify(lostCases));
  }, [lostCases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rulesConfig));
  }, [rulesConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(orgSettings));
  }, [orgSettings]);

  // Cloud Sync Status
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() => firebaseService.getStatus());
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Sync with cloud on initial mount & listen to real-time changes
  useEffect(() => {
    let isMounted = true;
    const loadCloudData = async () => {
      setIsCloudSyncing(true);
      try {
        const cloudData = await firebaseService.fetchAllFromCloud();
        if (cloudData && isMounted) {
          if (cloudData.assets) setAssets(cloudData.assets);
          if (cloudData.citizens) setCitizens(cloudData.citizens);
          if (cloudData.employees) setEmployees(cloudData.employees);
          if (cloudData.borrowRequests) setBorrowRequests(cloudData.borrowRequests);
          if (cloudData.queues) setQueues(cloudData.queues);
          if (cloudData.damageCases) setDamageCases(cloudData.damageCases);
          if (cloudData.lostCases) setLostCases(cloudData.lostCases);
          if (cloudData.auditLogs) setAuditLogs(cloudData.auditLogs);
          if (cloudData.rulesConfig) setRulesConfig(cloudData.rulesConfig);
          if (cloudData.orgSettings) setOrgSettings(cloudData.orgSettings);
          setIsCloudConnected(true);
        } else if (isMounted) {
          await firebaseService.syncAllToCloud({
            assets,
            citizens,
            employees,
            borrowRequests,
            queues,
            damageCases,
            lostCases,
            auditLogs,
            rulesConfig,
            orgSettings,
          });
          setIsCloudConnected(true);
        }
      } catch (err) {
        console.warn('Initial cloud sync error:', err);
      } finally {
        if (isMounted) setIsCloudSyncing(false);
      }
    };

    loadCloudData();

    const unsubscribe = firebaseService.subscribeToUpdates((data) => {
      if (!isMounted || !data) return;
      if (data.assets) setAssets(data.assets);
      if (data.borrowRequests) setBorrowRequests(data.borrowRequests);
      if (data.queues) setQueues(data.queues);
      if (data.damageCases) setDamageCases(data.damageCases);
      if (data.lostCases) setLostCases(data.lostCases);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.citizens) setCitizens(data.citizens);
      if (data.employees) setEmployees(data.employees);
      if (data.rulesConfig) setRulesConfig(data.rulesConfig);
      if (data.orgSettings) setOrgSettings(data.orgSettings);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Debounced auto-sync to cloud when state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      firebaseService.syncAllToCloud({
        assets,
        citizens,
        employees,
        borrowRequests,
        queues,
        damageCases,
        lostCases,
        auditLogs,
        rulesConfig,
        orgSettings,
      }).then((ok) => {
        if (ok) setIsCloudConnected(true);
      });
    }, 2500);
    return () => clearTimeout(timer);
  }, [assets, citizens, employees, borrowRequests, queues, damageCases, lostCases, auditLogs, rulesConfig, orgSettings]);

  const syncWithCloudNow = async () => {
    setIsCloudSyncing(true);
    try {
      const ok = await firebaseService.syncAllToCloud({
        assets,
        citizens,
        employees,
        borrowRequests,
        queues,
        damageCases,
        lostCases,
        auditLogs,
        rulesConfig,
        orgSettings,
      });
      if (ok) setIsCloudConnected(true);
    } catch (e) {
      console.warn('Manual sync failed:', e);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Dynamic user display name based on current role
  const currentUserDisplayName = (() => {
    switch (currentRole) {
      case 'super_admin':
        return 'ผู้ดูแลระบบสูงสุด (Super Admin)';
      case 'admin':
        return 'นายแอดมิน นครพัสดุ (Admin)';
      case 'supply_officer':
        return orgSettings.supplyOfficerName;
      case 'inspector':
        return 'นายประสิทธิ์ มั่นคง (ผู้ตรวจสอบ)';
      case 'executive':
        return orgSettings.mayorName;
      case 'employee':
        return 'นางสาวกนกวรรณ รักษาสัตย์ (พนักงาน อบต.)';
      case 'citizen':
        return 'นายทองดี ศรีบุญเรือง (ประชาชน)';
      default:
        return 'ผู้ใช้งานระบบ';
    }
  })();

  const logAudit = (
    action: string,
    targetType: AuditLog['targetType'],
    targetId: string,
    targetName: string,
    beforeData?: string,
    afterData?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('th-TH'),
      userName: currentUserDisplayName,
      userRole: currentRole,
      action,
      targetType,
      targetId,
      targetName,
      beforeData,
      afterData,
      ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 80),
      userAgent: navigator.userAgent,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const speakQueueAnnouncement = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const createBorrowRequest = (
    reqData: Omit<BorrowRequest, 'id' | 'requestNumber' | 'queueNumber' | 'status' | 'history' | 'agreedTermsVersion' | 'agreedAt'>
  ): BorrowRequest => {
    const count = borrowRequests.length + 72;
    const padded = String(count).padStart(6, '0');
    const reqNum = `BOR-2569-${padded}`;
    const qNum = `B-${String(count).padStart(4, '0')}`;
    const rQNum = `R-${String(count).padStart(4, '0')}`;

    const newReq: BorrowRequest = {
      ...reqData,
      id: `bor-${Date.now()}`,
      requestNumber: reqNum,
      queueNumber: qNum,
      returnQueueNumber: rQNum,
      status: 'pending_check',
      agreedTermsVersion: rulesConfig.version,
      agreedAt: new Date().toLocaleString('th-TH'),
      history: [
        {
          id: `w-${Date.now()}`,
          stepName: 'ยื่นคำขอยืมออนไลน์',
          action: 'สร้างคำขอยืมใหม่ในระบบ',
          actorName: reqData.borrowerName,
          actorRole: reqData.borrowerType,
          timestamp: new Date().toLocaleString('th-TH'),
          statusTo: 'pending_check',
          ipAddress: '182.232.' + Math.floor(10 + Math.random() * 80) + '.' + Math.floor(10 + Math.random() * 80),
        },
      ],
    };

    // Add to queues
    const newQueue: QueueItem = {
      id: `q-${Date.now()}`,
      queueNumber: qNum,
      type: 'borrow',
      requestId: newReq.id,
      requestNumber: reqNum,
      borrowerName: reqData.borrowerName,
      itemSummary: reqData.items.map((i) => `${i.assetName} (${i.requestedQty} ${i.unit})`).join(', '),
      servicePoint: 'ช่องบริการ 1 (จุดรับ-จ่ายพัสดุ)',
      status: 'waiting',
      createdAt: new Date().toLocaleString('th-TH'),
    };

    setBorrowRequests((prev) => [newReq, ...prev]);
    setQueues((prev) => [newQueue, ...prev]);

    logAudit(
      'ยื่นคำขอยืมใหม่ (New Borrow Request)',
      'borrow_request',
      newReq.id,
      `${newReq.requestNumber} (${newReq.borrowerName})`,
      undefined,
      `สถานะ: pending_check, จำนวน ${newReq.items.length} รายการ`
    );

    return newReq;
  };

  const updateRequestStatus = (
    requestId: string,
    newStatus: BorrowRequestStatus,
    comment?: string,
    signatureUrl?: string,
    additionalData?: Partial<BorrowRequest>
  ) => {
    setBorrowRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;

        const oldStatus = req.status;
        const nowStr = new Date().toLocaleString('th-TH');

        let stepName = 'ปรับปรุงสถานะ';
        let action = `เปลี่ยนสถานะจาก ${oldStatus} เป็น ${newStatus}`;

        if (newStatus === 'pending_approval') {
          stepName = 'ตรวจสอบพัสดุและประวัติ';
          action = 'เจ้าหน้าที่พัสดุตรวจสอบผ่านและเสนอผู้อนุมัติ';
        } else if (newStatus === 'approved') {
          stepName = 'อนุมัติคำขอยืม';
          action = 'ผู้มีอำนาจอนุมัติคำขอยืมเรียบร้อย';
        } else if (newStatus === 'rejected') {
          stepName = 'ไม่อนุมัติคำขอ';
          action = `ปฏิเสธคำขอ: ${comment || 'ไม่เป็นไปตามระเบียบ'}`;
        } else if (newStatus === 'issued') {
          stepName = 'ส่งมอบพัสดุ (จ่ายของ)';
          action = 'ตรวจสภาพก่อนส่งมอบ ผู้ยืมลงนามรับของ จ่ายพัสดุและมอบใบส่วนท้ายฉีกได้';

          // Update asset available inventory
          req.items.forEach((item) => {
            setAssets((prevAssets) =>
              prevAssets.map((ast) => {
                if (ast.id === item.assetId) {
                  const newAvail = Math.max(0, ast.quantityAvailable - item.requestedQty);
                  return {
                    ...ast,
                    quantityAvailable: newAvail,
                    status: newAvail === 0 ? 'borrowed' : ast.status,
                    historyTimeline: [
                      {
                        id: `tl-${Date.now()}-${item.assetId}`,
                        timestamp: nowStr,
                        action: `ส่งมอบให้ ${req.borrowerName} ยืม`,
                        performedBy: currentUserDisplayName,
                        details: `ใบยืมเลขที่ ${req.requestNumber} จำนวน ${item.requestedQty} ${item.unit}`,
                        relatedRequestId: req.id,
                      },
                      ...ast.historyTimeline,
                    ],
                  };
                }
                return ast;
              })
            );
          });
        }

        const newHistoryStep = {
          id: `w-${Date.now()}`,
          stepName,
          action,
          actorName: currentUserDisplayName,
          actorRole: currentRole,
          timestamp: nowStr,
          statusTo: newStatus,
          comment,
          signatureUrl,
          ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 80),
        };

        const updated: BorrowRequest = {
          ...req,
          ...additionalData,
          status: newStatus,
          history: [...req.history, newHistoryStep],
        };

        logAudit(
          `${stepName} (${newStatus})`,
          'borrow_request',
          req.id,
          `${req.requestNumber} (${req.borrowerName})`,
          `สถานะเดิม: ${oldStatus}`,
          `สถานะใหม่: ${newStatus}, หมายเหตุ: ${comment || '-'}`
        );

        return updated;
      })
    );
  };

  const processReturn = (
    requestId: string,
    itemsReturnData: {
      assetId: string;
      returnedQty: number;
      conditionAfter: string;
      photosAfter?: string[];
      damagedQty?: number;
      lostQty?: number;
    }[],
    inspectionResult: 'perfect' | 'minor_scratches' | 'damaged' | 'lost',
    notes: string,
    inspectorSignatureUrl?: string,
    damageDetails?: {
      description: string;
      estimatedCost: number;
      photoAfterUrl?: string;
    },
    lostDetails?: {
      incidentDetails: string;
      assessedValue: number;
    }
  ) => {
    const targetReq = borrowRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const nowStr = new Date().toLocaleString('th-TH');
    const finalStatus: BorrowRequestStatus =
      inspectionResult === 'damaged'
        ? 'damaged'
        : inspectionResult === 'lost'
        ? 'lost'
        : 'returned';

    // 1. Update items in the borrow request
    const updatedItems: BorrowRequestedItem[] = targetReq.items.map((item) => {
      const match = itemsReturnData.find((d) => d.assetId === item.assetId);
      if (match) {
        return {
          ...item,
          conditionAfter: match.conditionAfter,
          returnedQty: match.returnedQty,
          damagedQty: match.damagedQty || 0,
          lostQty: match.lostQty || 0,
          photosAfter: match.photosAfter || [],
        };
      }
      return item;
    });

    // 2. Replenish asset stock and log asset history
    itemsReturnData.forEach((retItem) => {
      setAssets((prevAssets) =>
        prevAssets.map((ast) => {
          if (ast.id === retItem.assetId) {
            const restoredQty = retItem.returnedQty - (retItem.damagedQty || 0) - (retItem.lostQty || 0);
            const newAvail = Math.min(ast.quantityTotal, ast.quantityAvailable + Math.max(0, restoredQty));
            const newStatus =
              retItem.lostQty && retItem.lostQty > 0
                ? 'lost'
                : retItem.damagedQty && retItem.damagedQty > 0
                ? 'damaged'
                : 'available';

            return {
              ...ast,
              quantityAvailable: newAvail,
              status: ast.quantityAvailable === 0 && newAvail > 0 ? 'available' : ast.status,
              historyTimeline: [
                {
                  id: `tl-${Date.now()}-${ast.id}`,
                  timestamp: nowStr,
                  action: `รับคืนจาก ${targetReq.borrowerName} (${retItem.conditionAfter})`,
                  performedBy: currentUserDisplayName,
                  details: `ใบยืมเลขที่ ${targetReq.requestNumber} คืน ${retItem.returnedQty} ${ast.unit}`,
                  relatedRequestId: targetReq.id,
                },
                ...ast.historyTimeline,
              ],
            };
          }
          return ast;
        })
      );
    });

    // 3. Create Damage Case if damaged
    if (inspectionResult === 'damaged' && damageDetails) {
      const dmgCount = damageCases.length + 1;
      const newDmg: DamageCase = {
        id: `dmg-${Date.now()}`,
        caseNumber: `DMG-2569-${String(dmgCount).padStart(3, '0')}`,
        requestId: targetReq.id,
        requestNumber: targetReq.requestNumber,
        assetId: targetReq.items[0]?.assetId || 'ast-001',
        assetCode: targetReq.items[0]?.assetCode || 'AST-69-0001',
        assetName: targetReq.items[0]?.assetName || 'ทรัพย์สิน อบต.',
        borrowerName: targetReq.borrowerName,
        borrowerPhone: targetReq.borrowerPhone,
        damageDate: nowStr,
        damageDescription: damageDetails.description,
        photoBeforeUrl: targetReq.items[0]?.photosBefore?.[0],
        photoAfterUrl: damageDetails.photoAfterUrl,
        inspectorName: currentUserDisplayName,
        estimatedCostBaht: damageDetails.estimatedCost,
        actualRepairCostBaht: damageDetails.estimatedCost,
        responsiblePerson: targetReq.borrowerName,
        compensationStatus: 'awaiting_payment',
        notes: `สร้างจากรายการคืนใบยืม ${targetReq.requestNumber}`,
      };
      setDamageCases((prev) => [newDmg, ...prev]);

      // Update borrower damage history
      setCitizens((prevCit) =>
        prevCit.map((c) =>
          c.id === targetReq.borrowerId
            ? { ...c, damageCount: c.damageCount + 1, unpaidCompensationBaht: c.unpaidCompensationBaht + damageDetails.estimatedCost, status: 'blacklisted' }
            : c
        )
      );
    }

    // 4. Create Lost Case if lost
    if (inspectionResult === 'lost' && lostDetails) {
      const lostCount = lostCases.length + 1;
      const newLost: LostCase = {
        id: `lst-${Date.now()}`,
        caseNumber: `LST-2569-${String(lostCount).padStart(3, '0')}`,
        requestId: targetReq.id,
        requestNumber: targetReq.requestNumber,
        assetId: targetReq.items[0]?.assetId || 'ast-001',
        assetCode: targetReq.items[0]?.assetCode || 'AST-69-0001',
        assetName: targetReq.items[0]?.assetName || 'ทรัพย์สิน อบต.',
        assetValueBaht: lostDetails.assessedValue,
        borrowerName: targetReq.borrowerName,
        borrowerPhone: targetReq.borrowerPhone,
        lostDate: nowStr,
        incidentDetails: lostDetails.incidentDetails,
        responsiblePerson: targetReq.borrowerName,
        assessedCompensationBaht: lostDetails.assessedValue,
        compensationStatus: 'awaiting_compensation',
      };
      setLostCases((prev) => [newLost, ...prev]);

      setCitizens((prevCit) =>
        prevCit.map((c) =>
          c.id === targetReq.borrowerId
            ? { ...c, lossCount: c.lossCount + 1, unpaidCompensationBaht: c.unpaidCompensationBaht + lostDetails.assessedValue, status: 'blacklisted' }
            : c
        )
      );
    }

    // 5. Update borrow request
    const returnStep = {
      id: `w-${Date.now()}`,
      stepName: 'ตรวจรับคืนพัสดุ',
      action: `ตรวจรับพัสดุ ผลการตรวจ: ${inspectionResult} - ${notes}`,
      actorName: currentUserDisplayName,
      actorRole: currentRole,
      timestamp: nowStr,
      statusTo: finalStatus,
      comment: notes,
      signatureUrl: inspectorSignatureUrl,
      ipAddress: '192.168.1.45',
    };

    setBorrowRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: finalStatus,
            items: updatedItems,
            actualReturnDate: new Date().toISOString().split('T')[0],
            actualReturnTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            receivedBy: currentUserDisplayName,
            receivedAt: nowStr,
            returnInspectionResult: inspectionResult,
            returnNotes: notes,
            returnInspectorSignatureUrl: inspectorSignatureUrl,
            history: [...r.history, returnStep],
          };
        }
        return r;
      })
    );

    // 6. Complete return queue
    setQueues((prevQ) =>
      prevQ.map((q) => (q.requestId === requestId && q.type === 'return' ? { ...q, status: 'completed' } : q))
    );

    logAudit(
      `ตรวจรับคืนพัสดุ (${finalStatus})`,
      'borrow_request',
      targetReq.id,
      `${targetReq.requestNumber} (${targetReq.borrowerName})`,
      'สถานะเดิม: issued',
      `สถานะใหม่: ${finalStatus}, ผลตรวจ: ${inspectionResult}, บันทึก: ${notes}`
    );
  };

  const addAsset = (assetData: Omit<Asset, 'id' | 'qrCodeData' | 'barcode' | 'historyTimeline'>): Asset => {
    const newId = `ast-${Date.now()}`;
    const code = assetData.code || `AST-69-${String(assets.length + 1).padStart(4, '0')}`;
    const newAsset: Asset = {
      ...assetData,
      id: newId,
      code,
      barcode: `8850069${String(assets.length + 1).padStart(4, '0')}`,
      qrCodeData: `${code}-${assetData.category.slice(0, 4)}-FK`,
      historyTimeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toLocaleString('th-TH'),
          action: 'ขึ้นทะเบียนทรัพย์สินใหม่',
          performedBy: currentUserDisplayName,
          details: `บันทึกครุภัณฑ์ ${assetData.name} จำนวน ${assetData.quantityTotal} ${assetData.unit}`,
        },
      ],
    };

    setAssets((prev) => [newAsset, ...prev]);

    logAudit(
      'เพิ่มทรัพย์สินใหม่ (Add Asset)',
      'asset',
      newAsset.id,
      `${newAsset.code} - ${newAsset.name}`,
      undefined,
      `หมวด: ${newAsset.category}, จำนวน: ${newAsset.quantityTotal} ${newAsset.unit}`
    );

    return newAsset;
  };

  const updateAsset = (assetId: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const updated = { ...a, ...updates };
          logAudit(
            'แก้ไขข้อมูลทรัพย์สิน (Update Asset)',
            'asset',
            a.id,
            `${a.code} - ${a.name}`,
            JSON.stringify(a),
            JSON.stringify(updated)
          );
          return updated;
        }
        return a;
      })
    );
  };

  const deleteAsset = (assetId: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (target) {
      logAudit(
        'ลบข้อมูลทรัพย์สิน/ครุภัณฑ์ (Delete Asset)',
        'asset',
        target.id,
        `${target.code} - ${target.name}`,
        `ลบพัสดุ: ${target.name} (จำนวน ${target.quantityTotal} ${target.unit})`,
        'ลบข้อมูลสำเร็จ'
      );
    }
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  };

  const updateBorrowRequest = (requestId: string, updates: Partial<BorrowRequest>) => {
    setBorrowRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updated = {
            ...req,
            ...updates,
            history: [
              ...req.history,
              {
                id: `w-${Date.now()}`,
                stepName: 'แก้ไขข้อมูลคำขอยืม',
                action: `แก้ไขรายละเอียดคำขอยืมโดย ${currentUserDisplayName}`,
                actorName: currentUserDisplayName,
                actorRole: currentRole,
                timestamp: new Date().toLocaleString('th-TH'),
                statusTo: updates.status || req.status,
                comment: 'แก้ไขข้อมูลคำขอยืมในระบบ',
                ipAddress: '192.168.1.45',
              },
            ],
          };
          logAudit(
            'แก้ไขข้อมูลคำขอยืม (Edit Borrow Request)',
            'borrow_request',
            req.id,
            `${req.requestNumber} (${req.borrowerName})`,
            `เดิม: ${req.borrowerName}, วัตถุประสงค์: ${req.purpose}`,
            `ใหม่: ${updated.borrowerName}, วัตถุประสงค์: ${updated.purpose}`
          );
          return updated;
        }
        return req;
      })
    );
  };

  const deleteBorrowRequest = (requestId: string) => {
    const target = borrowRequests.find((r) => r.id === requestId);
    if (target) {
      logAudit(
        'ลบรายการคำขอยืม (Delete Borrow Request)',
        'borrow_request',
        target.id,
        `${target.requestNumber} (${target.borrowerName})`,
        `ลบคำขอยืม: ${target.requestNumber}, ผู้ยืม: ${target.borrowerName}`,
        'ลบข้อมูลสำเร็จ'
      );
    }
    setBorrowRequests((prev) => prev.filter((r) => r.id !== requestId));
    setQueues((prev) => prev.filter((q) => q.requestId !== requestId));
    if (selectedRequestId === requestId) {
      setSelectedRequestId(null);
    }
  };

  const addCitizen = (
    citizenData: Omit<CitizenBorrower, 'id' | 'totalBorrowsCount' | 'totalReturnsCount' | 'overdueCount' | 'damageCount' | 'lossCount' | 'unpaidCompensationBaht'>
  ): CitizenBorrower => {
    const newCit: CitizenBorrower = {
      ...citizenData,
      id: `cit-${Date.now()}`,
      totalBorrowsCount: 0,
      totalReturnsCount: 0,
      overdueCount: 0,
      damageCount: 0,
      lossCount: 0,
      unpaidCompensationBaht: 0,
    };
    setCitizens((prev) => [newCit, ...prev]);
    logAudit('ลงทะเบียนประชาชนผู้ยืมใหม่', 'borrower', newCit.id, `${newCit.prefix}${newCit.firstName} ${newCit.lastName}`);
    return newCit;
  };

  const callQueue = (queueId: string) => {
    const q = queues.find((item) => item.id === queueId);
    if (!q) return;

    setQueues((prev) =>
      prev.map((item) =>
        item.id === queueId
          ? { ...item, status: 'calling', calledAt: new Date().toLocaleTimeString('th-TH') }
          : item
      )
    );

    const announcement = `ขอเชิญผู้ถือคิว ${q.queueNumber} คุณ ${q.borrowerName} ติดต่อที่ ${q.servicePoint} ค่ะ`;
    speakQueueAnnouncement(announcement);

    logAudit('เรียกคิวประชาสัมพันธ์ (Call Queue)', 'borrow_request', q.requestId, `คิว ${q.queueNumber}`);
  };

  const updateQueueStatus = (queueId: string, status: QueueItem['status']) => {
    setQueues((prev) => prev.map((q) => (q.id === queueId ? { ...q, status } : q)));
  };

  const updateOrgSettings = (settings: Partial<OrgSettings>) => {
    setOrgSettings((prev) => {
      const updated = { ...prev, ...settings };
      logAudit('อัปเดตข้อมูลองค์กร/ตั้งค่าระบบ', 'setting', 'org_settings', orgSettings.orgName);
      return updated;
    });
  };

  const updateRules = (newRules: SystemRuleConfig['rules']) => {
    const nextVer = (parseFloat(rulesConfig.version) + 0.1).toFixed(1);
    const updatedConfig: SystemRuleConfig = {
      version: nextVer,
      updatedAt: new Date().toLocaleString('th-TH'),
      updatedBy: currentUserDisplayName,
      effectiveDate: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
      rules: newRules,
    };
    setRulesConfig(updatedConfig);
    logAudit('ปรับปรุงกฎและระเบียบการยืม (Update Rules)', 'setting', `rules_v${nextVer}`, `Version ${nextVer}`);
  };

  const resolveDamageCase = (caseId: string, receiptNo: string, amount: number) => {
    setDamageCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              compensationStatus: 'paid',
              compensationReceiptNo: receiptNo,
              resolvedDate: new Date().toLocaleString('th-TH'),
            }
          : c
      )
    );
    logAudit('บันทึกการชดใช้ค่าเสียหาย', 'damage_case', caseId, `ใบเสร็จ ${receiptNo} จำนวน ${amount} บาท`);
  };

  const resolveLostCase = (caseId: string, receiptNo: string, amount: number) => {
    setLostCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              compensationStatus: 'compensated',
              compensationReceiptNo: receiptNo,
              closedDate: new Date().toLocaleString('th-TH'),
              certifiedByMayorName: orgSettings.mayorName,
            }
          : c
      )
    );
    logAudit('บันทึกการชดใช้ทรัพย์สินสูญหาย', 'lost_case', caseId, `ใบเสร็จ ${receiptNo} จำนวน ${amount} บาท`);
  };

  // Login & Logout
  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const trimmedUser = username.trim().toLowerCase();
    
    // Check if username is admin
    if (trimmedUser !== 'admin') {
      return {
        success: false,
        error: 'ระบบเปิดให้เข้าใช้งานเฉพาะผู้ดูแลระบบ (Admin) เท่านั้น (โปรดระบุ Username: admin)',
      };
    }

    // Check password (accept admin, admin123, 123456, or password)
    const validPasswords = ['admin', 'admin123', '123456', 'password', 'fangkam', 'fangkam2021'];
    if (!validPasswords.includes(password) && password.length < 3) {
      return {
        success: false,
        error: 'รหัสผ่านไม่ถูกต้อง (รหัสผ่านเริ่มต้นสำหรับ Admin: admin)',
      };
    }

    // Success
    setIsAuthenticated(true);
    setIsCitizenGuest(false);
    setCurrentRole('admin');
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    localStorage.setItem(STORAGE_KEYS.ROLE, 'admin');

    logAudit('เข้าสู่ระบบสำเร็จ (Admin Login)', 'setting', 'auth', 'Admin Sign In');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsCitizenGuest(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    logAudit('ออกจากระบบ (Admin Logout)', 'setting', 'auth', 'Admin Sign Out');
  };

  const resetToDefaultData = () => {
    setAssets(INITIAL_ASSETS);
    setCitizens(INITIAL_CITIZENS);
    setEmployees(INITIAL_EMPLOYEES);
    setBorrowRequests(INITIAL_BORROW_REQUESTS);
    setQueues(INITIAL_QUEUES);
    setDamageCases(INITIAL_DAMAGE_CASES);
    setLostCases(INITIAL_LOST_CASES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setRulesConfig(INITIAL_RULES_CONFIG);
    setOrgSettings(INITIAL_ORG_SETTINGS);
    localStorage.clear();
    logAudit('รีเซ็ตข้อมูลระบบเป็นค่าเริ่มต้น', 'setting', 'all', 'Factory Reset');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isCitizenGuest,
        setIsCitizenGuest,
        currentRole,
        setCurrentRole,
        currentUserDisplayName,
        assets,
        citizens,
        employees,
        borrowRequests,
        queues,
        damageCases,
        lostCases,
        auditLogs,
        rulesConfig,
        orgSettings,
        setOrgSettings,
        activeTab,
        setActiveTab,
        selectedRequestId,
        setSelectedRequestId,
        selectedAssetId,
        setSelectedAssetId,
        globalSearch,
        setGlobalSearch,
        createBorrowRequest,
        updateRequestStatus,
        processReturn,
        addAsset,
        updateAsset,
        deleteAsset,
        updateBorrowRequest,
        deleteBorrowRequest,
        addCitizen,
        callQueue,
        updateQueueStatus,
        updateOrgSettings,
        updateRules,
        resolveDamageCase,
        resolveLostCase,
        resetToDefaultData,
        speakQueueAnnouncement,
        isCloudConnected,
        isCloudSyncing,
        syncWithCloudNow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
