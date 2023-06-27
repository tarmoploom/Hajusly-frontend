import { Course } from '../model/course';
import useApi, { HTTP, useApiRawRequest } from "../modules/api";
import { defineStore } from 'pinia';
import { Ref, ref, toRaw } from "vue";
import {useAuthStore} from "./authStore";
import { AxiosError } from "axios";
import { CourseExtended } from "../model/CourseExtended";
import { Tag } from "../model/Tag";
import { ModuleStore } from './moduleStore';

export const useCourseStore = defineStore('courseStore', () => {
  let allCourses:Course[] = [];
  let courses = ref<Course[]>([]);
  const authStore = useAuthStore();

  const apiGetCourses = useApi<Course[]>('courses', {
        headers: { Authorization: 'Bearer ' + authStore.token },
      }
  );

  const loadCourses = async () => {
    await apiGetCourses.request();
    if (apiGetCourses.response.value) {
      return apiGetCourses.response.value!;
    }

    return [];
  }

  const load = async () => {
    allCourses = await loadCourses();
    courses.value = allCourses;
  }

  const addCourse = async (course: Course, title: string) => {
    try {
      if (title.includes("Edit")) {
        let response = await HTTP.client({useBearer: true}).put("/courses/" + course.id, course);
        var index = courses.value.indexOf(course);
        if (index !== -1)
          courses.value.splice(index, 1);
        courses.value.push(response.data as Course);
        return response.data.id;
      }
      let response = await HTTP.client({useBearer: true}).post("/courses", course);
      courses.value.push(response.data as Course);
      return response.data.id;
    }
    catch (e) {
      return (e as AxiosError).response;
    }
  };

  const createNewCourse = async (course: Course) => {
    try {
      let response = await HTTP.client({useBearer: true}).post("/courses/createNew", course);
      courses.value.push(response.data as Course);
      await ModuleStore.load();
      return response.data.id;
    }
    catch (e) {
      return (e as AxiosError).response;
    }
  };

  const loadWithAxios = async () => {
    try {
      let response = await HTTP.client({useBearer: true}).get("/courses");
      courses.value = response.data as Course[]
      return true
    } catch (e) {
      console.error((e as AxiosError).response);
      courses.value = []
    }

    return false
  }


  return { courses, addCourse, load, loadWithAxios, createNewCourse };
});


/**
 * basically wrapper to fix IDE type detection
 * also store static functions
 */
export class CourseStore {

  public static getCourseById(courseId: number, arr: Course[] = useCourseStore().courses)
  : Course {

    // check if there is module by id
    for (let item of arr) {
      if (item.id === courseId) {
        return item;
      }
    }

    return null;
  }

  static async load()
  : Promise<void> {
    await useCourseStore().load();
  }

  static async loadWithAxios()
  : Promise<boolean> {
    return await useCourseStore().loadWithAxios();
  }

  static getCourses()
  : Course[] {
    return useCourseStore().courses
  }

  static async addStudentToCourse(courseId: number, studentId: number)
  : Promise<void> {
    await (new HTTP({useBearer: true})).tryPost("/courses/" + courseId + "/addStudent", {
      studentId: studentId
    })
  }

  static async RemoveStudentFromCourse(courseId: number, studentId: number)
  : Promise<void> {
    await (new HTTP({useBearer: true})).tryDelete("/courses/" + courseId + "/removeStudent/" + studentId)
  }

  static async getAllCoursesExtended({
                                       includeStudents = false,
                                       includeStudentsCount = false,
                                       includeModules = false,
                                       includeModulesCount = false,
                                       onlyArchived = false,
                                       onlyActive = false
  } : GetCoursesExtendedNamedArgs)
  : Promise<CourseExtended[]>{
    let res: Ref<CourseExtended[]> = ref()
    await (new HTTP({useBearer: true})).tryGet<CourseExtended[]>(
      "/courses/extended"
      + "?includeStudents=" + includeStudents
      + "&includeStudentsCount=" + includeStudentsCount
      + "&includeModules=" + includeModules
      + "&includeModulesCount=" + includeModulesCount
      + "&onlyArchived=" + onlyArchived
      + "&onlyActive=" + onlyActive
      ,  res)
    return toRaw(res.value)
  }

  static async archiveCourse(courseId: number):
  Promise<boolean> {
    return await (new HTTP({useBearer: true})).tryPost("/courses/" + courseId + "/archive");
  }

  static async unArchiveCourse(courseId: number) {
    return await (new HTTP({useBearer: true})).tryPost("/courses/" + courseId + "/unArchive");
  }
}

export interface GetCoursesExtendedNamedArgs {
  includeStudents?: boolean
  includeStudentsCount?: boolean
  includeModules?: boolean
  includeModulesCount?: boolean
  onlyArchived?: boolean
  onlyActive?: boolean
}


