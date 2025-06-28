import axios from 'axios';
import {
    StoreItem,
    StoreTransaction,
    ApiResponse,
    CreateStoreItemRequest,
    UpdateStoreItemRequest,
    UpdateStoreTransactionRequest,
    StoreItemsResponse,
    StoreTransactionsResponse
} from '../types';

// In production, always use relative paths. In development, use localhost:8000
const API_BASE_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const storeService = {
    /**
     * Get all store items
     */
    async getStoreItems(params: {
        page?: number;
        limit?: number;
        isActive?: boolean;
    } = {}): Promise<StoreItemsResponse> {
        const response = await api.get<ApiResponse<StoreItemsResponse>>('/api/store/items', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch store items');
        }

        return response.data.data!;
    },

    /**
     * Get store item by ID
     */
    async getStoreItem(id: number): Promise<StoreItem> {
        const response = await api.get<ApiResponse<StoreItem>>(`/api/store/items/${id}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch store item');
        }

        return response.data.data!;
    },

    /**
     * Create a new store item
     */
    async createStoreItem(itemData: CreateStoreItemRequest): Promise<StoreItem> {
        const response = await api.post<ApiResponse<StoreItem>>('/api/store/items', itemData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to create store item');
        }

        return response.data.data!;
    },

    /**
     * Update store item
     */
    async updateStoreItem(id: number, itemData: UpdateStoreItemRequest): Promise<StoreItem> {
        const response = await api.put<ApiResponse<StoreItem>>(`/api/store/items/${id}`, itemData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to update store item');
        }

        return response.data.data!;
    },

    /**
     * Delete store item
     */
    async deleteStoreItem(id: number): Promise<void> {
        const response = await api.delete<ApiResponse>(`/api/store/items/${id}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to delete store item');
        }
    },

    /**
     * Purchase an item
     */
    async purchaseItem(itemId: number): Promise<StoreTransaction> {
        const response = await api.post<ApiResponse<StoreTransaction>>('/api/store/purchase', { itemId });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to purchase item');
        }

        return response.data.data!;
    },

    /**
     * Get user's purchase history
     */
    async getPurchaseHistory(params: {
        page?: number;
        limit?: number;
        status?: string;
    } = {}): Promise<StoreTransactionsResponse> {
        const response = await api.get<ApiResponse<StoreTransactionsResponse>>('/api/store/purchases', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch purchase history');
        }

        return response.data.data!;
    },

    /**
     * Get pending transactions (admin only)
     */
    async getPendingTransactions(params: {
        page?: number;
        limit?: number;
    } = {}): Promise<StoreTransactionsResponse> {
        const response = await api.get<ApiResponse<StoreTransactionsResponse>>('/api/store/transactions/pending', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch pending transactions');
        }

        return response.data.data!;
    },

    /**
     * Update transaction status (admin only)
     */
    async updateTransaction(transactionId: number, transactionData: UpdateStoreTransactionRequest): Promise<StoreTransaction> {
        const response = await api.put<ApiResponse<StoreTransaction>>(`/api/store/transactions/${transactionId}`, transactionData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to update transaction');
        }

        return response.data.data!;
    },
};
