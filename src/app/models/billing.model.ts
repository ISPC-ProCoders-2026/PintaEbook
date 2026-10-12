export interface CreditBalance {
  credits_available: number;
  last_updated: string;
}

export interface CreditPackage {
  id: number;
  nombre: string;
  cantidad_creditos: number;
  precio: string;
}

export interface CheckoutResponse {
  init_point: string;
}
