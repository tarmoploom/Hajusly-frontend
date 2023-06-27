import { ref, Ref } from 'vue';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAuthStore } from '../store/authStore';
import { Student } from '../model/student';

export const url = 'https://api.hajusly.itb2203.tautar.ee/api/';
export const localUrl = 'https://localhost:7116/api/';

export type ApiRequest = () => Promise<void>;

export interface UseableApi<T> {
  response: Ref<T | undefined>;
  status: Ref<Boolean>;
  request: ApiRequest;
}

let apiUrl = '';

interface HTTPClientNamedArgs {
  useBearer: boolean;
}

export class HTTP {
  static client({ useBearer = false }: HTTPClientNamedArgs): AxiosInstance {
    let headers = {
      Accept: 'application/json',
      'Content-type': 'application/json',
    };

    if (useBearer) {
      headers['Authorization'] = 'Bearer ' + useAuthStore().token;
    }

    return axios.create({
      baseURL: apiUrl,
      headers: headers,
    });
  }

  client: AxiosInstance = undefined;

  constructor(args: HTTPClientNamedArgs) {
    this.client = HTTP.client(args);
  }

  async tryGet<T>(url: string, out: Ref<T>): Promise<boolean> {
    try {
      let response = await this.client.get(url);
      out.value = response.data as T;
      return true;
    } catch (e) {
      console.error(e);
    }

    return false;
  }

  async tryPost(url: string, data: any = undefined): Promise<boolean> {
    try {
      if (data == undefined) {
        await this.client.post(url);
      } else await this.client.post(url, data);
      return true;
    } catch (e) {
      console.error(e);
    }

    return false;
  }

  async tryPatch(url: string, data: any = undefined): Promise<boolean> {
    try {
      if (data == undefined) {
        await this.client.patch(url);
      } else await this.client.patch(url, data);
      return true;
    } catch (e) {
      console.error(e);
    }

    return false;
  }

  async tryDelete(url: string, data: any = undefined): Promise<boolean> {
    try {
      if (data == undefined) {
        await this.client.delete(url);
      } else await this.client.delete(url, data);
      return true;
    } catch (e) {
      console.error(e);
    }

    return false;
  }

  async tryDownload<T>(url: string, courseName: string) {
    this.client
    .post(url, {
      responseType: 'arraybuffer'
    })
    .then(function(response) {
      let blob = new Blob([response.data], { type: 'application/csv' })
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = courseName + '_results.csv'
      link.click()
    })
  }
}

export function setApiUrl(url: string) {
  apiUrl = url;
}

export default function useApi<T>(
  url: RequestInfo,
  options?: RequestInit,
): UseableApi<T> {
  const response: Ref<T | undefined> = ref();
  const status: Ref<Boolean> = ref();

  const request: ApiRequest = async () => {
    const res = await fetch(apiUrl + url, options);
    const data = await res.json();
    response.value = data;
    status.value = res.ok;
  };

  return { response, request, status };
}

export function useApiRawRequest(url: RequestInfo, options?: RequestInit) {
  const status: Ref<Boolean> = ref();
  const request: () => Promise<Response> = async () => {
    const req = await fetch(apiUrl + url, options);
    status.value = req.ok;
    return req;
  };
  return { request, status };
}
