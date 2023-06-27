
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {StudentPoints, StudentResults} from "../model/StudentPoints";
import { HTTP } from "../modules/api";
import { AxiosError } from "axios";
import {Module} from "../model/module";
import {useModuleStore} from "./moduleStore";
import useApi, { useApiRawRequest } from '../modules/api';
import {useAuthStore} from "./authStore";


export const useStudentPointsStore = defineStore('StudentPointsStore', () => {

  const authStore = useAuthStore();
  const studentPoints = ref<StudentPoints[]>([
    // {
    //   id: 1,
    //   studentId: 1,
    //   moduleId: 2,
    //   points: 2
    // },
    // {
    //   id: 3,
    //   studentId: 1,
    //   moduleId: 3,
    //   points: 1
    // },
    // {
    //   id: 1,
    //   studentId: 1,
    //   moduleId: 5,
    //   points: 1.5
    // },
  ]);

  const studentResults = ref<StudentResults[]>([]);

  const loadCoursePoints = async (courseId: number) => {
    try {
      let response = await HTTP.client({useBearer: true}).get("/courses/"+courseId+"/points");
      studentPoints.value = response.data as StudentPoints[]
    } catch (e) {
      console.error((e as AxiosError).response);
      studentPoints.value = []
    }
  }

  // const loadStudentResults = async (courseId: number, studentId: number) => {
  //   const authStore = useAuthStore();
  //
  //   const res = useApi<StudentResults[]>("courses/"+courseId+"/student/"+studentId, {
  //     headers: {
  //       Authorization: 'Bearer ' + authStore.token,
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     }
  //   });
  //   await res.request();
  //
  //   console.log("res.response.value", res.response.value)
  //
  //   if (res.response.value) {
  //     var data = res.response.value;
  //     // return data;
  //     return convertModulesToNodes(data, this);
  //   }
  // }

  const updateOrAddPointsObject = async (obj: StudentPoints) => {
    const res = useApi<StudentPoints>('modules/addCredit', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + authStore.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj),
    });

    await res.request();
    let el = studentPoints.value.find(it => it.moduleId == obj.moduleId && it.studentId == obj.studentId)

    if (el == null) {
      studentPoints.value.push(obj)
    } else {
      // dunno if .find return reference
      for (let it of studentPoints.value) {
        if (it.moduleId == obj.moduleId && it.studentId == obj.studentId) { it.points = obj.points }
      }
    }

  }

  return { studentPoints, studentResults, updateOrAddPointsObject, loadCoursePoints };
});

/**
 * basically wrapper to fix IDE type detection
 * also store static functions
 */
export class StudentPointsStore {

  public static getPointsByStudentId(studentId: number)
  : StudentPoints[] {
    let res: StudentPoints[] = []

    for (let item of useStudentPointsStore().studentPoints) {
      if (item.studentId === studentId) {
        res.push(item)
      }
    }

    return res
  }

  public static async updateStudentPoints(arr: StudentPoints[])
  : Promise<void> {
    for (let item of arr) {
      await useStudentPointsStore().updateOrAddPointsObject(item)
    }
  }

  public static async getStudentResults(courseId: number, studentId: number)
  : Promise<any> {
    try {
      let response = await HTTP.client({useBearer: true}).get("courses/"+courseId+"/student/"+studentId);
      return StudentPointsStore.convertModulesToNodes(response.data as StudentResults[])
    } catch (e) {
      console.error((e as AxiosError).response);
    }

    return []
  }

  public static async getStudentResultsPublic(guid: string)
  : Promise<any> {
    try {
      let response = await HTTP.client({useBearer: true}).get("courses/results/"  + guid);
      response.data.results = StudentPointsStore.convertModulesToNodes(response.data.results as StudentResults[]);
      return response.data;
    } catch (e) {
      console.error((e as AxiosError).response);
    }

    return []
  }

  
  public static async downloadCSV(courseId: number, courseName: string)
  : Promise<void> {
    try {
      await new HTTP({useBearer: true}).tryDownload("courses/"+courseId+"/resultCSV", courseName);
    } catch (e) {
      console.error((e as AxiosError).response);
    }
  }

  public static convertModulesToNodes(modules: StudentResults[]) {
    let res = []

    for (let module of modules) {
      let obj = {}
      obj['data'] = module
      obj['key'] = module.id

      if (module.children != undefined && module.children.length > 0) {
        obj['children'] = StudentPointsStore.convertModulesToNodes(module.children)
      }

      res.push(obj)
    }

    return res
  }

}
