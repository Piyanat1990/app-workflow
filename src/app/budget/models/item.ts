export enum ItemStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type CreateItem = Omit<Item, 'id'>;

export type EditItem = CreateItem;

export interface Item {
  id: number;
  title: string;
  amount: number;
  quantity: number;
  status: ItemStatus;
}
