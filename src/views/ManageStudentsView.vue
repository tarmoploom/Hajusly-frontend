<template>
  <LayoutAuthenticated>
    <SectionMain>
<!--      <TableEditStudents></TableEditStudents>-->
    </SectionMain>
  </LayoutAuthenticated>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import LayoutAuthenticated from "@/template/layouts/LayoutAuthenticated.vue";
import SectionMain from "@/template/components/SectionMain.vue";
import TableEditStudents from '@/components/TableEditStudents.vue';

@Options({
  components: {
    LayoutAuthenticated, SectionMain, TableEditStudents
  },
  props: {
  }
})
export default class ManageStudentsView extends Vue {
  async mounted()
      : Promise<void> {
    console.log("ManageStudentsView mounted")
  }


}

</script>
