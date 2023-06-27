<template>
  <SectionTitleLineWithButton :icon="mdiCogOutline" title="Add Students" main>
    <FileUpload
      mode="basic"
      name="fromfile"
      accept="text/csv"
      :maxFileSize="5000000"
      :auto="true"
      :customUpload="true"
      @uploader="fromFile($event)"
      chooseLabel="From .csv"
      uploadIcon="pi pi-users"
      class="p-button-rounded p-button-raised"
    />
  </SectionTitleLineWithButton>
  <div class="grid xl:grid-cols-4 gap-3 mb-4">
    <span>
      <MultiSelect
        v-model="selected"
        :options="courses"
        :filter="true"
        display="chip"
        optionLabel="name"
        placeholder="Register Students to:"
      />
    </span>
  </div>
  <form>
    <div v-for="(val, i) in students" :key="i">
      <div class="grid xl:grid-cols-4 gap-3 mb-4">
        <span>
          <span class="p-input-icon-left">
            <i class="pi pi-user"></i>
            <InputText
              class="px-3 py-2 max-w-full"
              size="16"
              v-model="val.student.firstName"
              placeholder="First name"
              :class="{
                'p-invalid': isInvalid(
                  isIncomplete(val.student),
                  val.student.firstName,
                  i,
                ),
              }"
            />
          </span>
          <small
            v-if="
              isInvalid(isIncomplete(val.student), val.student.firstName, i)
            "
            class="p-error"
            >*First name required</small
          >
        </span>
        <span>
          <span class="p-input-icon-left">
            <i class="pi pi-user" />
            <InputText
              class="px-3 py-2 max-w-full"
              size="16"
              v-model="val.student.lastName"
              placeholder="Last name"
              :class="{
                'p-invalid': isInvalid(
                  isIncomplete(val.student),
                  val.student.lastName,
                  i,
                ),
              }"
            />
          </span>
          <small
            v-if="isInvalid(isIncomplete(val.student), val.student.lastName, i)"
            class="p-error"
            >*Last name required</small
          >
        </span>
        <span>
          <span class="p-input-icon-left">
            <i class="pi pi-at" />
            <InputText
              class="px-3 py-2 max-w-full"
              size="16"
              type="email"
              v-model="val.student.email"
              placeholder="e-mail"
              :class="{
                'p-invalid': isInvalid(
                  isIncomplete(val.student),
                  val.student.email,
                  i,
                ),
              }"
            />
          </span>
          <small
            v-if="isInvalid(isIncomplete(val.student), val.student.email, i)"
            class="p-error"
            >*E-mail required</small
          >
          <small
            v-else-if="
              !email.test(val.student.email) &&
              isIncomplete(val.student) &&
              i < limitValCheck
            "
            class="p-error"
            >*E-mail is not valid</small
          >
        </span>
        <span>
          <span class="p-input-icon-left">
            <i class="pi pi-key" />
            <InputText
              class="px-3 py-2 max-w-full"
              size="16"
              v-model="val.student.studentCode"
              placeholder="studentcode"
              :class="{
                'p-invalid': isInvalid(
                  isIncomplete(val.student),
                  val.student.studentCode,
                  i,
                ),
              }"
            />
          </span>
          <small
            v-if="
              isInvalid(isIncomplete(val.student), val.student.studentCode, i)
            "
            class="p-error"
            >*Code required</small
          >
        </span>
      </div>
      <div
        v-if="i === students.length - 1 && isComplete(val.student)"
        :class="addField()"
      />
    </div>
  </form>
  <div class="btn_align-right">
    <Button
      class="p-button-rounded p-button-raised"
      icon="pi pi-user-plus"
      label="Add student"
      @Click.prevent="addField"
    ></Button>
  </div>
  <br /><br /><br />
  <div v-if="selected !== null && selected.length > 0">
    <div class="center-button">
      <Button
        class="p-button-warning p-button-rounded p-button-raised btn-text-white"
        label="Ok"
        @Click.prevent="submitForm"
      ></Button>
    </div>
  </div>
  <div v-else>
    <div class="center-button">
      <Button
        class="p-button-warning p-button-rounded p-button-raised btn-text-white"
        label="Ok"
        :disabled="true"
      ></Button>
    </div>
  </div>
  <Toast position="bottom-center" />
</template>

<style scoped>
.btn_align-right {
  float: right;
}
</style>

<script lang="ts">
import { Student } from '../model/student';
import { useStudentStore } from '../store/studentsStore';
import { useCourseStore } from '../store/courseStore';
import { defineComponent, Ref, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import MultiSelect from 'primevue/multiselect';
import Papa from 'papaparse';

export default defineComponent({
  data() {
    const student: Ref<Student> = ref({
      firstName: '',
      lastName: '',
      email: '',
      studentCode: '',
      inCourse: [],
    });
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    const courses = useCourseStore().courses;

    const toast = useToast();
    const onSuccess = (msg: string) => {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: msg,
        life: 1500,
      });
    };
    const onFail = (msg: string) => {
      toast.add({
        severity: 'warn',
        summary: 'Warning',
        detail: msg,
        life: 2000,
      });
    };

    return {
      students: [{ student }],
      limitValCheck: 0,
      email: regex,
      onSuccess,
      onFail,
      selected: null,
      courses,
    };
  },
  methods: {
    // field checks
    isIncomplete(student: Student) {
      return (
        student.firstName !== '' ||
        student.lastName !== '' ||
        student.email !== '' ||
        student.studentCode !== ''
      );
    },
    isInvalid(isIncomplete: boolean, val: string, i: number) {
      return isIncomplete && val === '' && i < this.limitValCheck;
    },
    isComplete(student: Student) {
      return (
        student.firstName !== '' &&
        student.lastName !== '' &&
        student.email !== '' &&
        student.studentCode !== ''
      );
    },
    //
    addField() {
      this.students.push({
        student: {
          firstName: '',
          lastName: '',
          email: '',
          studentCode: '',
          inCourse: [],
        },
      });
    },

    async fromFile(event: FileUploadRemoveEvent) {
      if (!this.isComplete(this.students[0].student)) {
        this.students.pop();
      }
      let self = this;
      Papa.parse(event.files[0], {
        skipEmptyLines: true,
        complete: function (res) {
          for (let i = 1; i < res.data.length; i++) {
            const s = res.data[i];
            self.students.push({
              student: {
                firstName: s[0],
                lastName: s[1],
                email: s[2],
                studentCode: s[3],
                inCourse: [],
              },
            });
          }
        },
      });
      this.onSuccess('File content added');
    },

    async submitForm() {
      const incomplete = [];
      let toasted: boolean = false;

      for (let s of this.students) {
        if (this.isComplete(s.student) && this.email.test(s.student.email)) {
          // add courses to student[]
          for (let sc of this.selected) {
            s.student.inCourse.push(sc.id);
          }
          //
          const { addStudent } = useStudentStore();
          await addStudent({ ...s.student });

          if (useStudentStore().getStatus() && !toasted) {
            this.onSuccess('Student(s) added');
            toasted = true;
          } else if (!useStudentStore().getStatus() && !toasted) {
            this.onFail('Server error: something went wrong');
            toasted = false;
          }
        } else if (this.isIncomplete(s.student)) {
          incomplete.push(s);
        }
      }

      this.limitValCheck = incomplete.length;

      // refresh students[]
      this.students = incomplete;
      this.addField();
    },
  },
});
</script>
<script lang="ts" setup>
import SectionTitleLineWithButton from '../template/components/SectionTitleLineWithButton.vue';
import { mdiCogOutline } from '@mdi/js';
import FileUpload, { FileUploadRemoveEvent } from 'primevue/fileupload';
</script>
