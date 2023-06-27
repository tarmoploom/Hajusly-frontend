<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { mdiAccount, mdiAsterisk, mdiEmail } from '@mdi/js';
import SectionFullScreen from '@/template/components/SectionFullScreen.vue';
import CardBox from '@/template/components/CardBox.vue';
import FormCheckRadio from '@/template/components/FormCheckRadio.vue';
import FormField from '@/template/components/FormField.vue';
import FormControl from '@/template/components/FormControl.vue';
import BaseButton from '@/template/components/BaseButton.vue';
import BaseButtons from '@/template/components/BaseButtons.vue';
import LayoutGuest from '@/template/layouts/LayoutGuest.vue';
import { useRegisterStore } from '@/store/registerStore';
import { useToast } from 'primevue/usetoast';

const store = useRegisterStore();

const form = reactive({
  name: '',
  email: '',
  pass: '',
  pass2: '',
  showpsw: false,
});

const router = useRouter();

const submit = async () => {
  let user = {
    name: form.name,
    emailAddress: form.email,
    password: form.pass,
    username: form.name,
  };
  await store.register(user);

  if (store.getStatus()) {
    onSuccess('Yoohey');
    setTimeout(() => router.push('/'), 1500);
  } else {
    onFail('user ' + user.username + ' is already registered');
  }
};

const toast = useToast();
const onSuccess = (msg) => {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: msg,
    life: 1150,
  });
};
const onFail = (msg) => {
  toast.add({
    severity: 'warn',
    summary: 'Warning',
    detail: msg,
    life: 2250,
  });
};

const textOrPsw = (showpsw) => {
  if (showpsw === true) return 'text';
  else return 'password';
};
</script>

<style></style>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="purplePink">
      <CardBox :class="cardClass" is-form @submit.prevent="submit">
        <FormField label="Name" help="Please enter your name">
          <FormControl
            v-model="form.name"
            :icon="mdiAccount"
            name="name"
            :required="true"
            autocomplete="username"
            :withcredentials="true"
          />
        </FormField>

        <FormField label="E-mail" help="Please enter your e-mail">
          <FormControl
            v-model="form.email"
            :icon="mdiEmail"
            name="email"
            type="email"
            :required="true"
          />
        </FormField>

        <FormField label="Password" help="Please enter a new password">
          <FormControl
            v-model="form.pass"
            :icon="mdiAsterisk"
            name="password"
            :type="textOrPsw(form.showpsw)"
            :required="true"
            autocomplete="password"
            :withCredentials="true"
          />
        </FormField>

        <FormField label="" help="Please re-enter your new password">
          <FormControl
            v-model="form.pass2"
            :icon="mdiAsterisk"
            name="password"
            :type="textOrPsw(form.showpsw)"
            :required="true"
          />
        </FormField>

        <FormCheckRadio
          v-model="form.showpsw"
          name="showpsw"
          label="Show password"
          :inputValue="false"
        />

        <template #footer>
          <BaseButtons>
            <div v-if="form.pass === form.pass2">
              <BaseButton type="submit" color="info" label="Register" />
              <BaseButton to="/" color="info" outline label="Back" />
            </div>
            <div v-else>
              <BaseButton :disabled="true" color="info" label="Register" />
              <BaseButton to="/" color="info" outline label="Back" />
            </div>
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
  <Toast />
</template>
