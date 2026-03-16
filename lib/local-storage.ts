// Secure local storage management for Iftar Party data
export interface Participant {
  id: string;
  name: string;
  amount: number;
  paymentMethod: 'cash' | 'bkash';
  transactionId?: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  status: 'purchased' | 'not-purchased';
  createdAt: string;
}

export interface AppData {
  participants: Participant[];
  products: Product[];
  authCodes: string[];
  settings: {
    theme: 'light' | 'dark';
    eventName: string;
    eventDate: string;
    eventVenue: string;
  };
}

const DEFAULT_DATA: AppData = {
  participants: [],
  products: [],
  authCodes: ['AFTABx7766'],
  settings: {
    theme: 'dark',
    eventName: 'BATCH-22 IFTAR PARTY',
    eventDate: '26/3/25 (25th Ramadan)',
    eventVenue: 'Balakhal J.N High School',
  },
};

export class LocalStorageManager {
  private static readonly DATA_KEY = 'iftar_party_data';

  static getData(): AppData {
    if (typeof window === 'undefined') return DEFAULT_DATA;

    try {
      const stored = localStorage.getItem(this.DATA_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_DATA;
    } catch (error) {
      console.error('[v0] Error reading storage:', error);
      return DEFAULT_DATA;
    }
  }

  static saveData(data: AppData): boolean {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('[v0] Error saving storage:', error);
      return false;
    }
  }

  static addParticipant(participant: Omit<Participant, 'id'>): Participant {
    const data = this.getData();
    const id = `participant_${Date.now()}_${Math.random()}`;
    const newParticipant: Participant = { ...participant, id };

    data.participants.push(newParticipant);
    this.saveData(data);
    return newParticipant;
  }

  static updateParticipant(id: string, updates: Partial<Participant>): boolean {
    const data = this.getData();
    const index = data.participants.findIndex((p) => p.id === id);

    if (index === -1) return false;

    data.participants[index] = { ...data.participants[index], ...updates };
    return this.saveData(data);
  }

  static deleteParticipant(id: string): boolean {
    const data = this.getData();
    data.participants = data.participants.filter((p) => p.id !== id);
    return this.saveData(data);
  }

  static addProduct(product: Omit<Product, 'id'>): Product {
    const data = this.getData();
    const id = `product_${Date.now()}_${Math.random()}`;
    const newProduct: Product = { ...product, id };

    data.products.push(newProduct);
    this.saveData(data);
    return newProduct;
  }

  static updateProduct(id: string, updates: Partial<Product>): boolean {
    const data = this.getData();
    const index = data.products.findIndex((p) => p.id === id);

    if (index === -1) return false;

    data.products[index] = { ...data.products[index], ...updates };
    return this.saveData(data);
  }

  static deleteProduct(id: string): boolean {
    const data = this.getData();
    data.products = data.products.filter((p) => p.id !== id);
    return this.saveData(data);
  }

  static updateSettings(settings: Partial<AppData['settings']>): boolean {
    const data = this.getData();
    data.settings = { ...data.settings, ...settings };
    return this.saveData(data);
  }

  static addAuthCode(code: string): boolean {
    const data = this.getData();
    if (data.authCodes.includes(code)) return false;

    data.authCodes.push(code);
    return this.saveData(data);
  }

  static removeAuthCode(code: string): boolean {
    const data = this.getData();
    if (data.authCodes.length <= 1) return false; // Keep at least one code

    data.authCodes = data.authCodes.filter((c) => c !== code);
    return this.saveData(data);
  }

  static verifyAuthCode(code: string): boolean {
    const data = this.getData();
    return data.authCodes.includes(code);
  }

  static getTotalCollected(): number {
    const data = this.getData();
    return data.participants.reduce((sum, p) => sum + p.amount, 0);
  }

  static getTotalSpent(): number {
    const data = this.getData();
    return data.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }

  static getParticipantCount(): number {
    const data = this.getData();
    return data.participants.length;
  }
}
