<template>
  <LayoutAuthenticated>
    <SectionMain>
      <AddModuleForm />
    </SectionMain>
  </LayoutAuthenticated>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import LayoutAuthenticated from "@/template/layouts/LayoutAuthenticated.vue";
import SectionMain from "@/template/components/SectionMain.vue";
import AddModuleForm from '@/components/AddModuleForm.vue';

@Options({
  components: {
    LayoutAuthenticated, SectionMain, AddModuleForm
  },
  props: {
  }
})
export default class AddModuleView extends Vue {
  async mounted()
      : Promise<void> {
    console.log("AddModuleView mounted")
  }


}

</script>
