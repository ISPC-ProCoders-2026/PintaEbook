export type PurchaseStatus = 'Aprobada' | 'Pendiente' | 'Rechazada' | 'Reembolsada' | 'Cancelada';

export interface Purchase {
  id: string;
  date: string;
  timestamp?: string;
  packageName?: string;
  credits: number;
  amount: number;
  status: PurchaseStatus;
  userId: string;
  userName: string;
}
