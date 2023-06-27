import useApi from '@/modules/api';
import { AuthResponse, User } from '@/modules/user';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';


export const useAuthStore = defineStore('userStore', () => {
    let user = ref<User | undefined>(undefined);
    let token = ref<string | undefined>(undefined);
    const isAuthenticated = computed(() => {
        if (localStorage.hasOwnProperty('token'))
        {
            user.value = JSON.parse(localStorage.getItem('token'))['Username'];
            token.value = JSON.parse(localStorage.getItem('token'))['token'];

        }
            return Boolean(token.value);
    }

    );

    const login = async (inputUser : object): Promise<boolean> => {

        const loginUser : User = inputUser;
        const apiLogin = useApi<AuthResponse>('Users/login', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(loginUser),
        });

        await apiLogin.request();

        if (apiLogin.response.value && apiLogin.response.value.token) {
            token.value = apiLogin.response.value.token;
            user.value = loginUser;

            localStorage.setItem('token', JSON.stringify({Username: loginUser.Username, token: token.value}));


            return true;
        }

        return false;
    };

    const logout = () => {
        user.value = undefined;
        token.value = undefined;
        localStorage.clear();
    };

    return {
        user,
        isAuthenticated,
        token,
        login,
        logout,
    };
});
