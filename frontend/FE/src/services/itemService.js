import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/items`;

export const itemService = {
    getAll: () => {
        // Matches @GetMapping in ItemController
        return axios.get(`${BASE_URL}`);
    },

    getById: (id) => {
        return axios.get(`${BASE_URL}/${id}`);
    },

    create: (data) => {
        // Matches @PostMapping in ItemController
        return axios.post(`${BASE_URL}`, data);
    },

    update: (id, data) => {
        // Matches @PutMapping("/{id}")
        return axios.put(`${BASE_URL}/${id}`, data);
    },

    delete: (id) => {
        // Matches @DeleteMapping("/{id}")
        return axios.delete(`${BASE_URL}/${id}`);
    }
};
