<template>
  <LayoutAuthenticated>
    <SectionMain>
      <CreateCourseForm />
    </SectionMain>
  </LayoutAuthenticated>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import LayoutAuthenticated from "@/template/layouts/LayoutAuthenticated.vue";
import SectionMain from "@/template/components/SectionMain.vue";
import CreateCourseForm from '@/components/CreateCourseForm.vue';

@Options({
  components: {
    LayoutAuthenticated, SectionMain, CreateCourseForm
  },
  props: {
  }
})
export default class CreateCourseView extends Vue {
  async mounted()
      : Promise<void> {
    console.log("CreateCourseView mounted")
  }


}

</script>
