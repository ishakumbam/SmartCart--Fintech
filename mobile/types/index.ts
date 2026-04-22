export interface User {
    id: string;
    email: string;
    name: string;
    pushToken?: string;
    location?: {
      lat: number;
      lng: number;
    };
    createdAt: string;
  }
  
  export interface Receipt {
    id: string;
    userId: string;
    storeName: string;
    purchaseDate: string;
    total: number;
    imageUrl: string;
    items: ReceiptItem[];
    createdAt: string;
  }
  
  export interface ReceiptItem {
    id: string;
    receiptId: string;
    rawName: string;
    normalizedName: string;
    category: string;
    quantity: number;
    unitPrice: number;
  }
  
  export interface Deal {
    id: string;
    partnerId: string;
    item: string;
    category: string;
    originalPrice: number;
    dealPrice: number;
    store: string;
    storeLogo?: string;
    itemPhoto?: string;
    coordinates: { lat: number; lng: number };
    expiresAt: string;
    affiliateUrl: string;
    savingsPercent: number;
    frequencyScore: number;
    rankScore: number;
  }
  
  export interface BuyProfile {
    item: string;
    category: string;
    purchaseCount: number;
    avgFrequencyDays: number;
    lastPurchasedAt: string;
  }
  
  export interface Notification {
    id: string;
    title: string;
    body: string;
    dealId?: string;
    read: boolean;
    createdAt: string;
  }
  
  export interface ApiResponse<T> {
    data: T;
    message?: string;
  }
  
  export interface ApiError {
    message: string;
    statusCode: number;
  }