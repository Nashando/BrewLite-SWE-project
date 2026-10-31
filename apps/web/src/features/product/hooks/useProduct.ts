import { useQuery } from '@tanstack/react-query';
import { fetchProduct, productDetailKey } from '../api';

export function useProduct(id: string) {
  return useQuery({ queryKey: productDetailKey(id), queryFn: () => fetchProduct(id) });
}
