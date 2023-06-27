<template>
	<SectionTitleLineWithButton
			:icon="mdiCogOutline"
			:title="title"
			main
		>
		<Button type="button" 
                      class="p-button-rounded p-button-default btn-white-text"
                      icon="pi pi-undo"
                      style="margin-right: .5em"
                      @Click="back"
                    ></Button>  
	</SectionTitleLineWithButton>

	<FormField :label="selectedModule">
		<FormControl v-model="module.name" placeholder="Module name" :icon="mdiFormTextbox"/>
		<FormControl v-model="module.abbreviation" placeholder="Abbreviation" :icon="mdiFormTextbox"/>
	</FormField>

	<FormField>
		<FormField>
			<FormControl v-model="module.maxPoints" placeholder="Points" :icon="mdiStar"/>
			<FormControl v-model="module.passingPercent" placeholder="Percent required" :icon="mdiPercentCircleOutline"/>
		</FormField>

		<FormField>
			<Calendar v-model="module.deadline" placeholder="Deadline"
			class="border-gray-700 rounded w-full border bg-white dark:bg-slate-800" style="--dp-border-color: white; --dp-border-color-hover: white;"></Calendar>
		</FormField>
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
		mdiCogOutline,
		mdiFormTextbox,
		mdiPercentCircleOutline,
		mdiStar
		} from "@mdi/js";
    import { Module } from '@/model/module';
    import { useModuleStore, ModuleStore } from '@/store/moduleStore';
    import { defineComponent, ref, Ref } from 'vue';
	import useApi, { useApiRawRequest } from '../modules/api';
    import { useRoute, useRouter } from 'vue-router';
	import SectionTitleLineWithButton from "@/template/components/SectionTitleLineWithButton.vue";
	import FormField from "@/template/components/FormField.vue";
	import FormControl from "@/template/components/FormControl.vue";
	import BaseDivider from "@/template/components/BaseDivider.vue";
	import {useAuthStore} from "@/store/authStore";
	import Toast from "primevue/toast";
	import { useToast } from "primevue/usetoast";	
	

	export default defineComponent({
		components: {FormField, FormControl, BaseDivider},
		data() {	
			const route = useRoute();
			const courseId = route.params.courseId;
			const parentId = route.params.parentId;
			const title : string = route.meta.title as string;
			var module: Ref<Module> = ref({ name: '', abbreviation: '', passingPercent: null, courseId: Number(courseId), parentModuleId: Number(parentId), children: [] });
			if (title.includes("Edit"))
			{
				let existingModule = ModuleStore.getModuleById(Number(parentId));
				module = existingModule;
			}
				
			return {
				courseId: courseId,
				parentId: parentId,
				module: module,
				title: title,
				authStore: useAuthStore(),
				router: useRouter(),
				toast: useToast(),
				mdiPercentCircleOutline,
				mdiFormTextbox,
				mdiStar,
				mdiCogOutline
			}
		},
		methods: {
			async submitForm() {
				const { addModule } = useModuleStore();
				const res = await addModule(this.module, this.title);
				if (typeof res == 'number') 
				{
					this.module.name = '';
					this.module.abbreviation = '';
					this.module.deadline = new Date();
					this.router.push({ name: 'courseView', params: {id: this.courseId}});
				}
				else
				{
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
			},	
			back() {
				this.router.push({ name: 'courseView', params: {id: this.courseId}});
			}
		}

	});


	// const apiGetParentModule = useApi<Module>('modules/' + parentId, {
	// 		headers: { Authorization: 'Bearer ' + authStore.token },
	// 	}
	// );

	// var selectedModule: string = '';

			
	/*const findParentModule = async () => {
		if (parentId !== '-') {
			await apiGetParentModule.request();
			if (apiGetParentModule.response.value) {
				var data = apiGetParentModule.response.value;
				return new Promise((resolve) => {
					resolve('Parent module: ' + data.name)
				});
			}
		}
		else
		{
			return '';
		}
	}

	findParentModule().then((res: string) => {
		console.log(res);
		selectedModule = res;
	})*/
    
  </script>  