import type { Role } from '@/types';

/**
 * Chỉ khách hàng mới đặt đơn (theo sơ đồ use-case). Chưa đăng nhập vẫn được chọn món vào giỏ,
 * và phiên cũ chưa có trường role được coi là khách, nên chỉ loại trừ nhân viên và quản lý.
 */
export const canOrder = (role: Role | undefined) => role !== 'STAFF' && role !== 'MANAGER';
