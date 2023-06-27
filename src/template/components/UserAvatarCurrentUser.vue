<script setup>
import { useMainStore } from "@/template/stores/main";
import UserAvatar from "@/template/components/UserAvatar.vue";

const mainStore = useMainStore();
</script>

<template>
  <UserAvatar :username="mainStore.userName" :avatar="mainStore.userAvatar">
    <slot />
  </UserAvatar>
</template>
