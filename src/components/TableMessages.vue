<script lang="ts">
import { computed, ref } from "vue";
import {mdiTrashCan, mdiSortAscending, mdiSortDescending, mdiEmail, mdiEmailOpen} from "@mdi/js";
import CardBoxModal from "@/template/components/CardBoxModal.vue";
import TableCheckboxCell from "@/template/components/TableCheckboxCell.vue";
import BaseLevel from "@/template/components/BaseLevel.vue";
import BaseButtons from "@/template/components/BaseButtons.vue";
import BaseButton from "@/template/components/BaseButton.vue";
import {Options, Vue} from "vue-class-component";
import {usePrivateMessageStore} from "../store/PrivateMessageStore";
import { PrivateMessage } from "../model/PrivateMessage";
import BaseIcon from "../template/components/BaseIcon.vue";
import CardBox from "../template/components/CardBox.vue";
import CardBoxComponentTitle from "../template/components/CardBoxComponentTitle.vue";
import BaseDivider from "../template/components/BaseDivider.vue";
import {StudentStore, useStudentStore} from "../store/studentsStore";
import {useCourseStore} from "../store/courseStore";
import FormField from "@/template/components/FormField.vue";
import FormControl from "@/template/components/FormControl.vue";

@Options({
  components: {

    BaseDivider,
    BaseIcon, FormControl, FormField,
    CardBoxModal, TableCheckboxCell, BaseButtons, BaseButton, BaseLevel, CardBox, CardBoxComponentTitle
  },
  data() {
    return {
      mdiTrashCan, BaseButton, BaseButtons, CardBoxModal,
      BaseLevel, mdiSortAscending, mdiSortDescending, mdiEmail, mdiEmailOpen
    }
  },
  props: {
  }
})


export default class TableMessages extends Vue {
  messages: PrivateMessage[] = [];
  isModalDangerActive: boolean = false;
  isReplyModalActive: boolean = false;
  but: boolean = false;
  currentSort = 'name';
  currentSortDir = 'asc';
  messageOpen = false;
  lastMessageId = '';

  currentMessage = {
    id:"",
    subject: "",
    message: "",
    sent: ""
  };

  // created() {
  //   console.log("created");
  //
  // }

  async init()
  : Promise<void> {
    await usePrivateMessageStore().load()
    this.messages = usePrivateMessageStore().messages;
    await useStudentStore().load();
    await useCourseStore().load();
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    // Then specify how you want your dates to be formatted
    return new Intl.DateTimeFormat('et-EE', {dateStyle: 'medium', timeStyle: 'medium'}).format(date);
  }

  async mounted()
  : Promise<void> {
    console.log("MessagesTable mounted")
    await this.init();
    usePrivateMessageStore().loadMessageById(this.lastMessageId);
  }

  async getMessageById(id) {
    if (this.lastMessageId != id) {
      this.lastMessageId = id;
      this.messageOpen = true;

    } else {
      this.messageOpen = !this.messageOpen;
    }

    await usePrivateMessageStore().loadMessageById(this.lastMessageId);
    await usePrivateMessageStore().load();
    this.currentMessage = usePrivateMessageStore().currentMessage;
   }

   getStudentById(id) {
     let students = useStudentStore().students;
     const student = students.find((obj) => {
       return obj.id === id;
     });

     if (student != null) {
       return `${student.firstName} ${student.lastName}`;
     }

     return "";
   }


  getCourseById(id) {
    let courses = useCourseStore().courses;
    const course = courses.find((obj) => {
      return obj.id === id;
    });

    return course.name;
  }

  sort(s) {
  if(s === this.currentSort) {
  this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
  }
    this.currentSort = s;
  }

  getSortingIcon() {
    if (this.currentSortDir == 'asc') {
      return mdiSortAscending
    } else {
      return mdiSortDescending
    }
  }

  getEmailIcon(b) {
    if (b) {
      return mdiEmailOpen
    }
    return mdiEmail
  }

  messagesByDate() {
    return this.messages.sort((a, b) =>
        {
          let m = 1;
          if(this.currentSortDir === 'desc') m = -1;
          if(a['sent'] < b['sent']) return 1 * m;
          if(a['sent'] > b['sent']) return -1 * m;
          return 0;
        }
    );

    // just testing design
    // return [
    //   {
    //     id: 1,
    //     isRead: false,
    //     studentId: 1,
    //     sent: new Date()
    //   },
    //   {
    //     id: 2,
    //     isRead: false,
    //     studentId: 1,
    //     sent: new Date()
    //   },
    // ]
  }

  toggleItem(item, e) {
    if (e.ctrlKey) {
      item.isRead = false;

    } else {
      this.messages.forEach(function(entry) {
        entry.isRead = false;
      });
      item.isRead = false;
    }


  }


}




</script>

<template>

  <CardBoxModal
    v-model="isModalDangerActive"
    title="Please confirm"
    button="danger"
    has-cancel
  >
    <p>Are you sure you want to <b>delete</b> this message?</p>
    <p>this action can not be undone</p>
  </CardBoxModal>

  <CardBoxModal
      v-if="currentMessage.sent"
      v-model="isReplyModalActive"
      :title="'Reply to ' + getStudentById(currentMessage.studentId)"
      button="Send"
      has-cancel
  >

    <FormField :label="'Re: ' + currentMessage.subject " help="">
      <FormControl
          type="textarea"
          placeholder="Type reply here"
      />
    </FormField>

  </CardBoxModal>



  <CardBox>

<!--  <CardBox style="max-height:300px; overflow:scroll;overflow-x-scroll;hover:overflow-scroll">-->
    <CardBox class="max-h-96 overflow-x-auto">

    <table>
    <thead>
    <tr>
      <th></th>
      <th @click="sort('name')">Sent
        <BaseIcon :path="getSortingIcon()"></BaseIcon>
      </th>
      <th>Student</th>
      <th>Subject</th>
      <th></th>
      <th />
    </tr>
    </thead>
    <tbody>
    <tr v-for="message in messagesByDate()" :key="message">
      <td @click="getMessageById(message.id)">
        <BaseIcon :path="getEmailIcon(message.isRead)"></BaseIcon>
      </td>
      <td @click="getMessageById(message.id)">{{formatDate(message.sent)}} </td>
      <td @click="getMessageById(message.id);">{{getStudentById(message.studentId)}}</td>
      <td @click="getMessageById(message.id); message.isRead=true;"
          :class="{ 'font-bold': !message.isRead  }"
          :key="message.id"
          >{{message.subject}}</td>
      <td>
        <BaseButtons type="justify-start lg:justify-end" no-wrap>
<!--        <BaseButton-->
<!--            color="info"-->
<!--            :icon="mdiEye"-->
<!--            small-->
<!--            @click="isModalActive = true"-->
<!--        />-->
        <BaseButton
            color="danger"
            :icon="mdiTrashCan"
            small
            @click="isModalDangerActive = true"
        />
      </BaseButtons>
      </td>
    </tr>
    </tbody>
  </table>
  </CardBox>

  <BaseDivider v-if="messageOpen"></BaseDivider>

    <div v-if="messageOpen">
      &nbsp;

      <BaseButton
          color="info"
          :icon="mdiEye"
          label="reply"
          size="small"
          @click="isReplyModalActive = true"
      />
      <CardBox
          v-if="currentMessage.sent"
          class="cursor-pointer md:w-7/12 lg:w-11/12 shadow-2xl md:mx-auto"
          is-hoverable>
        <div>
          <BaseIcon :path="mdiEmail"></BaseIcon>
          {{formatDate(currentMessage.sent)}}

        </div>
        <div>
          <div><span class="font-bold">From:</span>
          {{ getStudentById(currentMessage.studentId) }}</div>
        </div>
        <div><span class="font-bold py-2">Course: </span> {{getCourseById(currentMessage.courseId)}}</div>

        <p class="space-y-3 font-bold py-2">Subject: {{currentMessage.subject}}</p>


        <div class="tracking-wide pl-3 py-8">
          <p>{{currentMessage.message}}</p>
        </div>

      </CardBox>

    </div>
<!--  <CardBox v-if="messageOpen">-->

<!--      aabb<br />-->
<!--    {{currentMessage}}-->
<!--    <table>-->
<!--      <tr>-->
<!--        <td><BaseIcon :path="mdiEmail"></BaseIcon></td>-->
<!--        <td>    {{formatDate(currentMessage.sent)}}-->
<!--        </td>-->
<!--        <td>    {{currentMessage.subject}}-->
<!--        </td>-->
<!--      </tr>-->
<!--      <tr>-->
<!--        <td colspan="3">{{currentMessage.message}}</td>-->
<!--      </tr>-->
<!--    </table>-->
<!--    -->
<!--  </CardBox>-->
  </CardBox>
 </template>

<style>

</style>
