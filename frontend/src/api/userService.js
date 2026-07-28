import api from './axios';

const userService = {
    getAll: async () => {
        const res = await api.get('/admin/users');
        return res.data;
    },
    updateRole: async (id, role) => {
        const res = await api.patch(`/admin/users/${id}/role`, { role });
        return res.data;
    },
    update: async (id, data) => {
        const res = await api.patch(`/admin/users/${id}`, data);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/admin/users/${id}`);
        return res.data;
    }
};

export default userService;