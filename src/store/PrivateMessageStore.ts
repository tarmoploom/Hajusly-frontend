import {defineStore} from "pinia";
import {ref} from "vue";
import {useAuthStore} from "./authStore";
import useApi, {HTTP} from "../modules/api";
import {PrivateMessage} from "../model/PrivateMessage";
import {AxiosError} from "axios";

export const usePrivateMessageStore = defineStore('messageStore', () => {
    let allMessages: PrivateMessage[] = [];
    let messages = ref<PrivateMessage[]>([]);
    const authStore = useAuthStore();
    let currentMessage = ref<PrivateMessage | undefined>(undefined);

    const apiGetMessages = useApi<PrivateMessage[]>('PrivateMessage', {
            headers: { Authorization: 'Bearer ' + authStore.token },
        }
    );
    
    const loadMessageById = async (guid: string) => {
        try {
            let response = await HTTP.client({ useBearer: true }).get(
                '/PrivateMessage/' + guid,
            ).then(
                
            );
            currentMessage.value = response.data as PrivateMessage[];
        } catch (e) {
            console.error((e as AxiosError).response);
            currentMessage.value = [];
        }
    };
    
    const loadMessages = async () => {
        await apiGetMessages.request();
        if (apiGetMessages.response.value) {
            return apiGetMessages.response.value!;
        }

        return [];
    };

    const load = async () => {
        allMessages = await loadMessages();
        messages.value = allMessages;
    };
    
    
    return { messages, load, loadMessageById, currentMessage };

});

