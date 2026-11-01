import { useQuery } from '@tanstack/react-query';
import { fetchOrder, fetchOrders, orderKey, ordersKey } from '../api';

export const useOrders = () => useQuery({ queryKey: ordersKey, queryFn: fetchOrders });

export const useOrder = (id: string) =>
  useQuery({ queryKey: orderKey(id), queryFn: () => fetchOrder(id) });
