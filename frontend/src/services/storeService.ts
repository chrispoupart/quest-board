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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
     * Get all active store items
     */
    async getStoreItems(params?: {
        page?: number;
        limit?: number;
    }): Promise<StoreItemsResponse> {
        const response = await api.get<ApiResponse<StoreItemsResponse>>('/store/items', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch store items');
        }

        return response.data.data!;
    },

    /**
     * Get a single store item by ID
     */
    async getStoreItem(id: number): Promise<StoreItem> {
        const response = await api.get<ApiResponse<StoreItem>>(`/store/items/${id}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch store item');
        }

        return response.data.data!;
    },

    /**
     * Create a new store item (admin/editor only)
     */
    async createStoreItem(itemData: CreateStoreItemRequest): Promise<StoreItem> {
        const response = await api.post<ApiResponse<StoreItem>>('/store/items', itemData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to create store item');
        }

        return response.data.data!;
    },

    /**
     * Update an existing store item (admin/editor only)
     */
    async updateStoreItem(id: number, itemData: UpdateStoreItemRequest): Promise<StoreItem> {
        const response = await api.put<ApiResponse<StoreItem>>(`/store/items/${id}`, itemData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to update store item');
        }

        return response.data.data!;
    },

    /**
     * Delete a store item (admin only)
     */
    async deleteStoreItem(id: number): Promise<void> {
        const response = await api.delete<ApiResponse>(`/store/items/${id}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to delete store item');
        }
    },

    /**
     * Purchase an item from the store
     */
    async purchaseItem(itemId: number): Promise<StoreTransaction> {
        const response = await api.post<ApiResponse<StoreTransaction>>('/store/purchase', { itemId });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to purchase item');
        }

        return response.data.data!;
    },

    /**
     * Get user's purchase history
     */
    async getUserPurchases(params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<StoreTransactionsResponse> {
        const response = await api.get<ApiResponse<StoreTransactionsResponse>>('/store/purchases', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch user purchases');
        }

        return response.data.data!;
    },

    /**
     * Get all pending transactions (admin/editor only)
     */
    async getPendingTransactions(params?: {
        page?: number;
        limit?: number;
    }): Promise<StoreTransactionsResponse> {
        const response = await api.get<ApiResponse<StoreTransactionsResponse>>('/store/transactions/pending', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch pending transactions');
        }

        return response.data.data!;
    },

    /**
     * Approve or reject a transaction (admin/editor only)
     */
    async updateTransaction(transactionId: number, transactionData: UpdateStoreTransactionRequest): Promise<StoreTransaction> {
        const response = await api.put<ApiResponse<StoreTransaction>>(`/store/transactions/${transactionId}`, transactionData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to update transaction');
        }

        return response.data.data!;
    },
};
