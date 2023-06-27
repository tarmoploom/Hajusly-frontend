<template>
  <LayoutAuthenticated>
    <SectionMain :key="courseId">
      <SectionTitleLineWithButton
        :icon="mdiTelevisionGuide"
        :title= "course.name"
        main
      >
        <BaseButtons>
          <BaseButton
              label="Add module"
              @Click="addModule"
              color="info"
              :icon="mdiOpenInNew"
          />
          <BaseButton
              label="Manage Students"
              @Click="manageStudents"
              color="info"
              :icon="mdiAccountDetails"

          />
          <BaseButton
            label="Edit Tags"
            @Click="editTags"
            color="info"
            :icon="mdiTag"

          />
        </BaseButtons>

      </SectionTitleLineWithButton>
      <div class="row text-lg font-semibold" style="display: flex;">
        <div class="column" style="padding-right: 2%;">
          Course code:
          <br/>
          Beginning of course:
          <br/>
          End of course:
        </div>
        <div class="column">
          {{course.code}}
          <br/>
          {{course.start}}
          <br/>
          {{course.end}}
        </div>
        <Buttons style="display:block;  margin-right: 0;  margin-left:auto;">
          <Button type="button"
                          class="p-button-rounded p-button-warning btn-white-text"
                          icon="pi pi-pencil"
                          style="margin-right: .1em"
                          @Click="editCourse"
                        ></Button>
      </Buttons>
      </div>

      <div class="card" v-if="modules.length">
          <TreeTable :value="modules" >
              <Column field="name" header="Module" :expander="true"></Column>
              <Column field="abbreviation" header="Abbreviation"></Column>
              <Column field="maxPoints" header="Max points"></Column>
              <Column headerStyle="width: 10em" bodyStyle="text-align: center">
                <template #body="slotProps">
                  <Buttons>
                    <Button type="button"
                      class="p-button-rounded p-button-default btn-white-text"
                      icon="pi pi-plus"
                      style="margin-right: .3em"
                      @Click="addModule(slotProps)"
                    ></Button>
                    <Button type="button"
                        class="p-button-rounded p-button-warning btn-white-text"
                        icon="pi pi-pencil"
                        style="margin-right: .1em"
                        @Click="editModule(slotProps)"
                      ></Button>
                  </Buttons>
                </template>
            </Column>
          </TreeTable>
      </div>

      <BaseDivider />

    </SectionMain>
  </LayoutAuthenticated>
</template>


<script lang="ts" >
import { computed, ref, Ref, onMounted, defineComponent } from "vue";
import {
  mdiOpenInNew,
  mdiNewspaperVariant,
  mdiTelevisionGuide,
  mdiAccountDetails,
  mdiTag
} from "@mdi/js";
import { Course } from '@/model/course';
import { Module } from '@/model/module';

import BaseButtons from "@/template/components/BaseButtons.vue";
import BaseButton from "@/template/components/BaseButton.vue";
import LayoutAuthenticated from "@/template/layouts/LayoutAuthenticated.vue";

import {Options} from "vue-class-component";


import { useRoute, useRouter } from 'vue-router';
import {useAuthStore} from "../store/authStore";
import useApi, { useApiRawRequest } from '../modules/api';
import { VueWithDarkModeRaw } from "../VueWithDarkMode";

export default defineComponent({
  components: {BaseButton, BaseButtons},

  data() {
    const route = useRoute();
    const courseId = route.params.id;

    const course: Course = { name:'', code: '123' };
    this.course = this.loadCourse(courseId);

    const modules: Module = { name: '', maxPoints: 0, courseId: courseId };
    this.modules = this.loadModules(courseId);

    let vueWithDarkModeRaw: VueWithDarkModeRaw = null

    return { course, courseId, mdiTelevisionGuide, modules, router: useRouter(), mdiAccountDetails, mdiOpenInNew, mdiTag, BaseButton, BaseButtons, LayoutAuthenticated, vueWithDarkModeRaw
    }
  },
  methods: {
    formatDate(dateString: string) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {dateStyle: 'long'}).format(date);
    },
    async loadCourse (courseId) {
      const authStore = useAuthStore();

      const res = useApi<Course>('courses/' + courseId, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + authStore.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    });
      await res.request();

      if (res.response.value) {
        var data = res.response.value;
        this.course = data;
        this.course.start = this.formatDate(data.courseStart);
        this.course.end = this.formatDate(data.courseEnd);
        return data;
      }
    },
    async loadModules (courseId) {
      const authStore = useAuthStore();

      const res = useApi<Module>('courses/' + courseId + '/modules', {
        headers: {
          Authorization: 'Bearer ' + authStore.token,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      });
      await res.request();

      if (res.response.value) {
        var data = res.response.value;
        this.modules = this.convertModulesToNodes(data, this);
        return data;
      }
    },
    convertModulesToNodes(modules: Module[], that) {
      modules.forEach(function(module) {
        module.data = module;
        module.key = module.id;
        if (module.children && module.children.length) {
          that.convertModulesToNodes(module.children, that);
        }
      })
      return modules;
    },
    addModule(data) {
      const router = this.router;
      var parentId = '-';
      if (data && data.node) {
        parentId = data.node.id;
      }
      router.push({ name: 'addModule', params: {courseId: this.courseId, parentId: parentId}});
    },    
    editModule(data) {
      const router = this.router;
      if (data && data.node) {
        var moduleId = data.node.id;
        router.push({ name: 'editModule', params: {courseId: this.courseId, parentId: moduleId}});
      }
    },
    editCourse() {
      const router = this.router;
        router.push({ name: 'editCourse', params: {courseId: this.courseId}});
    },
    manageStudents(data) {
      const router = this.router;
      var parentId = '-';
      if (data && data.node) {
        parentId = data.node.id;
      }
      router.push({ name: 'manageStudents', params: {courseId: this.courseId, parentId: parentId}});
    },
    editTags(data) {
      const router = this.router;
      let parentId = '-';
      if (data && data.node) {
        parentId = data.node.id;
      }
      router.push({ name: 'editCourseTags', params: {courseId: this.courseId, parentId: parentId}});
    }
  },


  updated() {
    const route = useRoute();
    const courseId = route.params.id;
    this.course = this.loadCourse(courseId);
    this.modules = this.loadModules(courseId);
  },

  mounted() {
    this.vueWithDarkModeRaw = new VueWithDarkModeRaw()
  },

  beforeDestroy() {
    if (this.vueWithDarkModeRaw != null) {
      this.vueWithDarkModeRaw.beforeDestroy();
    }
  }

})

</script>

