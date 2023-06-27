<template>
  <LayoutAuthenticated>
    <SectionMain>
      <TableMessages></TableMessages>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import LayoutAuthenticated from "@/template/layouts/LayoutAuthenticated.vue";
import SectionMain from "@/template/components/SectionMain.vue";
import TableMessages from '@/components/TableMessages.vue';

@Options({
  components: {
    LayoutAuthenticated, SectionMain, TableMessages
  },
  props: {
  }
})
export default class MessagesView extends Vue {
  async mounted()
      : Promise<void> {
    console.log("MessagesView mounted")
  }


}

</script>
