import instance from './axiosInstance';

const billService = {
  getAll: (page = 0, size = 30, sortBy = 'id', sortDir = 'desc') =>
    instance.get('/bills', { params: { page, size, sortBy, sortDir } }),
};

export default billService;
