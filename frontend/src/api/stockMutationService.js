import api from './axios';

const stockMutationService = {
    getAll: async (params = {}) => {
        const response = await api.get('/stock-mutations', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/stock-mutations', data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/stock-mutations/${id}`);
        return response.data;
    },
};

export default stockMutationService;