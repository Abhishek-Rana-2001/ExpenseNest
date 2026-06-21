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


export type Attachment = {
  key: string;
  contentType: string;
  size: number;
  filename: string;
  width?: number;
  height?: number;
  uploadedAt: string;
  /** Only present on responses that pre-sign URLs (single-tx fetch / list enrichment). */
  viewUrl?: string;
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
  categoryId?: PopulatedCategory | string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'bank';
  isRecurring: boolean;
  attachments?: Attachment[];
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


export type filterTransactions = {
  from: Date | null,
  to: Date | null,
  search?: string,
}

export type TransactionSortField = 'date' | 'amount' | 'createdAt'
export type TransactionSortOrder = 'asc' | 'desc'
export type TransactionSort = {
  field: TransactionSortField
  order: TransactionSortOrder
}
