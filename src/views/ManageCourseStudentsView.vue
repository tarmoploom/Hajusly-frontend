<template>
  <LayoutAuthenticated>
    <SectionMain>

      <SectionTitleLineWithButton
        v-model:title=thisTitle
        mainthisTitle
      >
        <Button type="button"
                class="p-button-rounded p-button-default btn-white-text"
                icon="pi pi-undo"
                style="margin-right: .5em"
                @Click="goBack"
        />
      </SectionTitleLineWithButton>

      <table class="table-filter student-dt">
        <tr>
          <th colspan="6">
            Filter
            <Button type="button"
                    class="p-button p-component p-button-icon-only p-button-rounded p-button-text"
                    id="filter-toggle-button"
                    icon="pi pi-angle-up"
                    style="top: 1.5em; left: 4px"
                    @Click="toggleFilterVisibility()"
            />
          </th>
        </tr>
        <tr id="filter-row">
          <td>
            <FormField label="Code to filter">
              <FormControl v-model="tfFilterByCode" name="code" @input="filterChanged()"/>
            </FormField>
          </td>
          <td>
            <FormField label="First name to filter">
              <FormControl v-model="tfFilterByFirstName" name="firstName" @input="filterChanged()"/>
            </FormField>
          </td>
          <td>
            <FormField label="Last name to filter">
              <FormControl v-model="tfFilterByLastName" name="lastName" @input="filterChanged()"/>
            </FormField>
          </td>
        </tr>
      </table>
      <br/>
      <br/>

      <div class="field-checkbox">
        <Checkbox inputId="binaryD" v-model="bShowOnlyActiveStudents" :binary="true" @change="filterChanged()" />
        <label for="binaryD">Show only students that are taking part of this course</label>
      </div>

      <br/>
      <br/>

      <div style="display: flex; justify-content: end;">
        <Button :label="toggleBulkActionLabel" @click="toggleBulkAction()" />
        <Button v-if="bToggleBulkAction === true" label="Edit Tags" @click="bulkActionEditStudentsTags()"/>
        <Button v-if="bToggleBulkAction === true" label="Send Invite" @click="bulkActionSendInvite()"/>

      </div>

      <div class="card student-dt">
        <DataTable v-model:value="students" @rowContextmenu="rowRightClick" :autoLayout="true" >
          <Column header="">
            <template #body="slotProps">
              <Checkbox :binary="true" v-model="slotProps.data.takingPartOfCourse" @change="takingPartStateChanged(slotProps.data.id)" />
            </template>
          </Column>

          <Column header="Code">
            <template #body="slotProps">
              <div> {{ slotProps.data.studentCode }} </div>
            </template>
          </Column>
          <Column header="First name">
            <template #body="slotProps">
              <div> {{ slotProps.data.firstName }} </div>
            </template>
          </Column>
          <Column header="Last name">
            <template #body="slotProps">
              <div> {{ slotProps.data.lastName }} </div>
            </template>
          </Column>
          <Column header="Tags">
            <template #body="slotProps">
              <div>
                <Button v-for="tagId in slotProps.data.tags"
                        :class="{'p-button-rounded': true, 'p-button-outlined': true, 'p-tag-button': true, 'p-global-tag': getTagById(tagId).partOfCourseId == null}"
                        :aria-label="getTagById(tagId).name"
                        :style="{'color': getTagById(tagId).color}">
                  <span class="px-3">{{ getTagById(tagId).name }}</span>
                </Button>
              </div>
            </template>
          </Column>

          <Column header="Bulk Action" v-if="bToggleBulkAction === true" >
            <template #body="slotProps">
              <Checkbox :binary="true" v-model="slotProps.data.bulkAction" />
            </template>
          </Column>
        </DataTable>
      </div>

      <ContextMenu ref="cm" :model="cMenuItems">
      </ContextMenu>


      <Dialog v-model:visible="bShowTagsDialog"
              :modal="true"
              :closeOnEscape="true"
              :dismissableMask="true"
              class="tags-dialog">
        <template #header>
          <div class="row text-lg font-semibold" style="display: flex;">{{ tagsDialog.header }}</div>
        </template>

        <table>
          <tr>

<!-- tag selecting side -->
            <td class="tags-dialog-main-content">
              <Splitter class="card tag-card">
                <SplitterPanel :size="tagsDialog.leftPanelSize">
                  <div class="tags-buttons">
                    <small>add tags to left panel by click them on right side</small>
                    <Divider class="tags-dialog-divider" />
                    <span class="p-input-icon-left tags-search-bar">
                      <i class="pi pi-search" />
                      <InputText type="text" v-model="tagsDialog.leftSearch" placeholder="Search" />
                    </span>
                    <Divider class="tags-dialog-divider" />
<!--                    tags that every user has-->
                    <span v-for="tag in tagsDialog.userTags">
                      <Button v-if="tag.name.toUpperCase().includes(tagsDialog.leftSearch.toUpperCase())"
                              :class="{'p-button-rounded': true, 'p-button-outlined': true, 'p-tag-button': true, 'p-global-tag': tag.partOfCourseId == null}"
                              :aria-label="tag.name"
                              @click="removeTagFromStudent(tag.id)"
                              :style="{'color': tag.color}">
                        <span class="px-3">{{ tag.name }}</span>
                        <i class="pi pi-times" style="color: #DC3535"></i>
                      </Button>
                    </span>
<!--                    tags that only some users have-->
                    <span v-for="tag in tagsDialog.someUserTags">
                      <Button v-if="tag.name.toUpperCase().includes(tagsDialog.leftSearch.toUpperCase())"
                              :class="{'p-button-rounded': true, 'p-button-outlined': true, 'p-tag-button': true, 'p-global-tag': tag.partOfCourseId == null}"
                              :aria-label="tag.name"
                              @click="removeTagFromStudent(tag.id)"
                              :style="{'color': tag.color, 'opacity': '0.5'}">
                        <span class="px-3">{{ tag.name }}</span>
                        <i class="pi pi-times" style="color: #DC3535"></i>
                      </Button>
                    </span>
                  </div>
                </SplitterPanel>
                <SplitterPanel :size="tagsDialog.rightPanelSize">
                  <table class="tags-search-bar">
                    <tr>
                      <td style="width: 100%">
                        <span class="p-input-icon-left" style="width: 100%">
                          <i class="pi pi-search" />
                          <InputText type="text" v-model="tagsDialog.rightSearch" placeholder="Search" @input="dialogTagsFilterChanged()"  />
                        </span>
                      </td>
                      <td v-if="bShowTagsDialogCreateNew === false">
                        <Button label="Create New" class="p-button-rounded p-tag-search-button" @click="showCreateNewTag()" />
                      </td>
                    </tr>
                  </table>

                  <div class="tags-buttons">
                    <span v-for="tag in dialogFilteredTags">
                      <Button :class="{'p-button-rounded': true, 'p-button-outlined': true, 'p-tag-button': true, 'p-global-tag': tag.partOfCourseId == null}"
                              :aria-label="tag.name"
                              @click="addTagToStudent(tag.id)"
                              :style="{'color': tag.color}">
                        <span class="px-3">{{ tag.name }}</span>
                        <i class="pi pi-plus" style="color: #5F8D4E"></i>
                      </Button>
                    </span>
                  </div>
                </SplitterPanel>
              </Splitter>
            </td>

<!-- tag creation side -->
            <td v-if="bShowTagsDialogCreateNew === true">
              <div class="card create-new-tag">
                <Button icon="pi pi-times" class="p-button p-button-icon-only p-button-rounded p-button-text" @click="hideCreateNewTag()" />
                <h5>Tag Name</h5>
                <div>
                  <InputText type="text" v-model="dialogTagName"
                             placeholder="Tag Name"
                             :class="{ 'p-invalid': tagsDialog.errors.tagName != null}"
                             ria-describedby="tag-name-help" />
                </div>
                <div>
                <small v-if="tagsDialog.errors.tagName" id="tag-name-help"
                         class="p-error">{{ tagsDialog.errors.tagName }}</small>
                </div>
                <br/>
                <h5>Tag Color</h5>
                <div><ColorPicker v-model="dialogTagColor" :inline="false" /></div>
                <br/>
                <div><Button label="Create" class="p-dialog-submit-button" @click="createNewTag()"/></div>
              </div>
            </td>
          </tr>
        </table>

      </Dialog>

      <Toast position="bottom-center" group="bottom-simple" />

    </SectionMain>
  </LayoutAuthenticated>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

import LayoutAuthenticated from "../template/layouts/LayoutAuthenticated.vue";
import SectionMain from "../template/components/SectionMain.vue";
import FormField from "../template/components/FormField.vue";
import FormControl from "../template/components/FormControl.vue";

import TableEditStudents from "../components/TableEditStudents.vue";
import { useRoute } from "vue-router";
import { StudentStore } from "../store/studentsStore";
import { CourseStore } from "../store/courseStore";
import Log from "../Log";
import TagsStore from "../store/TagsStore";
import { DataTableRowContextMenuEvent } from "primevue/datatable";
import { Tag } from "../model/Tag";
import { StudentAndTags } from "../model/StudentAndTags";
import { useToast } from "primevue/usetoast";

import VueWithDarkMode from "../VueWithDarkMode";
import {Student} from "../model/student";
import useApi, {HTTP} from "../modules/api";
import {ref, Ref} from "vue";


interface StudentWTakingPartOfCourse {
  id?: number
  firstName: string
  lastName: string
  email: string
  studentCode: string
  inCourse?: number[]
  tags?: number[]
  takingPartOfCourse: boolean
  bulkAction: boolean
}

@Options({
  components: {
    LayoutAuthenticated, SectionMain, TableEditStudents,
    FormField, FormControl
  },
  props: {
    courseId: String,
    parentId: String
  }
})
export default class ManageCourseStudentsView extends VueWithDarkMode {

  // NOTICE: default values r just for testing by hand
  courseIdProp: number = 1
  parentIdProp?: number = undefined

  courseName: string = "loading ..."
  thisTitle: string = ""

  studentsOrig: StudentWTakingPartOfCourse[] = []
  students: StudentWTakingPartOfCourse[] = []
  studentsAndTags: StudentAndTags[]

  bFilterVisible: boolean = false
  bShowOnlyActiveStudents: boolean = true

  tfFilterByCode: string = ""
  tfFilterByFirstName: string = ""
  tfFilterByLastName: string = ""

  cMenuItems = []
  bShowTagsDialog: boolean = false
  bShowTagsDialogCreateNew: boolean = false
  tagsDialog = {
    header: "students blabla tags",
    leftPanelSize: 40,
    rightPanelSize: 60,
    leftSearch: "",
    rightSearch: "",
    studentIds: [1],
    userTags: [],
    someUserTags: [],
    errors: {}
  }
  dialogFilteredTags: Tag[] = []
  dialogTagName: string = ""
  dialogTagColor: string = "4169e1"

  toggleBulkActionLabel = "Show Bulk Action"
  bToggleBulkAction = false

  toast = useToast()


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

    let route = useRoute();
    Log.d("courseIdProp", route.params.courseId)
    Log.d("parentIdProp", route.params.parentId)


    this.courseIdProp = Number(route.params.courseId)


    const currentUrl = window.location.href;
    if (currentUrl.includes('editStudents')) {
      const val = localStorage.getItem('lastVisitedCourse')
      this.courseIdProp = Number(val);

    }


    if (await CourseStore.loadWithAxios()) {
      this.courseName = CourseStore.getCourses().find(it => it.id == this.courseIdProp).name
    }
    else {
      this.courseName = "! failed to load !"
    }

    this.parentIdProp = this.isInteger(route.params.parentId)
      ? Number(route.params.courseId) : undefined

    this.thisTitle = "Manage " + this.courseName + " Students"

    await this.loadStudentsOrig(true)
    Log.d("students", this.studentsOrig)

    await TagsStore.loadByCourse(this.courseIdProp)
    Log.d("tags", TagsStore.tags)

    // invoke function to copy data to this.students var
    this.filterChanged()

    this.dialogTagsFilterChanged()
  }

  async loadStudentsOrig(loadAllFromApi: boolean = true) {
    if (loadAllFromApi == true) {
      await StudentStore.loadAll()
    }

    this.studentsAndTags = await TagsStore.getStudentsTagsByCourse(this.courseIdProp)

    this.studentsOrig = StudentStore.students.map(it => <StudentWTakingPartOfCourse> {
      id: it.id,
      firstName: it.firstName,
      lastName: it.lastName,
      email: it.email,
      studentCode: it.studentCode,
      inCourse: it.inCourse,
      tags: this.studentsAndTags.find(x => x.studentId == it.id)?.tags ?? [],
      takingPartOfCourse: it.inCourse == undefined ? false : it.inCourse.includes(this.courseIdProp)
    })
  }


  isStudentPartOfCourse(studentId: number)
  : boolean {
    return false
  }

  async takingPartStateChanged(studentId: number)
  : Promise<void> {
    Log.d("Begin")
    Log.d("studentId", studentId)
    Log.d("courseIdProp", this.courseIdProp)

    let studentObj = this.studentsOrig.filter(it => it.id == studentId)[0]
    Log.d("studentObj", studentObj)

    // add student to course
    if (studentObj.takingPartOfCourse == true) {
      Log.d("addStudentToCourse", this.courseIdProp, studentId)
      await CourseStore.addStudentToCourse(this.courseIdProp, studentId)
    }
    // remove student from course
    else {
      Log.d("RemoveStudentFromCourse", this.courseIdProp, studentId)
      await CourseStore.RemoveStudentFromCourse(this.courseIdProp, studentId)
    }

    // update changed students in view
    await this.loadStudentsOrig(true)
    this.filterChanged()
  }

  sendEmail(st: Student) {

    const doSendEmailRequest = async () => {
      let res: Ref<[]> = ref()
      await (new HTTP({ useBearer: true })).tryGet("/students/"+st.id+"/sendInvite/"+this.courseIdProp, res)

      if (doSendEmailRequest.response) {
        return doSendEmailRequest.response!;
      }

      return [];
    };

  doSendEmailRequest();
    this.toast.add({
      severity: 'success',
      summary: 'Success',
      detail: "email sent!",
      life: 3000,
      group: 'bottom-simple'
    });
    

  }
  
  
  toggleFilterVisibility() {
    this.bFilterVisible = !this.bFilterVisible

    if (this.bFilterVisible == true) {
      document.querySelector("#filter-row").style.display = "none"
      document.querySelector("#filter-toggle-button .p-button-icon").classList.remove("pi-angle-up")
      document.querySelector("#filter-toggle-button .p-button-icon").classList.add("pi-angle-down")
    }
    else {
      document.querySelector("#filter-row").style.display = "table-row"
      document.querySelector("#filter-toggle-button .p-button-icon").classList.remove("pi-angle-down")
      document.querySelector("#filter-toggle-button .p-button-icon").classList.add("pi-angle-up")
    }
  }

  filterChanged() {
    this.students = this.studentsOrig.sort((a, b) => {
      if (a.takingPartOfCourse == true && b.takingPartOfCourse == false) return -1
      if (a.takingPartOfCourse == false && b.takingPartOfCourse == true) return 1
      // if (a.lastName < b.lastName) return -1
      // if (a.lastName > b.lastName) return 1
      return 0
    })

    if (this.tfFilterByCode.length > 0) {
      this.students = this.students.filter(it => it.studentCode.toUpperCase().includes(this.tfFilterByCode.toUpperCase()))
    }

    if (this.tfFilterByFirstName.length > 0) {
      this.students = this.students.filter(it => it.firstName.toUpperCase().includes(this.tfFilterByFirstName.toUpperCase()))
    }

    if (this.tfFilterByLastName.length > 0) {
      this.students = this.students.filter(it => it.lastName.toUpperCase().includes(this.tfFilterByLastName.toUpperCase()))
    }

    if (this.bShowOnlyActiveStudents == true) {
      this.students = this.students.filter(it => it.inCourse.includes(this.courseIdProp))
    }
  }

  /**
   *  have to call it after function dialogUserTagsChanged bc it depends on this.tagsDialog being filled
   */
  dialogTagsFilterChanged() {
    let allUserTags = [this.tagsDialog.userTags.map(it => it.id), this.tagsDialog.someUserTags.map(it => it.id)]
    let flat = allUserTags.reduce((accumulator, value) => accumulator.concat(value), [])
    let tags = TagsStore.unTrashedTags.filter(it => flat.includes(it.id) == false)
    this.dialogFilteredTags = tags.filter(it => it.name.toUpperCase().includes(this.tagsDialog.rightSearch.trim().toUpperCase()))
  }

  dialogUserTagsChanged(students: StudentWTakingPartOfCourse[]) {
    let data = students.map(it => it.tags) // [[1, 2], [1, 3], [2]]

    // tags dat all users have
    let intersection = data.reduce((a, b) => a.filter(c => b.includes(c)))

    let flat = data.reduce((accumulator, value) => accumulator.concat(value), [])

    // tags dat some user have and others dont
    let someTags = [[...new Set(flat)], intersection].reduce((a, b) => a.filter(c => b.includes(c) == false))

    this.tagsDialog.userTags = TagsStore.unTrashedTags.filter(it => intersection.includes(it.id))
    this.tagsDialog.someUserTags = TagsStore.unTrashedTags.filter(it => someTags.includes(it.id))
  }

  rowRightClick(event: DataTableRowContextMenuEvent) {
    Log.d("Begin")
    Log.d(event)

    let student: StudentWTakingPartOfCourse = (event.data as StudentWTakingPartOfCourse)

    this.cMenuItems = [
      {
        label: "Edit "+ student.studentCode +" tags",
        icon: 'pi pi-tag',
        command: () => {
          this.bShowTagsDialog = true
        }
      },
      {
        label: "Clear "+ student.studentCode +" tags",
        icon: 'pi pi-circle',
        command: () => {

        }
      },
      {
        label: "Send email invite ",
        icon: 'pi pi-envelope',
        command: () => {
          this.sendEmail(student);
        }
      },
    ]

    // just reset modal one of the settings
    this.bShowTagsDialogCreateNew = false

    this.tagsDialog.studentIds = [student.id]
    this.dialogUserTagsChanged([student])

    // have to call it later bc it depends on this.tagsDialog being filled by function dialogUserTagsChanged
    this.dialogTagsFilterChanged()

    this.$refs.cm.show(event.originalEvent)
  }

  bulkActionSendInvite() {
    Log.d("Begin")
    var cid = this.courseIdProp
    let studentToEdit = this.students.filter(it => it.bulkAction == true)
    if (studentToEdit.length > 0) {
      studentToEdit.forEach(function(st) {
        const doSendEmailRequest = async () => {
          let res: Ref<[]> = ref()
          await (new HTTP({ useBearer: true })).tryGet("/students/"+st.id+"/sendInvite/"+cid, res)

          if (doSendEmailRequest.response) {
            return doSendEmailRequest.response!;
          }

          return [];
        };

        doSendEmailRequest();
        
      });
    }
  }


  bulkActionEditStudentsTags() {
    Log.d("Begin")

    let studentToEdit = this.students.filter(it => it.bulkAction == true)
    if (studentToEdit.length > 0) {
      this.tagsDialog.studentIds = studentToEdit.map(it => it.id)
      this.dialogUserTagsChanged(studentToEdit)

      // have to call it later bc it depends on this.tagsDialog being filled by function dialogUserTagsChanged
      this.dialogTagsFilterChanged()

      this.bShowTagsDialog = true
    }
  }

  async addTagToStudent(tagId: number) {
    Log.d("tagId", tagId, " to students", this.tagsDialog.studentIds)

    for (let studentId of this.tagsDialog.studentIds) {
      await StudentStore.addTag(tagId, studentId, this.courseIdProp)
    }

    await this.loadStudentsOrig(false)

    // update tags dialog view
    this.dialogUserTagsChanged(this.studentsOrig.filter(it => this.tagsDialog.studentIds.includes(it.id)))

    // have to call it later bc it depends on this.tagsDialog being filled by function dialogUserTagsChanged
    // update tags dialog view search results
    this.dialogTagsFilterChanged()

    // main view students list tag has changed and so does filter,
    // also dis refreshing view too
    this.filterChanged()
  }

  async removeTagFromStudent(tagId: number) {
    Log.d("tagId", tagId, " from students ", this.tagsDialog.studentIds)

    for (let studentId of this.tagsDialog.studentIds) {
      // only remove if student has this tag, to reduce server requests amount
      if (this.studentsOrig.find(it => it.id == studentId).tags.includes(tagId)) {
        await StudentStore.removeTag(tagId, studentId, this.courseIdProp)
      }
      // else this student doesnt have it, maybe other have from 'this.tagsDialog.studentIds'
    }

    await this.loadStudentsOrig(false)

    // update tags dialog view
    this.dialogUserTagsChanged(this.studentsOrig.filter(it => this.tagsDialog.studentIds.includes(it.id)))

    // have to call it later bc it depends on this.tagsDialog being filled by function dialogUserTagsChanged
    // update tags dialog view search results
    this.dialogTagsFilterChanged()

    // main view students list tag has changed and so does filter,
    // also dis refreshing view too
    this.filterChanged()
  }

  getTagById(tagId: number)
  : Tag {
    return TagsStore.unTrashedTags.find(it => it.id == tagId)
  }

  showCreateNewTag() {
    this.bShowTagsDialogCreateNew = true
  }

  hideCreateNewTag() {
    this.bShowTagsDialogCreateNew = false
  }

  async createNewTag() {
    Log.d("Begin")

    let errors = {}
    let gotErrors = false

    if (this.dialogTagName == null || this.dialogTagName.length <= 0) {
      Log.d("missing tag name")
      gotErrors = true
      errors['tagName'] = "missing tag name"
    }

    if (gotErrors == false) {
      let postColorName = ""
      if (this.dialogTagColor.startsWith("#")) { postColorName = this.dialogTagColor }
      else { postColorName = "#"+this.dialogTagColor }
      await TagsStore.addNew({ name: this.dialogTagName, color: postColorName, courseId: this.courseIdProp })

      // load new tags from
      await TagsStore.loadByCourse(this.courseIdProp)

      // update in tags dialog view
      this.dialogUserTagsChanged(this.studentsOrig.filter(it => this.tagsDialog.studentIds.includes(it.id)))

      // have to call it later bc it depends on this.tagsDialog being filled by function dialogUserTagsChanged
      this.dialogTagsFilterChanged()

      // also dis refreshing view too
      this.filterChanged()

      this.toast.add({
        severity: 'success',
        summary: 'Success',
        detail: "tag '" + this.dialogTagName + "' created",
        life: 3000,
        group: 'bottom-simple'
      });

      // empty dat InputField
      this.dialogTagName = ""

    }

    this.tagsDialog.errors = errors
  }

  toggleBulkAction() {
    this.bToggleBulkAction = !this.bToggleBulkAction

    if (this.bToggleBulkAction == true) {
      this.toggleBulkActionLabel = "Hide Bulk Action"
    }
    else {
      this.toggleBulkActionLabel = "Show Bulk Action"
    }
  }

  goBack() {
    Log.d("Begin");

    let lastPath = this.$router.options.history.state.back
    Log.d("lastPath", lastPath);

    if (lastPath != null && lastPath.startsWith("/course/")) {
      Log.d("using go(-1)")
      this.$router.go(-1)
    } else {
      Log.d("using push to go courseView")
      this.$router.push({ name: 'courseView', params: {id: this.courseIdProp}});
    }
  }

  log(event: any) {
    Log.d(event)
  }

  // TODO: can be moved to some static class
  isInteger(value)
  : boolean {
    return /^\d+$/.test(value);
  }

}

</script>

<style>

.table-filter th {
  text-align: center;
}

.filter-text-field {
  width: 100%;
}

.field-checkbox > label, .field-radiobutton > label {
  margin-left: .5rem;
  line-height: 1;
  color: #555;
}

.tags-dialog-main-content {
  width: 700px;
  /*display: inline-block;*/
}

.tag-card {
  min-height: 300px;
  max-height: 500px;
}

.tags-search-bar {
  width: 100%;
  padding: 2px;
}

.tags-search-bar td {
  vertical-align: middle;
}

.tags-search-bar input {
  padding-top: 4px;
  padding-bottom: 4px;
  width: 100%;
}

.tags-search-bar button {
  margin: 0;
}


.p-tag-button {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  white-space: nowrap;
}

.p-tag-search-button {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.p-tag-search-button span {
  white-space: nowrap;
}

.tags-buttons {
  position: relative;
  padding: 8px;
}

.create-new-tag h5 {
  margin-bottom: 8px;
  font-weight: bold;
}

.p-dialog-submit-button {
  width: 100%;
}

/* tags column */
.student-dt thead th:nth-child(5),
.student-dt tbody td:nth-child(5),
.student-dt tfoot td:nth-child(5) {
  max-width: 200px;
}

.tags-dialog-divider {
  margin: 0.2rem 0 !important;
  /*height: 1px;*/
  /*background-color: #eee;*/
}

#filter-row td {
  border: 0 !important;
}

.p-button.p-global-tag {
  border-radius: 0;
}
</style>
