import useApi from '../modules/api';
import { RegisterUser } from '../model/user';
import { useAuthStore } from './authStore';
import { defineStore } from 'pinia';

export const useRegisterStore = defineStore('registerStore', () => {
  let status: Boolean;

  const register = async (user: RegisterUser) => {
    const registerUser: RegisterUser = user;

    const apiRegister = useApi<RegisterUser>('Users/register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerUser),
    });

    await apiRegister.request();
    if (apiRegister.response.value) {
      status = apiRegister.status.value;
    }
  };

  const getStatus = () => {
    return status;
  };

  return {
    register,
    getStatus,
  };
});
