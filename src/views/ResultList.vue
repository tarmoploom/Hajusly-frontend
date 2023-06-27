<template>

  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        title="Result List"
        main
      >
        <Button v-if="this.rootModuleId != null"
                type="button"
                class="p-button-rounded p-button-default btn-white-text"
                icon="pi pi-undo"
                style="margin-right: .5em"
                @Click="goBack"
        />
<!-- just to get size right -->
        <Button v-else
                type="button"
                class="p-button-rounded p-button-default btn-white-text"
                icon="pi pi-undo"
                style="margin-right: .5em; visibility: hidden"
        />

      </SectionTitleLineWithButton>

      <table>
        <tr>
          <td style="text-align: right;">Select Course</td>
          <td style="width: 40%">
            <Dropdown v-model="selectedCourseId"
                      v-model:options="courses"
                      optionLabel="name"
                      optionValue="id"
                      :filter="true"
                      placeholder="Select a Course" @change="courseChanged()"/>
          </td>
          <td style="width: 5%">
            <BaseButton v-if="this.rootModuleId == null"
            :icon="mdiFileDelimited "
            label="Export to CSV"
            color="whiteDark"
            @click="downloadCSV()"
          />
          <BaseButton v-else
            :icon="mdiFileDelimited "
            label="Export to CSV"
            style="margin-right: .5em; visibility: hidden"
          />
          </td>
        </tr>
      </table>


      <br/>

      <span class="p-fluid">
          <AutoComplete :multiple="true" v-model="selectedFilters"
                        :suggestions="filteredFilters"
                        @complete="updateFilters($event)"
                        @focus="showAllFilters()"
                        :dropdown="true" id="multiple-filters"
                        @change="filtersChanged($event)"
                        placeholder="Filter tags">
            <template #item="slotProps">
              <div v-if="slotProps.item.type == 'TAG'"
                   :style="{ 'color': slotProps.item.color }"><i class="pi pi-hashtag" /> {{ slotProps.item.name }}</div>
              <div v-else
                   :style="{ 'color': slotProps.item.color }">{{ slotProps.item.name }}</div>
            </template>
            <template #chip="slotProps">
              <div v-if="slotProps.value.type == 'TAG'"
                   :style="{ 'color': slotProps.value.color }"><i class="pi pi-hashtag" /> {{ slotProps.value.name }}</div>
              <div v-else
                   :style="{ 'color': slotProps.value.color }">{{ slotProps.value.name }}</div>
            </template>
          </AutoComplete>
      </span>

      <br/>

      <Breadcrumb :home="navigationHome" :model="navigationTree">
        <template #item="{item}">
          <span v-if="item.isDisabled">
            <Button v-if="item.icon != null" :icon="item.icon" :label="item.title" class="p-button-link p-breadcrumb-button p-disabled" />
            <Button v-else :label="item.title" class="p-button-link p-breadcrumb-button p-disabled"/>
          </span>
          <span v-else>
            <Button v-if="item.icon != null" :icon="item.icon" :label="item.title" class="p-button-link p-breadcrumb-button" @click="goTo(item.link)" />
            <Button v-else :label="item.title" class="p-button-link p-breadcrumb-button" @click="goTo(item.link)"/>
          </span>
        </template>
      </Breadcrumb>


        <DataTable :value="students" :autoLayout="true">
<!--          <Column header="">-->
<!--            <template #body="slotProps">-->
<!--              <Checkbox :binary="true" />-->
<!--            </template>-->
<!--          </Column>-->
          <Column header="Code">
            <template #body="slotProps">
              <div @contextmenu="rowRightClick($event, slotProps.data)" @click="getStudentResults(slotProps)"> {{ slotProps.data.studentCode }} </div>
            </template>
          </Column>
          <Column header="First name">
            <template #body="slotProps">
              <div @contextmenu="rowRightClick($event, slotProps.data)" @click="getStudentResults(slotProps)"> {{ slotProps.data.firstName }} </div>
            </template>
          </Column>
          <Column header="Last name">
            <template #body="slotProps">
              <div @contextmenu="rowRightClick($event, slotProps.data)" @click="getStudentResults(slotProps)"> {{ slotProps.data.lastName }} </div>
            </template>
          </Column>

          <Column>
            <template #header>
              <div class="modules-row" @contextmenu="progressHeaderRightClick($event)">
                <span v-for="item in progress" class="module-item">
                  <span class=".module-item-content" @contextmenu="progressHeaderRightClick($event, item.id)">
                    <span class="dig-deeper-link" v-if="item.children != undefined && item.children.length > 0">
                      <RouterLink :to="{ name: 'resultlist', params: { courseIdProp: courseId, rootModuleIdProp: item.id } }">
                         {{ item.abbreviation }}
                      </RouterLink>
                    </span>
                    <span v-else>
                      {{ item.abbreviation }}
                    </span>
                  </span>
                </span>
              </div>
            </template>
            <template #body="slotProps">
              <div class="modules-row">
                <span v-for="item in progress" class="module-item">
                  <Button v-if="hasFullyDone(slotProps.data.id, item.id) === true"
                          @contextmenu="progressRightClick($event, slotProps.data.id, item.id)"
                          @click="progressReset(slotProps.data.id, item.id)"
                          aria-haspopup="true"
                          label=""
                          icon="pi pi-plus"
                          class="p-button-success progress-btn" />
                  <Button v-else-if="hasPartiallyDone(slotProps.data.id, item.id) === true"
                          @contextmenu="progressRightClick($event, slotProps.data.id, item.id)"
                          @click="progressReset(slotProps.data.id, item.id)"
                          label=""
                          icon="pi pi-plus"
                          class="p-button-warning progress-btn" />
                  <Button v-else
                          @contextmenu="progressRightClick($event, slotProps.data.id, item.id)"
                          @click="progressFill(slotProps.data.id, item.id)"
                          label=""
                          icon="pi pi-plus"
                          class="p-button-outlined progress-btn" />
                </span>
              </div>
            </template>
          </Column>
          <Column>
            <template #header="slotProps">
              {{ rootModuleName }} Status
            </template>
            <template #body="slotProps">
              <Button v-if="hasPassingGrade(slotProps.data.id) === false" label="Not Passed" class="p-button-danger p-button-rounded"></Button>
              <Button v-else label="Passed" class="p-button-success p-button-rounded"></Button>
            </template>
          </Column>
<!--          <Column header="">-->
<!--            <template #body="slotProps">-->
<!--              <Button label="Edit" icon="pi pi-pencil" class="p-button-text" />-->
<!--            </template>-->
<!--          </Column>-->
        </DataTable>



  <Dialog v-model:visible="displayModal"
          :modal="true"
          :closeOnEscape="true"
          :dismissableMask="true"
          :style="{width: '500px'}">
    <template #header>
      <h3>{{ studentProgressInModal.title }}</h3>
    </template>

    <DataTable :value="studentProgressInModal.assignments" :autoLayout="true">
      <Column field="name" header="Name" />
      <Column header="Points">
        <template #body="slotProps">
          <InputText v-if="slotProps.data.points > 0"
                     v-model="slotProps.data.points"
                     type="text"
                     placeholder="Points" :style="{width: '100px'}" />
          <InputText v-else
                     v-model="slotProps.data.points"
                     type="text" placeholder="Points" :style="{width: '100px'}" />
        </template>
      </Column>
      <Column header="Max Points">
        <template #body="slotProps">
          {{ slotProps.data.maxPoints }}
        </template>
      </Column>
    </DataTable>

    <template #footer>
      <Button @click="closeModal($event)" label="Cancel" icon="pi pi-times" class="p-button-text"/>
      <Button @click="progressUpdateFromModal($event)" label="Save" icon="pi pi-check" autofocus />
    </template>
  </Dialog>

  <Dialog v-model:visible="showResults"
          :modal="true"
          :closeOnEscape="true"
          :dismissableMask="true"
          :style="{width: '700px'}">
    <template #header>
      <div class="row text-lg font-semibold" style="display: flex;">{{studentHeader}}</div>
    </template>

    <div class="card student-results-dt">
      <TreeTable :value="studentResults">
        <Column field="moduleName" header="Module" :expander="true" />

        <!-- NOTICE: student-results-dt force set header size -->
        <Column field="receivedPoints" header="Received Points" />
        <!-- NOTICE: student-results-dt force set header size -->
        <Column field="maxPoints" header="Max Points" />

        <!-- <Column header="Points">
        <template #body="slotProps">
          {{ slotProps.data.receivedPoints }}/{{ slotProps.data.maxPoints }}
        </template>
      </Column> -->
      </TreeTable>
      </div>

  </Dialog>

  <Dialog v-model:visible="bShowAddModuleDialog"
          :modal="true"
          :closeOnEscape="true"
          :dismissableMask="true"
          :style="{width: '400px'}">
    <template #header>
      <div v-if="this.addNewModuleObj.parentModuleId == null" class="row text-lg font-semibold" style="display: flex;">
        Add Module to {{ courseName }}
      </div>
      <div v-else class="row text-lg font-semibold" style="display: flex;">
        Add sub Module to {{ addNewModuleObj.parentModuleName }}
      </div>
    </template>

    <div class="card">
      <FormField>
        <FormControl v-model="addNewModuleObj.name" placeholder="Module name" :icon="mdiFormTextbox"/>
      </FormField>

      <FormField>
        <FormControl v-model="addNewModuleObj.abbreviation" placeholder="Abbreviation" :icon="mdiFormTextbox"/>
      </FormField>

      <FormField>
        <FormControl v-model="addNewModuleObj.maxPoints" placeholder="Points" :icon="mdiStar"/>
      </FormField>

      <FormField>
        <FormControl v-model="addNewModuleObj.passingPercent" placeholder="Percent required" :icon="mdiPercentCircleOutline"/>
      </FormField>

      <FormField>
        <Calendar v-model="addNewModuleObj.deadline" placeholder="Deadline"
                  class="border-gray-700 rounded w-full border bg-white dark:bg-slate-800" style="--dp-border-color: white; --dp-border-color-hover: white;"></Calendar>
      </FormField>

<!--      <BaseDivider />-->

    </div>

    <template #footer>
      <Button @click="closeModal($event)" label="Cancel" icon="pi pi-times" class="p-button-text"/>
      <Button @click="createNewModuleHere($event)" label="Create" icon="pi pi-check" autofocus />
    </template>
  </Dialog>



      <ContextMenu ref="cm" :model="cMenuItems">
      </ContextMenu>

      <ContextMenu ref="cmProgressHeader" :model="cProgressMenuItems">
      </ContextMenu>

      <ContextMenu ref="cmStudentActions" :model="cStudentActionsMenuItems">
      </ContextMenu>
      <Toast position="bottom-center" group="bottom-simple" />

    </SectionMain>
  </LayoutAuthenticated>


</template>

<script lang="ts">

import {
  mdiCogOutline, mdiEmail, mdiEmailOpen,
  mdiFormTextbox,
  mdiPercentCircleOutline, mdiSortAscending, mdiSortDescending,
  mdiStar, mdiTrashCan, mdiFileDelimited 
} from "@mdi/js";

import { Options, Vue } from "vue-class-component"
import { Ref, ref } from "vue";
import {RouteLocationNormalizedLoaded, Router, useRoute, useRouter} from "vue-router";

import ContextMenu from 'primevue/contextmenu'
import { Student } from '../model/student'
import { useModuleStore, ModuleStore } from '../store/moduleStore'
import { useStudentStore, StudentStore } from '../store/studentsStore'
import { useStudentPointsStore, StudentPointsStore } from '../store/StudentPointsStore'
import { ModuleIdAndPoints } from "../model/ModuleIdAndPoints";

import LayoutAuthenticated from "../template/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "../template/components/SectionTitleLineWithButton.vue";
import SectionMain from "../template/components/SectionMain.vue";
import BaseButtons from "../template/components/BaseButtons.vue";
import BaseButton from "../template/components/BaseButton.vue";
import FormField from "../template/components/FormField.vue";
import FormControl from "../template/components/FormControl.vue";
import BaseDivider from "../template/components/BaseDivider.vue";
import {log} from "util";
import {Module} from "../model/module";
import {StudentPoints} from "../model/StudentPoints";
import {mdiTable} from "@mdi/js";
import { Course } from "../model/course";
import { CourseStore, useCourseStore } from "../store/courseStore";
import { useAuthStore } from "../store/authStore";
import Log from "../Log";
import TagsStore from "../store/TagsStore";
import VueWithDarkMode from "../VueWithDarkMode";
import {HTTP} from "../modules/api";
import { useToast } from "primevue/usetoast";



interface ModuleAndStudentPoints {
  name: string
  points: string
  maxPoints: number
  module: Module
}


interface StudentProgressInModal {
  title?: string
  assignments?: ModuleAndStudentPoints[]
  student?: Student
  rootModule: Module
}

interface NavigationTreeItem {
  title: string
  link?: string
  icon?: string
  isDisabled: boolean
}


@Options({
  components: {
    ContextMenu, LayoutAuthenticated, SectionMain, SectionTitleLineWithButton, BaseButton, BaseButtons,
    FormField, FormControl, BaseDivider
  },
  data() {
    return {
      mdiFormTextbox, mdiStar, mdiPercentCircleOutline, mdiFileDelimited 
    }
  },
  props: {
    courseIdProp: String,
    rootModuleIdProp: String
  }
})
export default class ResultList extends VueWithDarkMode {
  courseIdProp!: string
  rootModuleIdProp!: string

  displayModal: boolean = false
  showResults: boolean = false;
  toast = useToast();

  cMenuItems = [
    {
      label: "Edit",
      icon: 'pi pi-pencil',
      command: () => {
        this.editStudentOne()
      }
    },
    {
      label: "Reset",
      icon: 'pi pi-times',
      command: () => {
        this.progressReset(this.studentProgressInModal.rootModule.id, this.studentProgressInModal.student.id)
      }
    },
  ]

  cProgressMenuItems = []
  cStudentActionsMenuItems = []

  // basically settings for this view
  rootModuleId?: number = null
  courseId: number = 1
  courseName: string = ""

  route: RouteLocationNormalizedLoaded
  router: Router

  progress = []
  rootModuleName: string = ""
  studentProgressInModal: StudentProgressInModal = {}

  students: Student[] = []

  selectedCourseId: number = 0
  courses: Course[] = []

  studentHeader: string = "";
  studentResults: any

  navigationHome: NavigationTreeItem = {}
  navigationTree: NavigationTreeItem[] = []

  tfFilter: string = ""
  selectedFilters = []
  filteredFilters = []

  bShowAddModuleDialog: boolean = false
  addNewModuleObj = {
    name: '',
    abbreviation: '',
    passingPercent: '',
    deadline: undefined,
    maxPoints: '',
    parentModuleId: <number | undefined> null,
    parentModuleName: <string | undefined> null
  }




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

    this.route = useRoute();
    this.router = useRouter();

    Log.d("rootModuleIdProp", this.route.params.rootModuleIdProp)
    Log.d("courseIdProp", this.route.params.courseIdProp)

    this.navigationHome = <NavigationTreeItem>{
      title: "",
      link: "/resultlist/" + this.courseIdProp + "/null",
      icon: 'pi pi-home',
      isDisabled: true // will set true when we r browsing deeper
    }

    if (this.route.params.rootModuleIdProp != undefined && this.route.params.rootModuleIdProp != '0' && this.route.params.rootModuleIdProp != 'null') {
      this.rootModuleId = Number(this.route.params.rootModuleIdProp)
      let rootModule = ModuleStore.getModuleById(this.rootModuleId)
      this.rootModuleName = rootModule.name

      // build navigation tree
      this.navigationHome.isDisabled = false

      this.navigationTree = [<NavigationTreeItem>{
        title: this.rootModuleName,
        isDisabled: true
      }]

      let buildNavigationTree = (moduleId: number) => {
        if (moduleId != null) {
          let module = ModuleStore.getModuleById(moduleId)
          this.navigationTree = [<NavigationTreeItem>{
            title: module.name,
            link: "/resultlist/" + this.courseIdProp + "/" + module.id,
            isDisabled: false
          }, ...this.navigationTree]
          buildNavigationTree(module.parentModuleId)
        }
      }

      buildNavigationTree(rootModule.parentModuleId)
    } else {
      this.rootModuleId = null
      this.rootModuleName = ""
      this.navigationTree = []
    }

    this.courseId = Number(this.route.params.courseIdProp)

    await this.loadModules()
    await StudentStore.loadByCourse(this.courseId)

    await CourseStore.load()
    this.courses = CourseStore.getCourses()
    this.selectedCourseId = this.courseId
    this.courseName = this.courses.find(it => it.id == this.courseId).name

    await this.loadStudentPoints()

    this.students = StudentStore.getStudentsByCourseId(this.courseId)
    // console.log("students", this.students)

    await this.loadProgress()

    // for (let item of this.progress) {
    //   console.log('max points', item.name, ModuleStore.getModuleMaxPoints(item.id))
    // }

    await TagsStore.loadByCourse(this.courseId)
  }

  async loadModules()
  : Promise<void> {
    await ModuleStore.loadByCourse(this.courseId)
  }


  async loadStudentPoints()
    : Promise<void> {
    await useStudentPointsStore().loadCoursePoints(this.courseId);
  }


  async getStudentResults(slotProps: any)
  : Promise<void> {
    this.studentResults = await StudentPointsStore.getStudentResults(this.courseId, slotProps.data.id)

    let student = slotProps.data;
    this.studentHeader = student.firstName + " " + student.lastName + " " + student.studentCode;
    this.showResults = true;
  }

  async editStudentOne()
  : Promise<void> {
    Log.d("Begin")
    this.displayModal = true
  }

  async progressRightClick(event: any, studentId: number, moduleId: number)
  : Promise<void> {
    Log.d("event", event, "studentId", studentId, "moduleId", moduleId)

    let student = this.students.filter((it) => it.id === studentId)[0];
    let module = ModuleStore.getModuleById(moduleId)

    let getStudentPointsByModule = (it: Module) => {
      let studentPoints = StudentPointsStore.getPointsByStudentId(studentId).filter((x) => x.moduleId == it.id)[0]
      return studentPoints == undefined ? 0 : studentPoints.points
    }

    this.studentProgressInModal = {
      title: student.firstName + " " + student.lastName + " / " + module.name,
      assignments: ModuleStore.recursiveFindChildren(module)
          .filter((it) => it.children == null || it.children.length <= 0)
          .map((it) => <ModuleAndStudentPoints> {
            name: it.name,
            points: getStudentPointsByModule(it) + "",
            maxPoints: it.maxPoints,
            module: it
          }),
      student: student,
      rootModule: module
    }

    this.$refs.cm.show(event)
  }

  rowRightClick(event: any, studentId: any , courseId: number = this.courseId) {
    Log.d("RightClick! " + courseId  + "  " + studentId.id)
    this.cStudentActionsMenuItems = [
      {
        label: "Send Invite email",
        icon: 'pi pi-envelope',
        command: () => {
          this.sendInviteEmail(studentId.id, courseId);
        }
      },
    ]

    this.$refs.cmStudentActions.show(event)
  }


  sendInviteEmail(studentId, courseId ) {
        const doSendEmailRequest = async () => {
          let res: Ref<[]> = ref()
          await (new HTTP({ useBearer: true })).tryGet("/students/"+studentId+"/sendInvite/"+courseId, res)

          if (doSendEmailRequest.response) {
            return doSendEmailRequest.response!;
          }

          return [];
        };

        doSendEmailRequest();


    doSendEmailRequest();
    this.toast.add({
      severity: 'success',
      summary: 'Success',
      detail: "email sent!",
      life: 3000,
      group: 'bottom-simple'
    });


  }
      
  
  progressHeaderRightClick(event: any, moduleId: number = null) {
    Log.d("Begin")

    this.cProgressMenuItems = [
      {
        label: "Add module to " + (this.rootModuleId != null ? this.rootModuleName : this.courseName),
        icon: 'pi pi-plus',
        command: () => {
          this.bShowAddModuleDialog = true
        }
      },
    ]

    if (moduleId != null) {
      let module = ModuleStore.getModuleById(moduleId)

      this.cProgressMenuItems = [
        {
          label: "Add sub module to " + module.name,
          icon: 'pi pi-plus',
          command: () => {
            this.bShowAddModuleDialog = true
          }
        }
      ]

      this.addNewModuleObj.parentModuleId = moduleId
      this.addNewModuleObj.parentModuleName = module.name
    }
    else {
      // set parent module to currentently visiting one
      this.addNewModuleObj.parentModuleId = this.rootModuleId

      this.addNewModuleObj.parentModuleName = this.rootModuleName
    }

    this.$refs.cmProgressHeader.show(event)
  }

  /**
   * give max points too all modules(assignments) at end of tree in module by id
   * @param studentId
   * @param moduleId
   */
  async progressFill(studentId: number, moduleId: number)
  : Promise<void> {
    Log.d("studentId", studentId, "moduleId", moduleId)

    let module = ModuleStore.getModuleById(moduleId)
    let modules = ModuleStore.recursiveFindChildren(module)

    // those modules dat dont have children r dealt as assignments
    let modulesToFill = modules
        .filter((it) => it.children == null || it.children.length <= 0)
        .map((it) => <StudentPoints> {
          studentId: studentId,
          moduleId: it.id,
          points: it.maxPoints
        })

    await StudentPointsStore.updateStudentPoints(modulesToFill)

    // force to update data in list/DataTable
    await this.loadProgress()
  }

  async progressReset(studentId: number, moduleId: number)
  : Promise<void> {
    Log.d("Begin")

    let module = ModuleStore.getModuleById(moduleId)
    let modules = ModuleStore.recursiveFindChildren(module)

    // those modules dat dont have children r dealt as assignments
    let modulesToFill = modules
        .filter((it) => it.children == null || it.children.length <= 0)
        .map((it) => <StudentPoints> {
          studentId: studentId,
          moduleId: it.id,
          points: 0
        })

    await StudentPointsStore.updateStudentPoints(modulesToFill)

    // force to update data in list/DataTable
    await this.loadProgress()
  }

  async progressUpdateFromModal(event: any)
  : Promise<void> {

    let modulesToFill = this.studentProgressInModal.assignments
        .map((it) => <StudentPoints> {
          studentId: this.studentProgressInModal.student.id,
          moduleId: it.module.id,
          points: Number(it.points) // user input has to change to number
        })

    Log.d("modulesToFill", modulesToFill)

    await StudentPointsStore.updateStudentPoints(modulesToFill)

    // force to update data in list/DataTable
    await this.loadProgress()

    this.closeModal(event)
  }

  hasFullyDone(studentId: number, moduleId: number)
  : boolean {
    return this.getStudentGotPointsInGroup(studentId, moduleId) >= ModuleStore.getModuleMaxPoints(moduleId)
  }

  hasPartiallyDone(studentId: number, moduleId: number)
  : boolean {
    return this.getStudentGotPointsInGroup(studentId, moduleId) > 0
  }

  hasPassingGrade(studentId: number)
  : boolean {

    for (let module of this.progress) {
      if (module.passingPercent != undefined) {
        if (this.getStudentGotPointsInGroup(studentId, module.id) < ModuleStore.getModuleMaxPoints(module.id) * (module.passingPercent / 100)) {
          return false
        }
      }
      else if (module.parentModuleId != undefined) {
        // using first module assuming we rnt mixing different root levels in view

        let gotPoints = this.getStudentGotPointsInGroup(studentId, module.parentModuleId)
        let maxPoints = ModuleStore.getModuleMaxPoints(module.parentModuleId)
        let passingPercent = ModuleStore.getModuleById(module.parentModuleId).passingPercent

        if (gotPoints < maxPoints * (passingPercent / 100)) {
          return false
        }
      }
    }

    return true
  }

  getStudentGotPointsInGroup(studentId: number, moduleId: number)
  : number {
    let module = ModuleStore.getModuleById(moduleId)
    if (module == null) {
      return
    }

    let moduleIds: number[] = ModuleStore.recursiveFindChildren(module).map(it => it.id)

    return StudentPointsStore.getPointsByStudentId(studentId).filter((x) => moduleIds.includes(x.moduleId))
        .map((it) => it.points).reduce((partialSum, a) => partialSum + a, 0)
  }

  async loadProgress()
  : Promise<void> {
    // ModuleStore.loadByCourse used already, buuut to be in safe side bc modules can be all loaded
    this.progress = ModuleStore.getRootModulesByCourseId(this.courseId, this.rootModuleId)
    Log.d("progress", this.progress)
  }

  closeModal(event: any)
  : void {
    this.displayModal = false
    this.showResults = false;
    this.studentHeader = "";
    this.$refs.cm.hide()

    this.bShowAddModuleDialog = false
    this.$refs.cmProgressHeader.hide()
  }

  courseChanged() {
    Log.d("selectedCourseId", this.selectedCourseId, "courseId", this.courseId)
    if (Number(this.selectedCourseId) != 0 && Number(this.selectedCourseId) != this.courseId) {
      this.$router.push({ name: 'resultlist', params: { courseIdProp: this.selectedCourseId, rootModuleIdProp: 'null' }})
    }
  }

  async downloadCSV() {
    if (Number(this.courseId) != 0 ) {
      StudentPointsStore.downloadCSV(this.courseId, this.co);
    }
  }

  showAllFilters() {
    Log.d("Begin")

    this.filteredFilters = TagsStore.unTrashedTags.map(it => <any> {
      id: it.id,
      name: it.name,
      color: it.color,
      type: "TAG"
    })

    // NOTICE: i don't kno other way to make multi autocomplete show all its suggestions on mouse click
    document.querySelector("#multiple-filters > button").click()
  }

  updateFilters(event) {
    Log.d("Begin")

    this.tfFilter = event.query.trim()
    // Log.d("tfFilter", this.tfFilter)

    if (event == null || this.tfFilter.length <= 0) {
      this.filteredFilters = TagsStore.unTrashedTags
        .filter(it => this.selectedFilters.map(x => x.id).includes(it.id) == false)
        .map(it => <any> {
        id: it.id,
        name: it.name,
        color: it.color,
        type: "TAG"
      })
    }
    else {
      this.filteredFilters = TagsStore.unTrashedTags.filter(it => it.name.toUpperCase().includes(this.tfFilter.toUpperCase()))
        .filter(it => this.selectedFilters.map(x => x.id).includes(it.id) == false)
        .map(it => <any> {
          id: it.id,
          name: it.name,
          color: it.color,
          type: "TAG"
        })
    }

    // default chip color
    // "#3f3f46"
  }

  async filtersChanged(event)
  : Promise<void> {
    Log.d("Begin")
    Log.d("selectedFilters", this.selectedFilters)

    if (this.selectedFilters.length > 0) {
      let selectedTagIds = this.selectedFilters.map(it => it.id)

      let studentsAndTags = await TagsStore.getStudentsTagsByCourse(this.courseId)
      this.students = StudentStore.getStudentsByCourseId(this.courseId).filter(it =>
        (studentsAndTags.find(x => x.studentId == it.id)?.tags ?? []).filter(x => selectedTagIds.includes(x)).length >= selectedTagIds.length)
    }
    else {
      this.students = StudentStore.getStudentsByCourseId(this.courseId)
    }
  }

  async createNewModuleHere(event: any)
  : Promise<void> {
    Log.d("Begin")

    let { addModule } = useModuleStore()

    await addModule(<Module> {
      id: 0,
      name: this.addNewModuleObj.name,
      abbreviation: this.addNewModuleObj.abbreviation,
      courseId: Number(this.courseIdProp),
      parentModuleId: this.addNewModuleObj.parentModuleId,
      maxPoints: Number(this.addNewModuleObj.maxPoints),
      deadline: this.addNewModuleObj.deadline,
      passingPercent: Number(this.addNewModuleObj.passingPercent),
    })

    await this.loadModules()
    await this.loadProgress()
    await this.loadStudentPoints()

    this.closeModal(event)

    // clear fields
    this.addNewModuleObj.name = ''
    this.addNewModuleObj.abbreviation = ''
    this.addNewModuleObj.maxPoints = ''
  }

  goTo(link: string) {
    this.$router.push(link);
  }

  goBack() {
    Log.d("Begin");

    let lastPath = this.$router.options.history.state.back
    Log.d("lastPath", lastPath);

    let module = ModuleStore.getModuleById(this.rootModuleId)

    if (lastPath != null && lastPath.startsWith("/resultlist/" + this.selectedCourseId + "/" + module.parentModuleId + "")) {
      Log.d("using go(-1)")
      this.$router.go(-1)
    } else {
      Log.d("using push to go courseView", )
      this.$router.push({ name: 'resultlist', params: { courseIdProp: this.selectedCourseId, rootModuleIdProp: module.parentModuleId + "" }});
    }
  }
}

</script>

<!-- ============ style area ============ -->
<style>


.modules-row {
  display: flex;
  width: 100%;
}

.module-item {
  display: flex;
  flex: 1;

  align-items: center;
  justify-content: center;

  /*border: 1px solid red;*/
}

.p-breadcrumb-button {
  margin-bottom: unset !important;
  padding: 0 !important;
  margin: 0 !important;
}


.student-results-dt thead th:nth-child(2),
.student-results-dt tbody td:nth-child(2),
.student-results-dt tfoot td:nth-child(2) {
  width: 100px;
}

.student-results-dt thead th:nth-child(3),
.student-results-dt tbody td:nth-child(3),
.student-results-dt tfoot td:nth-child(3) {
  width: 100px;
}

.dig-deeper-link {
  text-decoration: underline;
}

#multiple-filters > button {
  display: none;
}

</style>


