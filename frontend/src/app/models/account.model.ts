export type TransactionType =
  | 'Depósito'
  | 'Retiro'
  | 'Transferencia enviada'
  | 'Transferencia recibida';

export interface Transaction {
  _id?: string;
  type: TransactionType;
  amount: number;
  counterpartyUsername?: string | null;
  description?: string;
  date: string;
}

export interface AccountInfo {
  accountId: string;
  user: string;
  balance: number;
  transactionCount: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: string;
  accountId: string;
}

export interface TransferRequest {
  recipientUsername: string;
  amount: number;
  description?: string;
}

export interface TransferResponse {
  message: string;
  newBalance: number;
  recipient: string;
  amount: number;
}

export interface BalanceMutationResponse {
  message: string;
  newBalance: number;
}

export interface FavoritesResponse {
  favorites: string[];
}

export interface FavoritesMutationResponse {
  message: string;
  favorites: string[];
}

export interface ChangePinRequest {
  currentPin: string;
  newPin: string;
}

export interface ChangePinResponse {
  message: string;
}