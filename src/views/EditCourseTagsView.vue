<template>

  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        v-model:title=thisTitle
        main
      >

        <Button type="button"
                class="p-button-rounded p-button-default btn-white-text"
                icon="pi pi-undo"
                style="margin-right: .5em"
                @Click="goBack"
        />

      </SectionTitleLineWithButton>

      <div class="card">
        <Splitter :layout="splitterLayout" style="min-height: 300px">
          <SplitterPanel class="flex align-items-center justify-content-center" :size="leftPanelSize">
            <table class="edit-tags-left-side">
              <tr>
                <td>
                  <div class="notifications">
                    <div v-if="bTrashModeActive"
                         :style="{'backgroundColor': 'var(--yellow-500)', 'color': '#444'}">
                      <small>trash mode is active</small></div>
                  </div>
                </td>
              </tr>

              <tr style="height: 100%; vertical-align: top">
                <td style="vertical-align: top">
                  <div class="tags-buttons">
                    <span class="p-input-icon-left tags-search-bar">
                      <i class="pi pi-search" />
                      <InputText type="text" v-model="tagsSearch" placeholder="Search" />
                    </span>
                    <Divider class="tags-dialog-divider" />
                    <span v-for="tag in tagsList">
                      <Button v-if="tag.name.toUpperCase().includes(tagsSearch.toUpperCase())"
                              :class="{'p-button-rounded': true, 'p-button-outlined': true, 'p-tag-button': true, 'p-global-tag': tag.partOfCourseId == null}"
                              :aria-label="tag.name"
                              @click="editOrTrashTag(tag.id)"
                              :style="{'color': tag.color}">
                        <span class="px-3">{{ tag.name }}</span>
                        <i v-if="bTrashModeActive" class="pi pi-times" style="color: #DC3535"></i>
                        <i v-else class="pi pi-pencil"></i>
                      </Button>
                    </span>
                  </div>
                </td>
              </tr>
            </table>

          </SplitterPanel>
          <SplitterPanel class="flex align-items-center justify-content-center" :size="rightPanelSize">
            <TabView ref="tabview2" v-model:activeIndex="activeTab" class="tab-view">
<!--                create tab-->
              <TabPanel header="Create New Tag">
                <div class="card create-new-tag">
                  <h5>Tag Name</h5>
                  <div>
                    <InputText type="text" v-model="tfTagName"
                               placeholder="Tag Name"
                               :class="{ 'p-invalid': errors.tagName != null}"
                               ria-describedby="tag-name-help" />
                  </div>
                  <div>
                    <small v-if="errors.tagName" id="tag-name-help"
                           class="p-error">{{ errors.tagName }}</small>
                  </div>
                  <br/>
                  <h5>Tag Color</h5>
                  <div><ColorPicker v-model="tagColor" :inline="false" /></div>
                  <br/>
                  <div class="field-checkbox">
                    <Checkbox inputId="binaryNG" v-model="bIsGlobalTag" :binary="true" />
                    <label for="binaryNG">Is this global tag ?</label>
                  </div>
                  <br/>
                  <div><Button label="Create" class="p-dialog-submit-button" @click="createNewTag()"/></div>
                </div>
              </TabPanel>
<!--                edit tag-->
              <TabPanel v-if="editingTag != null" :header="editingTagTitle">
                <div class="card create-new-tag">
                  <Button icon="pi pi-times" class="p-button p-button-icon-only p-button-rounded p-button-text" @click="closeModifyTag()" />
                  <h5>Tag Name</h5>
                  <div>
                    <InputText type="text" v-model="editingTag.name"
                               placeholder="Tag Name"
                               :class="{ 'p-invalid': editErrors.tagName != null}"
                               ria-describedby="edit-tag-name-help" />
                  </div>
                  <div>
                    <small v-if="editErrors.tagName" id="edit-tag-name-help"
                           class="p-error">{{ editErrors.tagName }}</small>
                  </div>
                  <br/>
                  <h5>Tag Color</h5>
                  <div><ColorPicker v-model="editingTag.color" :inline="false" /></div>
                  <br/>
                  <div class="field-checkbox">
                    <Checkbox inputId="binaryEG" v-model="editingTag.isGlobalTag" :binary="true" />
                    <label for="binaryEG">Is this global tag ?</label>
                  </div>
                  <br/>
                  <div><Button label="Modify" class="p-dialog-submit-button" @click="modifyTag()"/></div>
                  <div><Button label="Trash it" class="p-dialog-submit-button p-button-danger" @click="trashTag(editingTag.id)"/></div>
                </div>
              </TabPanel>
<!--                trash can-->
              <TabPanel header="TrashCan">
                <div><small>* left click on tag to restore</small></div>
                <div><small>* on trash mode left click will trash tag from left side</small></div>
                <Divider class="tags-dialog-divider" />
                <div>
                  <Button v-if="bTrashModeActive === true" label="Disable Trash Mode" class="p-dialog-submit-button p-button-warning" @click="toggleTrashMode()"/>
                  <Button v-else label="Enable Trash Mode" class="p-dialog-submit-button p-button-warning" @click="toggleTrashMode()"/>
                </div>
                <div><Button label="Empty TrashCan" class="p-dialog-submit-button p-button-danger" @click="emptyTrashCan()"/></div>
                <span v-for="tag in trashedTags">
                  <Button
                    :class="{'p-button-rounded': true, 'p-button-outlined': true, 'p-tag-button': true, 'p-global-tag': tag.partOfCourseId == null}"
                          :aria-label="tag.name"
                          @click="recoverTag(tag.id)"
                          :style="{'color': tag.color}">
                    <span class="px-3">{{ tag.name }}</span>
                    <i class="pi pi-refresh"></i>
                  </Button>
                </span>
              </TabPanel>
            </TabView>
          </SplitterPanel>
        </Splitter>
      </div>

      <Toast position="bottom-center" group="bottom-simple" />

    </SectionMain>
  </LayoutAuthenticated>


</template>

<script lang="ts">


import { Options, Vue } from "vue-class-component";
import ContextMenu from "primevue/contextmenu";
import LayoutAuthenticated from "../template/layouts/LayoutAuthenticated.vue";
import SectionMain from "../template/components/SectionMain.vue";
import SectionTitleLineWithButton from "../template/components/SectionTitleLineWithButton.vue";
import BaseButton from "../template/components/BaseButton.vue";
import BaseButtons from "../template/components/BaseButtons.vue";
import Log from "../Log";
import { useRoute } from "vue-router";
import TagsStore from "../store/TagsStore";
import { Tag } from "../model/Tag";
import { useToast } from "primevue/usetoast";
import { toRaw } from "vue";
import { CourseStore } from "../store/courseStore";
import VueWithDarkMode from "../VueWithDarkMode";

@Options({
  components: {
    ContextMenu, LayoutAuthenticated, SectionMain, SectionTitleLineWithButton, BaseButton, BaseButtons
  },
  props: {
  }
})
export default class EditCourseTagsView extends VueWithDarkMode {

  courseIdProp: number = 1
  parentIdProp: number = 1

  courseName: string = ""
  thisTitle: string = ""

  windowWidth: number = 0
  splitterLayout: string = "horizontal"

  activeTab: number = 0
  lastActiveTab: number = 0

  leftPanelSize: number = 60
  rightPanelSize: number = 40
  tagsSearch: string = ""
  tagsList = []
  trashedTags = []

  tfTagName: string = ""
  tagColor: string = "4169e1"
  bIsGlobalTag: boolean = false
  errors = {}
  editErrors = {}

  editingTagTitle: string = ""
  editingTag: Tag = null

  bTrashModeActive: boolean = false

  toast = useToast();


  async mounted()
  : Promise<void> {
    super.mounted()

    Log.d("mounted")

    window.addEventListener('resize', this.handleResize)

    await this.init()
  }

  async updated()
  : Promise<void> {
    Log.d("updated")

    await this.init()
  }

  beforeDestroy() {
    Log.d("destroyed")

    window.removeEventListener('resize', this.handleResize)
  }

  async init()
  : Promise<void> {
    let route = useRoute();
    Log.d("courseIdProp", route.params.courseId)
    Log.d("parentIdProp", route.params.parentId)

    this.courseIdProp = Number(route.params.courseId)
    this.parentIdProp = this.isInteger(route.params.parentId)
      ? Number(route.params.courseId) : undefined

    if (await CourseStore.loadWithAxios()) {
      this.courseName = CourseStore.getCourses().find(it => it.id == this.courseIdProp).name
    }
    else {
      this.courseName = "! failed to load !"
    }

    this.thisTitle = "Edit " + this.courseName + " Tags"

    await this.updateTagsInView()
  }

  handleResize() {
    this.windowWidth = window.innerWidth

    Log.d(this.windowWidth)

    if (this.windowWidth < 800 && this.splitterLayout != "vertical") {
      this.splitterLayout = "vertical"
    }
    else if (this.windowWidth > 800 && this.splitterLayout != "horizontal") {
      this.splitterLayout = "horizontal"
    }
  }


  async updateTagsInView()
  : Promise<void> {
    await TagsStore.loadByCourse(this.courseIdProp)
    this.tagsList = TagsStore.unTrashedTags
    this.trashedTags = TagsStore.trashedTags
  }

  editOrTrashTag(tagId: number, forceEdit: boolean = false) {
    Log.d("Begin")

    if (this.bTrashModeActive == true && forceEdit == false) {
      this.trashTag(tagId)
    }
    else {
      this.editingTag = Object.assign({}, TagsStore.tags.find(it => it.id == tagId))
      this.editingTag.isGlobalTag = this.editingTag.partOfCourseId == null
      this.editingTagTitle = "Edit '" + this.editingTag.name + "'"

      // if we r editing already
      if (this.activeTab != 1) {
        this.lastActiveTab = this.activeTab
      }

      this.activeTab = 1
    }
  }

  async createNewTag()
  : Promise<void> {
    Log.d("Begin")

    let errors = {}
    let gotErrors = false

    if (this.tfTagName == null || this.tfTagName.length <= 0) {
      Log.d("missing tag name")
      gotErrors = true
      errors['tagName'] = "missing tag name"
    }

    if (gotErrors == false) {
      let postColorName = ""
      if (this.tagColor.startsWith("#")) { postColorName = this.tagColor
      } else { postColorName = "#" + this.tagColor }

      if (await TagsStore.addNew({
        name: this.tfTagName,
        color: postColorName,
        courseId: this.bIsGlobalTag == true ? null : this.courseIdProp }) == true) {

        this.toast.add({
          severity: 'success',
          summary: 'Success',
          detail: "tag '" + this.tfTagName + "' created",
          life: 3000,
          group: 'bottom-simple'
        })
      }

      await this.updateTagsInView()

      // empty name text field
      this.tfTagName = ""

    }

    this.editErrors = errors
  }

  async modifyTag()
  : Promise<void> {
    Log.d("Begin")

    let errors = {}
    let gotErrors = false

    if (this.editingTag.name == null || this.editingTag.name.length <= 0) {
      Log.d("missing tag name")
      gotErrors = true
      errors['tagName'] = "missing tag name"
    }

    if (gotErrors == false) {
      let postColorName = ""
      if (this.editingTag.color.startsWith("#")) { postColorName = this.editingTag.color }
      else { postColorName = "#"+this.editingTag.color }

      if (await TagsStore.updateTag({
        id: this.editingTag.id,
        name: this.editingTag.name,
        color: postColorName,
        courseId: this.editingTag.isGlobalTag == true ? null : this.courseIdProp }) == true) {

        this.toast.add({
          severity: 'success',
          summary: 'Success',
          detail: "tag '" + this.editingTag.name + "' updated",
          life: 3000,
          group: 'bottom-simple'
        })
      }

      await this.updateTagsInView()

      // update info from edit 'tag' tab also, maybe server is modifying something too
      // TODO: rename function for better readability
      this.editOrTrashTag(this.editingTag.id, true)

    }

    this.editErrors = errors
  }

  closeModifyTag() {
    Log.d("Begin")

    let calculatedLastActiveTab = this.lastActiveTab
    if (this.lastActiveTab > this.activeTab) {
      calculatedLastActiveTab = this.lastActiveTab - 1
    }

    this.editingTag = null
    this.activeTab = calculatedLastActiveTab
  }

  async trashTag(tagId: number)
  : Promise<void> {
    Log.d("Begin")

    if (await TagsStore.trashTag(tagId)) {
      this.toast.add({
        severity: 'success',
        summary: 'Success',
        detail: "tag '" + this.tagsList.find(it => it.id == tagId).name + "' trashed",
        life: 3000,
        group: 'bottom-simple'
      });

      await this.updateTagsInView()
      this.closeModifyTag()
    }
  }

  async recoverTag(tagId: number)
  : Promise<void> {
    Log.d("Begin")

    if (await TagsStore.recoverTag(tagId)) {
      this.toast.add({
        severity: 'success',
        summary: 'Success',
        detail: "tag '" + this.trashedTags.find(it => it.id == tagId).name + "' recovered",
        life: 3000,
        group: 'bottom-simple'
      })

      await this.updateTagsInView()
      this.closeModifyTag()
    }
  }

  toggleTrashMode() {
    this.bTrashModeActive = !this.bTrashModeActive
  }

  async emptyTrashCan()
  : Promise<void> {
    Log.d("Begin")

    if (await TagsStore.emptyTrash()) {
      this.toast.add({
        severity: 'success',
        summary: 'Success',
        detail: "trashed tags removed forever",
        life: 3000,
        group: 'bottom-simple'
      })

      await this.updateTagsInView()
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

  // TODO: can be moved to some static class
  isInteger(value)
  : boolean {
    return /^\d+$/.test(value);
  }
}
</script>

<style>


.tags-buttons {
  position: relative;
  padding: 8px;
  width: 100%;
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

.tags-dialog-divider {
  margin: 0.2rem 0 !important;
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

.tab-view {
  width: 100%;
}

.create-new-tag {
  width: 100%;
}

.create-new-tag h5 {
  margin-bottom: 8px;
  font-weight: bold;
}

.p-dialog-submit-button {
  width: 100%;
}

.trashed-tags {
  width: 100%;
  height: 100%;
}

.edit-tags-left-side {
  height: 100%;

}

.edit-tags-left-side td {
  padding: 0 !important;
}

.notifications > div {
  padding: 2px 8px;
}

.p-tag-button i {
  color: #222;
}

.p-button.p-global-tag {
  border-radius: 0;
}

.field-checkbox > label, .field-radiobutton > label {
  margin-left: .5rem;
  line-height: 1;
  color: #555;
}

.field-checkbox label {
  position: relative;
  top: 4px;
}

</style>
