<script setup>
import {mdiForwardburger, mdiBackburger, mdiMenu, mdiViewList, mdiMonitor, mdiTable, mdiAccountCircle} from "@mdi/js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import menuNavBar from "@/template/menuNavBar.js";
import { useMainStore } from "@/template/stores/main.js";
import { useStyleStore } from "@/template/stores/style.js";
import BaseIcon from "@/template/components/BaseIcon.vue";
import FormControl from "@/template/components/FormControl.vue";
import NavBar from "@/template/components/NavBar.vue";
import NavBarItemPlain from "@/template/components/NavBarItemPlain.vue";
import AsideMenu from "@/template/components/AsideMenu.vue";
import FooterBar from "@/template/components/FooterBar.vue";
import {useCourseStore} from "@/store/courseStore";
import {useAuthStore} from "@/store/authStore";
import {Menu} from "@/Menu";
import { darkModeKey, styleKey } from "@/template/config";


import { authenticatedUserStore } from "@/store/userStore";

let testMenu = ref();

onMounted(async () => {
  Menu.Instantiate()
  Menu.Instance.menu = testMenu
  Menu.Instance.forceRerender = forceRerender

  Menu.Instance.loadMenuSync()
  forceRerender();

  // just let it run in coroutine thread like
  (async () => {
    await Menu.Instance.loadMenuAsync()
  })();

  // just let it run in coroutine thread like
  (async () => {
    await loadUserData();
  })();
});


const componentKey = ref(0);

const forceRerender = () => {
  componentKey.value += 1;
};


useMainStore().setUser({
  name: "null",
  email: "null",
  avatar:
      "null",
});


const loadUserData = async () => {
  const userStore = authenticatedUserStore();
  await userStore.load();
  useMainStore().setUser({
    name: userStore.authenticatedUser[0].name,
    email: userStore.authenticatedUser[0].email,
    avatar:
        "https://avatars.dicebear.com/api/avataaars/example.svg?options[top][]=shortHair&options[accessoriesChance]=93",
  });
}



const layoutAsidePadding = "xl:pl-60";

const styleStore = useStyleStore();
styleStore.setStyle("white");


const router = useRouter();

const isAsideMobileExpanded = ref(false);
const isAsideLgActive = ref(false);

router.beforeEach((to, from, next) => {
  const useAuth = useAuthStore();
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if(useAuth.isAuthenticated) {
      next();
      return;
    }
    next('/');
  } else {
    isAsideMobileExpanded.value = false;
    isAsideLgActive.value = false;
    next();
  }
});

const menuClick = (event, item) => {
  if (item.isToggleLightDark) {
    styleStore.setDarkMode();
  }

  if (item.isLogout) {
    const useAuth = useAuthStore();
    useAuth.logout();
    router.push("/");
  }
};

// refreshing page should read dark mode key again from local storage
if (typeof localStorage !== "undefined") {
  let darkMode = localStorage.getItem(darkModeKey);
  styleStore.setDarkMode(darkMode == "1");
}

console.log(useCourseStore().courses);
</script>

<template>
  <div
    :class="{
      dark: styleStore.darkMode,
      'overflow-hidden lg:overflow-visible': isAsideMobileExpanded,
    }"
  >
    <div
      :class="[layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded }]"
      class="pt-14 min-h-screen w-screen transition-position lg:w-auto bg-gray-50 dark:bg-slate-800 dark:text-slate-100"
    >
      <NavBar
        :menu="menuNavBar"
        :class="[
          layoutAsidePadding,
          { 'ml-60 lg:ml-0': isAsideMobileExpanded },
        ]"
        @menu-click="menuClick"
      >
        <NavBarItemPlain
          display="flex lg:hidden"
          @click.prevent="isAsideMobileExpanded = !isAsideMobileExpanded"
        >
          <BaseIcon
            :path="isAsideMobileExpanded ? mdiBackburger : mdiForwardburger"
            size="24"
          />
        </NavBarItemPlain>
        <NavBarItemPlain
          display="hidden lg:flex xl:hidden"
          @click.prevent="isAsideLgActive = true"
        >
          <BaseIcon :path="mdiMenu" size="24" />
        </NavBarItemPlain>
        <NavBarItemPlain use-margin>
          <FormControl
            placeholder="Search (ctrl+k)"
            ctrl-k-focus
            transparent
            borderless
          />
        </NavBarItemPlain>
      </NavBar>
      <AsideMenu
        :is-aside-mobile-expanded="isAsideMobileExpanded"
        :is-aside-lg-active="isAsideLgActive"
        :menu="testMenu"
        @menu-click="menuClick"
        @aside-lg-close-click="isAsideLgActive = false"
      />
<!--      TODO: not using componentKey to update menu partially instead of all, \/ can be removed \/ -->
<!--      <AsideMenu-->
<!--          :is-aside-mobile-expanded="isAsideMobileExpanded"-->
<!--          :is-aside-lg-active="isAsideLgActive"-->
<!--          :menu="testMenu"-->
<!--          :key="componentKey"-->
<!--          @menu-click="menuClick"-->
<!--          @aside-lg-close-click="isAsideLgActive = false"-->
<!--      />-->
      <slot />
      <FooterBar>
        on ju parem
      </FooterBar>
    </div>
  </div>
</template>
