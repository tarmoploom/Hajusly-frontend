
<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiChartTimelineVariant"
        title="Overview"
        main
      >
      </SectionTitleLineWithButton>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <CardBoxWidget
          trend="12%"
          trend-type="up"
          color="text-emerald-500"
          :icon="mdiAccountMultiple"
          v-model:number="studentsCount"
          label="Students"
        />
        <CardBoxWidget
          trend="deadline approaching"
          trend-type="alert"
          color="text-red-500"
          :icon="mdiChartTimelineVariant"
          :number="68"
          suffix="%"
          label="Assignments done"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="flex flex-col justify-between">
          <CardBoxTransaction
            v-for="(transaction, index) in transactionBarItems"
            :key="index"
            :amount="transaction.amount"
            :date="transaction.date"
            :business="transaction.business"
            :type="transaction.type"
            :name="transaction.name"
            :account="transaction.account"
          />
        </div>
        <div class="flex flex-col justify-between">
          <CardBoxClient
            v-for="client in clientBarItems"
            :key="client.id"
            :name="client.name"
            :login="client.login"
            :date="client.created"
            :progress="client.progress"
          />
        </div>
      </div>


      <SectionTitleLineWithButton :icon="mdiChartPie" title="Course Overview">
        <FormField label="Course name to filter">
          <FormControl v-model="tfFilterByCourseName" name="courseName" @input="filterCourses()"/>
        </FormField>
        <div style="display: flex; justify-content: end;">
          <BaseButton
            :icon="mdiFormatListText"
            label="courses"
            color="whiteDark"
            :class="{'base-button-active': activeTab == 0}"
            @click="showAllCourses()"
          />
          <BaseButton
            :icon="mdiArchive"
            label="Archive"
            color="whiteDark"
            :class="{'base-button-active': activeTab == 1}"
            @click="showArcivedCourses()"
          />
        </div>
      </SectionTitleLineWithButton>
      <CardBox class="max-h-96 overflow-x-auto">
        <table>
          <thead>
          <tr>
            <th></th>
            <th>Course name</th>
            <th>Students</th>
            <th>Modules</th>
            <th>Time</th>
            <th></th>
            <th />
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in coursesList">
            <td>
              <BaseIcon ></BaseIcon>
            </td>
            <td>{{ item.course.name }}</td>
            <td>{{ item.studentsCount }}</td>
            <td>{{ item.modulesCount }}</td>
            <td>{{ formatDate(item.course.courseStart) }}-{{ formatDate(item.course.courseEnd) }}</td>
            <td>
              <BaseButtons type="justify-start lg:justify-end" no-wrap>
                <BaseButton v-if="activeTab == 0"
                            color="danger"
                            :icon="mdiArchive"
                            small
                            @click="archiveCourse(item.course.id)"
                />
                <BaseButton v-if="activeTab == 1"
                            :icon="mdiReload"
                            small
                            @click="recoverCourse(item.course.id)"
                />
                <BaseButton v-if="activeTab == 0"
                            :icon="mdiArrowCollapseRight"
                            small
                            @click="goToCourse(item.course.id)"
                />
                <BaseButton 
                            :icon="mdiBookPlusMultipleOutline"
                            small
                            @click="createNewCourse(item.course)"
                />
              </BaseButtons>
            </td>
          </tr>
          </tbody>
        </table>
      </CardBox>

      <SectionTitleLineWithButton :icon="mdiChartPie" title="Trends overview">
        <BaseButton
          :icon="mdiReload"
          color="whiteDark"
          @click="fillChartData"
        />
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <div v-if="chartData">
          <line-chart :data="chartData" class="h-96" />
        </div>
      </CardBox>

          <Dialog v-model:visible="displayModal"
              :modal="true"
              :closeOnEscape="true"
              :dismissableMask="true"
              :style="{width: '500px'}">
            <template #header>
              <h3>Create a new course based on {{selectedCourse.name}}</h3>
            </template>

            <FormField>
              <FormControl v-model="selectedCourse.name" placeholder="Course name" :icon="mdiFormTextbox"/>
            </FormField>

            <FormField>
              <FormControl v-model="selectedCourse.code" placeholder="Course code" :icon="mdiFormTextbox"/>
            </FormField>

            <FormField>
              <Calendar v-model="selectedCourse.courseStart" placeholder="From" class="border-gray-700 rounded w-full border bg-white dark:bg-slate-800" style="--dp-border-color: white; --dp-border-color-hover: white;" ></Calendar>
              <Calendar v-model="selectedCourse.courseEnd" placeholder="Until" class="border-gray-700 rounded w-full border bg-white dark:bg-slate-800" style="--dp-border-color: white; --dp-border-color-hover: white;"></Calendar>
            </FormField>

            <template #footer>
              <Button @click="closeModal($event)" label="Cancel" icon="pi pi-times" class="p-button-text"/>
              <Button @click="createCourse($event)" label="Save" icon="pi pi-check" autofocus />
            </template>
      </Dialog>
      <Toast position="top-center" group="bottom-simple" />
    </SectionMain>
  </LayoutAuthenticated>
</template>


<script lang="ts">

import {
  mdiAccountMultiple, mdiCartOutline, mdiChartTimelineVariant, mdiMonitorCellphone,
  mdiReload, mdiGithub, mdiChartPie, mdiFormTextbox, mdiStar, mdiPercentCircleOutline,
  mdiTrashCan, mdiArchive, mdiFormatListText, mdiArrowCollapseRight, mdiBookPlusMultipleOutline
} from "@mdi/js"


import { Options, Vue } from "vue-class-component"
import { computed, ref } from "vue";

import VueWithDarkMode from "../VueWithDarkMode"

import * as chartConfig from "../template/components/Charts/chart.config.js"
import LineChart from "../template/components/Charts/LineChart.vue"
import SectionMain from "../template/components/SectionMain.vue"
import CardBoxWidget from "../template/components/CardBoxWidget.vue"
import CardBox from "../template/components/CardBox.vue"
import TableSampleClients from "../template/components/TableSampleClients.vue"
import NotificationBar from "../template/components/NotificationBar.vue"
import BaseButton from "../template/components/BaseButton.vue"
import CardBoxTransaction from "../template/components/CardBoxTransaction.vue"
import CardBoxClient from "../template/components/CardBoxClient.vue"
import LayoutAuthenticated from "../template/layouts/LayoutAuthenticated.vue"
import SectionTitleLineWithButton from "../template/components/SectionTitleLineWithButton.vue"
import SectionBannerStarOnGitHub from "../template/components/SectionBannerStarOnGitHub.vue"
import FormField from "../template/components/FormField.vue";
import FormControl from "../template/components/FormControl.vue";
import { useMainStore } from "../template/stores/main";

import Log from "../Log";
import { Course } from "../model/course";
import { CourseStore, useCourseStore } from "../store/courseStore";
import { CourseExtended } from "../model/CourseExtended";
import { StudentStore } from "../store/studentsStore";
import { Menu } from "../Menu";
import { useToast } from "primevue/usetoast";
import { useRouter } from 'vue-router';


@Options({
  components: {
    LineChart, SectionMain, CardBoxWidget, CardBox, TableSampleClients, NotificationBar,
    BaseButton, CardBoxTransaction, CardBoxClient, LayoutAuthenticated, SectionTitleLineWithButton,
    SectionBannerStarOnGitHub, FormField, FormControl
  },
  data() {
    return {
      mdiAccountMultiple, mdiCartOutline, mdiChartTimelineVariant, mdiMonitorCellphone,
      mdiReload, mdiGithub, mdiChartPie, mdiFormTextbox, mdiStar, mdiPercentCircleOutline,
      mdiTrashCan, mdiArchive, mdiFormatListText, mdiArrowCollapseRight, mdiBookPlusMultipleOutline
    }
  },
  props: {
    courseIdProp: String,
    rootModuleIdProp: String
  }
})
export default class HomeView extends VueWithDarkMode {

  chartData = null
  origCoursesList: CourseExtended[] = []
  coursesList: CourseExtended[] = []
  activeTab = 0

  studentsCount = 0
  clientBarItems = []
  transactionBarItems = []

  tfFilterByCourseName = ""
  displayModal: boolean = false;
  selectedCourse: Course = { name:'', code: '' };
  toast = useToast();
  router = useRouter();


  async mounted()
  : Promise<void> {
    super.mounted()

    Log.d("mounted")

    await this.init()
  }

  async updated()
  : Promise<void> {
    Log.d("updated")

    await this.init()
  }

  async init()
  : Promise<void> {
    this.fillChartData()
    await this.loadAllCourses()
    await this.showAllCourses()

    let students = await StudentStore.getAll()
    this.studentsCount = students.length

    let  mainStore = useMainStore()
    this.clientBarItems = computed(() => mainStore.clients.slice(0, 4))
    this.transactionBarItems = computed(() => mainStore.history);
  }

  async loadAllCourses()
  : Promise<void> {
    this.origCoursesList = await CourseStore.getAllCoursesExtended({
      includeStudentsCount: true,
      includeModulesCount: true
    })
  }

  async showAllCourses()
  : Promise<void> {

    this.activeTab = 0
    this.filterCourses()
  }

  async showArcivedCourses()
  : Promise<void> {

    this.activeTab = 1
    this.filterCourses()
  }

  async archiveCourse(courseId: number)
  : Promise<void> {
    if (await CourseStore.archiveCourse(courseId)) {
      await this.loadAllCourses()

      if (this.activeTab == 0) {
        await this.showAllCourses()
      }
      else if (this.activeTab == 1) {
        await this.showArcivedCourses()
      }

      Menu.Instance.updateCoursesInMenu(this.origCoursesList.filter(it => it.course.isArchived == false).map(it => it.course))
    }
  }

  async recoverCourse(courseId: number)
  : Promise<void> {
    if (await CourseStore.unArchiveCourse(courseId)) {
      await this.loadAllCourses()

      if (this.activeTab == 0) {
        await this.showAllCourses()
      }
      else if (this.activeTab == 1) {
        await this.showArcivedCourses()
      }

      Menu.Instance.updateCoursesInMenu(this.origCoursesList.filter(it => it.course.isArchived == false).map(it => it.course))
    }
  }

  createNewCourse(course: Course)
   {
    this.displayModal = true;
    this.selectedCourse.name = course.name;
    this.selectedCourse.code = course.code;
    this.selectedCourse.courseStart = course.courseStart;
    this.selectedCourse.courseEnd = course.courseEnd;
    this.selectedCourse.id = course.id;
  }

  async createCourse()
  : Promise<void> {
    const { createNewCourse } = useCourseStore();
    const res = await createNewCourse(this.selectedCourse);
				if (typeof res == 'number') 
				{
					this.router.push({ name: 'courseView', params: {id: res}});
				}
				else
				{
					this.toast.add({
						severity: 'error',
						summary: 'Error',
						detail: res.data,
						life: 3000,
						group: 'bottom-simple'
					})
				}
  }


  formatDate(dateString: string) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {dateStyle: 'long'}).format(date);
  }

  filterCourses() {
    if (this.activeTab == 0) {
      this.coursesList = this.origCoursesList.filter(it => it.course.isArchived == false && it.course.name.toLowerCase().indexOf(this.tfFilterByCourseName.toLowerCase()) != -1)
    }
    else if (this.activeTab == 1) {
      this.coursesList = this.origCoursesList.filter(it => it.course.isArchived == true && it.course.name.toLowerCase().indexOf(this.tfFilterByCourseName.toLowerCase()) != -1)
    }
  }

  closeModal(event: any)
  : void {
    this.displayModal = false
    this.selectedCourse;    
    
    this.$refs.cm.hide()
    this.$refs.cmProgressHeader.hide()
  }

  goToCourse(courseId: number) {
    this.$router.push({ name: 'resultlist', params: { courseIdProp: courseId, rootModuleIdProp: "null" }})
  }

  fillChartData() {
    this.chartData = chartConfig.sampleChartData()
  }
}

</script>

<style>
.p-button.base-button-active,
.dark .p-button.base-button-active {
  background-color: #71717A;
}
</style>
