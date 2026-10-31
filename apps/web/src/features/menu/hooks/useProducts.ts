import { useQuery } from '@tanstack/react-query';
import { fetchProducts, productKeys } from '../api';

export function useProducts() {
  return useQuery({ queryKey: productKeys.all, queryFn: fetchProducts });
}
