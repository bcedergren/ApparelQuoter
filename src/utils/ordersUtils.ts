import { Quote } from '@/types/Quote';

export interface OrdersState {
	savedQuotes: Quote[];
	openOrders: Quote[];
	savedOrders: Quote[];
	completedOrders: Quote[];
	[key: string]: Quote[];
}

export const initialOrders: OrdersState = {
	savedQuotes: [],
	openOrders: [],
	savedOrders: [],
	completedOrders: [],
};
