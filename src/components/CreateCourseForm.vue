<template>
	<SectionTitleLineWithButton
			:icon="mdiTelevisionGuide"
			:title="title"
			main
		>
	</SectionTitleLineWithButton>

	<FormField>
		<FormControl v-model="course.name" placeholder="Course name" :icon="mdiFormTextbox"/>
	</FormField>

	<FormField>
		<FormControl v-model="course.code" placeholder="Course code" :icon="mdiFormTextbox"/>
	</FormField>

	<FormField>
		<Calendar v-model="course.courseStart" placeholder="From" class="border-gray-700 rounded w-full border bg-white dark:bg-slate-800" style="--dp-border-color: white; --dp-border-color-hover: white;" ></Calendar>
		<Calendar v-model="course.courseEnd" placeholder="Until" class="border-gray-700 rounded w-full border bg-white dark:bg-slate-800" style="--dp-border-color: white; --dp-border-color-hover: white;"></Calendar>
	</FormField>

	<BaseDivider />

	<Button
		class="p-button-rounded p-button-warning center-button btn-white-text"
		label="OK"
		@Click="submitForm"
	></Button>    
	<Toast position="top-center" group="bottom-simple" />
  </template>
  
  <script lang="ts">
	import {
		mdiTelevisionGuide,
		mdiFormTextbox,
		mdiClockOutline
		} from "@mdi/js";
    import { Course } from '@/model/course';
    import { useCourseStore, CourseStore } from '@/store/courseStore';
    import { defineComponent, ref, Ref } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
	import SectionTitleLineWithButton from "@/template/components/SectionTitleLineWithButton.vue";
	import FormField from "@/template/components/FormField.vue";
	import FormControl from "@/template/components/FormControl.vue";
	import BaseDivider from "@/template/components/BaseDivider.vue";
	import Toast from "primevue/toast";
	import { useToast } from "primevue/usetoast";	

	export default defineComponent({
		components: {FormField, FormControl, BaseDivider},
		data() {	
			const route = useRoute();
			var course: Ref<Course> = ref({ name: '', code: '' });
			const title : string = route.meta.title as string;
			if (title.includes("Edit"))
			{
				const courseId = route.params.courseId;
				let existingCourse = CourseStore.getCourseById(Number(courseId));
				course = existingCourse;
			}
			return {
				course: course,
				title: title,
				router: useRouter(),
				toast: useToast(),
				mdiTelevisionGuide,
				mdiFormTextbox
			}
		},
		methods: {
			async submitForm() {
				const { addCourse } = useCourseStore();
				const res = await addCourse(this.course, this.title);
				if (typeof res == 'number') 
				{
					this.course.name = '';
					this.course.code = '';
					this.course.courseStart = new Date();
					this.course.courseEnd = new Date();

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
		}	
	});

  </script>  