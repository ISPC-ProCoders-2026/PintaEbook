export type PurchaseStatus = 'Aprobada' | 'Pendiente' | 'Rechazada';

export interface Purchase {
  id: string;
  date: string;
  credits: number;
  amount: number;
  status: PurchaseStatus;
  userId: string;
  userName: string;
}