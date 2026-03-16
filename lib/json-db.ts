// JSON Database Manager for Iftar Party
// All data is stored in browser localStorage, with a default database.json structure

export interface Participant {
  id: string;
  name: string;
  amount: number;
  paymentMethod: "Cash" | "bKash";
  transactionId?: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  status: "Purchased" | "Not Purchased";
}

export interface AuthCode {
  id: string;
  code: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface Settings {
  theme: "light" | "dark";
  eventName: string;
  eventDate: string;
  eventVenue: string;
  minParticipationAmount: number;
}

export interface Database {
  participants: Participant[];
  products: Product[];
  authCodes: AuthCode[];
  settings: Settings;
}

const STORAGE_KEY = "iftar_party_database";
const SETTINGS_KEY = "iftar_party_settings";

// Default database structure
const DEFAULT_DATABASE: Database = {
  participants: [
    {
      id: "p1",
      name: "Ahmed Khan",
      date: new Date().toISOString(),
      amount: 500,
      paymentMethod: "Cash",
      transactionId: "",
    },
    {
      id: "p2",
      name: "Fatima Rahman",
      date: new Date(Date.now() - 86400000).toISOString(),
      amount: 400,
      paymentMethod: "bKash",
      transactionId: "BK123456789",
    },
    {
      id: "p3",
      name: "Mohammad Ali",
      date: new Date(Date.now() - 172800000).toISOString(),
      amount: 350,
      paymentMethod: "Cash",
      transactionId: "",
    },
  ],
  products: [
    { id: "prod1", name: "Biriyani", price: 150, quantity: 12, status: "Not Purchased" },
    { id: "prod2", name: "Juice", price: 30, quantity: 12, status: "Purchased" },
    { id: "prod3", name: "Water", price: 15, quantity: 12, status: "Not Purchased" },
  ],
  authCodes: [
    {
      id: "auth1",
      code: "AFTABx7766",
      createdBy: "Admin",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ],
  settings: {
    theme: "dark",
    eventName: "BATCH-22 IFTAR PARTY",
    eventDate: "26/3/25 (25th Ramadan 1446 AH)",
    eventVenue: "Balakhal J.N High School",
    minParticipationAmount: 400,
  },
};

export class JsonDatabase {
  // Get entire database
  static getDatabase(): Database {
    if (typeof window === "undefined") return DEFAULT_DATABASE;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.saveDatabase(DEFAULT_DATABASE);
        return DEFAULT_DATABASE;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error("[v0] Error reading database:", error);
      return DEFAULT_DATABASE;
    }
  }

  // Save entire database
  static saveDatabase(db: Database): boolean {
    if (typeof window === "undefined") return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent("databaseChange", { detail: db }));
      return true;
    } catch (error) {
      console.error("[v0] Error saving database:", error);
      return false;
    }
  }

  // ============== PARTICIPANTS ==============
  static getParticipants(): Participant[] {
    return this.getDatabase().participants;
  }

  static addParticipant(
    participant: Omit<Participant, "id">
  ): Participant {
    const db = this.getDatabase();
    const id = `p${Date.now()}`;
    const newParticipant: Participant = { ...participant, id };
    db.participants.push(newParticipant);
    this.saveDatabase(db);
    return newParticipant;
  }

  static updateParticipant(
    id: string,
    updates: Partial<Participant>
  ): Participant | null {
    const db = this.getDatabase();
    const index = db.participants.findIndex((p) => p.id === id);
    if (index === -1) return null;
    db.participants[index] = { ...db.participants[index], ...updates };
    this.saveDatabase(db);
    return db.participants[index];
  }

  static deleteParticipant(id: string): boolean {
    const db = this.getDatabase();
    const initialLength = db.participants.length;
    db.participants = db.participants.filter((p) => p.id !== id);
    if (db.participants.length === initialLength) return false;
    this.saveDatabase(db);
    return true;
  }

  // ============== PRODUCTS ==============
  static getProducts(): Product[] {
    return this.getDatabase().products;
  }

  static addProduct(product: Omit<Product, "id">): Product {
    const db = this.getDatabase();
    const id = `prod${Date.now()}`;
    const newProduct: Product = { ...product, id };
    db.products.push(newProduct);
    this.saveDatabase(db);
    return newProduct;
  }

  static updateProduct(
    id: string,
    updates: Partial<Product>
  ): Product | null {
    const db = this.getDatabase();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    db.products[index] = { ...db.products[index], ...updates };
    this.saveDatabase(db);
    return db.products[index];
  }

  static deleteProduct(id: string): boolean {
    const db = this.getDatabase();
    const initialLength = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);
    if (db.products.length === initialLength) return false;
    this.saveDatabase(db);
    return true;
  }

  // ============== SETTINGS ==============
  static getSettings(): Settings {
    return this.getDatabase().settings;
  }

  static updateSettings(updates: Partial<Settings>): Settings {
    const db = this.getDatabase();
    db.settings = { ...db.settings, ...updates };
    this.saveDatabase(db);
    return db.settings;
  }

  // ============== AUTH CODES ==============
  static getAuthCodes(): AuthCode[] {
    return this.getDatabase().authCodes;
  }

  static addAuthCode(code: string, createdBy: string): AuthCode | null {
    const db = this.getDatabase();
    // Check if code already exists
    if (db.authCodes.some((ac) => ac.code === code)) return null;

    const newAuthCode: AuthCode = {
      id: `auth${Date.now()}`,
      code,
      createdBy,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    db.authCodes.push(newAuthCode);
    this.saveDatabase(db);
    return newAuthCode;
  }

  static updateAuthCode(
    id: string,
    updates: Partial<AuthCode>
  ): AuthCode | null {
    const db = this.getDatabase();
    const index = db.authCodes.findIndex((ac) => ac.id === id);
    if (index === -1) return null;
    db.authCodes[index] = { ...db.authCodes[index], ...updates };
    this.saveDatabase(db);
    return db.authCodes[index];
  }

  static deleteAuthCode(id: string): boolean {
    const db = this.getDatabase();
    // Don't allow deleting if it's the only code
    if (db.authCodes.length <= 1) return false;
    const initialLength = db.authCodes.length;
    db.authCodes = db.authCodes.filter((ac) => ac.id !== id);
    if (db.authCodes.length === initialLength) return false;
    this.saveDatabase(db);
    return true;
  }

  static verifyAuthCode(code: string): boolean {
    const db = this.getDatabase();
    return db.authCodes.some((ac) => ac.code === code && ac.isActive);
  }

  // ============== FINANCIAL DATA ==============
  static getFinancialData() {
    const db = this.getDatabase();
    const totalCollected = db.participants.reduce((sum, p) => sum + p.amount, 0);
    const totalSpent = db.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const totalRemaining = totalCollected - totalSpent;
    const participantCount = db.participants.length;
    const paidCount = db.participants.filter((p) => p.amount >= db.settings.minParticipationAmount).length;

    return {
      totalCollected,
      totalSpent,
      totalRemaining,
      participantCount,
      paidCount,
      averageContribution: participantCount > 0 ? totalCollected / participantCount : 0,
    };
  }

  // Initialize database if needed
  static initialize(): void {
    if (typeof window === "undefined") return;
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      this.saveDatabase(DEFAULT_DATABASE);
    }
  }
}
