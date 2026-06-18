import axiosInstance from './axios';

export const getPGs = () => {
  return axiosInstance.get('/pg');
};

export const createPG = (data) => {
  return axiosInstance.post('/pg', data);
};
