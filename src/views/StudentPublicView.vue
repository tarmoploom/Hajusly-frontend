<script lang="ts">
import SectionFullScreen from "@/template/components/SectionFullScreen.vue";
import CardBox from "@/template/components/CardBox.vue";
import LayoutGuest from "@/template/layouts/LayoutGuest.vue";
import FormCheckRadioGroup from "@/template/components/FormCheckRadioGroup.vue";
import FormField from "@/template/components/FormField.vue";

import NotificationBar from "@/template/components/NotificationBar.vue";

import FormControl from "@/template/components/FormControl.vue";
import BaseDivider from "@/template/components/BaseDivider.vue";
import BaseButton from "@/template/components/BaseButton.vue";
import BaseButtons from "@/template/components/BaseButtons.vue";
import {mdiEmail, mdiEmailOpen, mdiSortAscending, mdiSortDescending, mdiTableOff, mdiTrashCan, mdiAccountSchool} from "@mdi/js";
import {Options, Vue} from "vue-class-component";
import BaseIcon from "../template/components/BaseIcon.vue";
import CardBoxComponentTitle from "../template/components/CardBoxComponentTitle.vue";
import {usePrivateMessageStore} from "../store/PrivateMessageStore";
import { Course } from "../model/course";
import { StudentPointsStore } from "../store/StudentPointsStore";

@Options({
  components: {

    BaseDivider,
    BaseIcon, FormControl, FormField,
    BaseButtons, BaseButton, CardBox, CardBoxComponentTitle, NotificationBar, LayoutGuest, SectionFullScreen,
    FormCheckRadioGroup
  },
  data() {

    return {
      
      mdiTrashCan, BaseButton, BaseButtons, mdiTableOff,
      mdiSortAscending, mdiSortDescending, mdiEmail, mdiEmailOpen, mdiAccountSchool
    }
  },
  props: {
  }
})
export default class StudentPublicView extends Vue {
  message : string = '';
  course: any = {name: '', code: '', start: '', end: ''};
  studentHeader: string = '';
  studentResults: any;

  async getStudentResults()
  : Promise<void> {
    var pathArray = window.location.href.split('/');
    var guid = pathArray[pathArray.length-1];
    var response = await StudentPointsStore.getStudentResultsPublic(guid);
    this.studentHeader = response.studentHeader;
    this.course = response.course;
    this.course.start = this.formatDate(this.course.courseStart);
    this.course.end = this.formatDate(this.course.courseEnd);
    this.studentResults = response.results;
  }

  formatDate(dateString: string) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {dateStyle: 'long'}).format(date);
  }
  
  async mounted()
      : Promise<void> {
        this.getStudentResults();
        console.log("MessagesTable mounted")
  }
  submit() {

    var pathArray = window.location.href.split('/');
    //var secondLevelLocation = pathArray[pathArra];
    var guid = pathArray[pathArray.length-1];
    console.log(this.message);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        subject: "Message from public page" ,
        message: this.message
      })
    };
    fetch(import.meta.env.VITE_APIURL + "PrivateMessage?studentGuid=" + guid, requestOptions);
  }
  
}

</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="pinkRed">   
      
      <CardBox class="rounded-2xl flex-col dark:bg-slate-900/70 bg-white flex w-11/12 md:w-9/12 lg:w-9/12 xl:w-9/12 shadow-2xl">
        <SectionTitleLineWithButton
        :icon="mdiAccountSchool"
        :title= "studentHeader"
        main
      >
      </SectionTitleLineWithButton>
        <div class="space-y-3">
          <h1 class="text-2xl">My Results</h1>
        </div>
        <BaseDivider />
          
        <div class="row text-lg font-semibold" style="display: flex;">
          <div class="column" style="padding-right: 2%;">
            Course name: 
            <br/>
            Course code: 
          </div>
          <div class="column">
            {{course.name}}
            <br/>
            {{course.code}}
          </div>
          <div class="column" style="padding-left: 20%; padding-right: 2%;">
            Beginning of course: 
            <br/>
            End of course: 
          </div>
          <div class="column">
            {{course.start}}
            <br/>
            {{course.end}}
          </div>

        </div>
          <div class="card student-results-dt">
            <TreeTable :value="studentResults">
              <Column field="moduleName" header="Module" :expander="true" />

              
              <Column field="receivedPoints" header="Received Points" />
            
              <Column field="maxPoints" header="Max Points" />
            </TreeTable>
            </div>

        <template #footer>
          <FormField label="Settings">
            <FormCheckRadioGroup
                name="email-switch"
                type="switch"
                :options="{ sendUpdates: 'Send updates via email'}"
            />
          </FormField>

          <BaseDivider />

          <form @submit="submit" class="add-form">
          <CardBox form @submit.prevent="submit">

          <FormField label="Message" help="Send message to Course host">
            <FormControl
                type="textarea"
                placeholder="Explain how we can help you"
                v-model="message"
            />
          </FormField>

            <BaseButtons>
              <BaseButton type="submit" color="info" label="Submit"/>
              <BaseButton type="reset" color="info" outline label="Reset"/>
            </BaseButtons>
            
          </CardBox>
          </form>
        </template>
      </CardBox>
     


    </SectionFullScreen>
  </LayoutGuest>
</template>
<style>
.p-button {
  border-style: solid;
  margin-right: 0.75rem;
  margin-bottom: 0.75rem;
  margin-right: 0.75rem;
  margin-bottom: 0.75rem;
  --tw-border-opacity: 1;
  border-color: rgb(37 99 235 / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: rgb(37 99 235 / var(--tw-bg-opacity));
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;


}
</style>
