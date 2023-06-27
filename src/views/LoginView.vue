<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { mdiAccount, mdiAsterisk } from '@mdi/js';
import SectionFullScreen from '@/template/components/SectionFullScreen.vue';
import CardBox from '@/template/components/CardBox.vue';
import FormCheckRadio from '@/template/components/FormCheckRadio.vue';
import FormField from '@/template/components/FormField.vue';
import FormControl from '@/template/components/FormControl.vue';
import BaseButton from '@/template/components/BaseButton.vue';
import BaseButtons from '@/template/components/BaseButtons.vue';
import LayoutGuest from '@/template/layouts/LayoutGuest.vue';

import { routes } from '../router/index.js';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();

const form = reactive({
  login: '',
  pass: '',
  remember: true,
});

const router = useRouter();
let showError = ref(false);

const submit = async () => {
  let submitUser = { Username: form.login, Password: form.pass };
  showError.value = !(await authStore.login(submitUser));
  if (showError.value == false) {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.align-left {
  float: left;
}
.align-right {
  float: right;
}
</style>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="purplePink">
      <CardBox :class="cardClass" is-form @submit.prevent="submit">
        <FormField label="Login" help="Please enter your login">
          <FormControl
            v-model="form.login"
            :icon="mdiAccount"
            name="login"
            autocomplete="username"
          />
        </FormField>

        <FormField label="Password" help="Please enter your password">
          <FormControl
            v-model="form.pass"
            :icon="mdiAsterisk"
            type="password"
            name="password"
            autocomplete="current-password"
          />
        </FormField>

        <FormCheckRadio
          v-model="form.remember"
          name="remember"
          label="Remember"
          :input-value="true"
        />

        <template #footer>
          <div class="align-left">
            <BaseButtons>
              <BaseButton type="submit" color="info" label="Login" />
              <BaseButton to="/dashboard" color="info" outline label="Back" />
            </BaseButtons>
          </div>
          <div class="align-right">
            <BaseButtons>
              <BaseButton
                to="/register"
                color="info"
                outline
                label="Register"
              />
            </BaseButtons>
          </div>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
