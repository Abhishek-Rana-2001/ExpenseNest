import type { CurrencyCode } from '@/lib/currencies'

export type User = {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  emailVerified: boolean
  picture?: string
  passwordHash?: string
  googleSub?: string
  tokenVersion?: number
  baseCurrency?: CurrencyCode
}


export type Transaction = {
  _id: string;
  userId: string;
  amount: number;
  currency: string;        // e.g. "INR"
  type: "income" | "expense"; // based on your data
  description?: string;
  date: string;            // ISO string (can convert to Date if needed)
  category: string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'bank';
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type Category = {
  _id: string;
  userId: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** Populated Category reference returned from the API. */
export type PopulatedCategory = Pick<Category, '_id' | 'name' | 'color' | 'icon'>

export type Budget = {
  _id: string;
  userId: string;
  categoryId: PopulatedCategory | string;
  amount: number;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
