import { http, HttpResponse } from 'msw';
import { API_URL } from '@/lib/env';
import { mockProductDetails, mockProducts } from './data';

export const handlers = [
  http.get(`${API_URL}/products`, () => HttpResponse.json(mockProducts)),

  http.get(`${API_URL}/products/:id`, ({ params }) => {
    const product = mockProductDetails.find((p) => p.id === params.id);
    return product
      ? HttpResponse.json(product)
      : HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy sản phẩm' }, { status: 404 });
  }),
];
