import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productKeys } from '@/features/menu/api';
import { cancelOrder, fetchOrder, fetchOrders, orderKey, ordersKey } from '../api';

export const useOrders = () => useQuery({ queryKey: ordersKey, queryFn: fetchOrders });

export const useOrder = (id: string) =>
  useQuery({ queryKey: orderKey(id), queryFn: () => fetchOrder(id) });

export function useCancelOrder() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ordersKey }); // gồm cả chi tiết đơn
      void client.invalidateQueries({ queryKey: productKeys.all }); // đơn hủy trả lại tồn kho
    },
  });
}
