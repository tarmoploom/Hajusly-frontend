<template>
  <LayoutAuthenticated>
    <SectionMain>
      <AddStudentForm />
    </SectionMain>
  </LayoutAuthenticated>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import LayoutAuthenticated from '../template/layouts/LayoutAuthenticated.vue';
import SectionMain from '../template/components/SectionMain.vue';
import AddStudentForm from '../components/AddStudentForm.vue';

@Options({
  components: {
    LayoutAuthenticated,
    SectionMain,
    AddStudentForm,
  },
  props: {},
})
export default class AddStudentView extends Vue {
  async mounted(): Promise<void> {
    console.log('AddStudentView mounted');
  }
}
</script>
