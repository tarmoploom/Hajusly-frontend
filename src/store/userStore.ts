import useApi from '@/modules/api';
import { AuthenticatedUser } from '@/modules/user';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useMainStore } from "@/template/stores/main.js";
import {useAuthStore} from "./authStore";



export const authenticatedUserStore = defineStore('authenticatedUserStore', () => {
    const authStore = useAuthStore();
    //let authenticatedUser = ref<AuthenticatedUser | undefined>(undefined);
    let authenticatedUser = ref<AuthenticatedUser>();

    const load = async (): Promise<boolean> => {
        const apiGetSelf = useApi<AuthenticatedUser>('users/getSelf', {
                headers: { Authorization: 'Bearer ' + authStore.token },
            }
        );
        
        await apiGetSelf.request();

        if (apiGetSelf.response.value) {
            authenticatedUser.value = apiGetSelf.response.value;
            return true;
        }

        return false;
    };

    return {
        authenticatedUser,
        load
    };
});
