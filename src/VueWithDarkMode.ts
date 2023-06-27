import { Vue } from "vue-class-component";
import { ref, Ref } from "vue";

import EventSystem from "./EventSystem/EventSystem";
import { EventType } from "./EventSystem/EventType";

import { darkModeKey } from "./template/config";


import "./assets/primeVueDarkMode.css";
import Log from "./Log";

export default class VueWithDarkMode extends Vue {

  component: VueWithDarkModeRaw = null


  mounted() {
    this.component = new VueWithDarkModeRaw()
  }

  beforeDestroy() {
    if (this.component != null) {
      this.component.beforeDestroy()
    }
  }

}

export class VueWithDarkModeRaw {

  darkMode: string = "0"

  darkModeChangedFun: Ref<Function> = ref(() => {
    if (typeof localStorage !== "undefined") {
      this.darkMode = localStorage.getItem(darkModeKey);
    }
  })

  constructor() {
    this.mounted()
  }

  public mounted() {
    this.darkModeChangedFun.value()
    EventSystem.listenEvent(EventType.DARK_MODE_CHANGED, this.darkModeChangedFun)
  }

  public beforeDestroy() {
    EventSystem.removeEvent(this.darkModeChangedFun)
  }

}
