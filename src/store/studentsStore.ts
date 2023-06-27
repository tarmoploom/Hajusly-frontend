import { defineStore } from 'pinia';
import useApi, { useApiRawRequest } from '../modules/api';
import { Ref, ref, toRaw } from 'vue';
import { Student } from '../model/student';
import { HTTP } from '../modules/api';
import { AxiosError } from 'axios';
import { useAuthStore } from './authStore';
import { Tag } from "../model/Tag";
import { useCourseStore } from "./courseStore";
import Log from "../Log";
import { FileUploadRemoveEvent } from 'primevue/fileupload';


export const useStudentStore = defineStore('studentStore', () => {
  const authStore = useAuthStore();
  const apiGetStudents = useApi<Student[]>('students', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + authStore.token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  let students = ref<Student[]>([]);
  let status: Boolean;

  const loadStudents = async () => {
    await apiGetStudents.request();

    if (apiGetStudents.response.value) {
      return apiGetStudents.response.value!;
    }

    return [];
  };

  const load = async () => {
    students.value = await loadStudents();
    //console.log(students.value);
  };

  const loadAll = async () => {
    let res: Ref<Student[]> = ref()
    await (new HTTP({ useBearer: true })).tryGet<Student[]>("/students", res)
    students.value = toRaw(res.value)
  };

  const addStudent = async (student: Student) => {
    const apiAddStudent = useApi<Student>('students', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + authStore.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    });

    await apiAddStudent.request();
    if (apiAddStudent.response.value) {
      students.value.push(apiAddStudent.response.value!);
      status = apiAddStudent.status.value;
    }
  };

  const addStudentsFromFile = async (e: FileUploadRemoveEvent) => {
    var fData = new FormData();
    fData.append('fromfile', e.files[0]);

    const apiAddStudents = useApiRawRequest('students/fromfile', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + authStore.token,
        Accept: '*/*',
      },
      body: fData,
    });
    await apiAddStudents.request();
    status = apiAddStudents.status.value;
  };

  const getStatus = () => {
    return status;
  };

  const getLastId = () => {
    let last = students.value[students.value.length - 1];
    return last == null ? 1 : last.id;
  };

  const loadByCourse = async (courseId: number) => {
    return await (new HTTP({ useBearer: true }))
      .tryGet<Student[]>("/courses/"+courseId+"/students", students)
  };

  // const addTagLocally = (tagId: number, studentId: number) => {
  //   for (let student of students.value) {
  //     if (student.id == studentId) {
  //       if (student.tags.includes(tagId)) {
  //         Log.d("tag " + tagId + " already exists for student", student)
  //         return false
  //       }
  //
  //       student.tags.push(tagId)
  //       return true
  //     }
  //   }
  //
  //   Log.d("cannot find student by id " + studentId)
  //   return false
  // };
  //
  // const removeTagLocally = (tagId: number, studentId: number) => {
  //   for (let student of students.value) {
  //     if (student.id == studentId) {
  //       if (student.tags.includes(tagId) == false) {
  //         Log.d("tag " + tagId + " doesnt exists for student", student)
  //         return false
  //       }
  //
  //       student.tags = student.tags.filter(tag => tag != tagId)
  //       return true
  //     }
  //   }
  //
  //   Log.d("cannot find student by id " + studentId)
  //   return false
  // };

  return {
    students,
    load,
    loadAll,
    addStudent,
    getLastId,
    loadByCourse,
    getStatus,
    addStudentsFromFile,
    // addTagLocally, removeTagLocally
  };
});

export class StudentStore {

  public static get students(): Student[] {
    return useStudentStore().students
  }

  public static getStudentsByCourseId(courseId: number): Student[] {
    let res: Student[] = [];

    for (let item of useStudentStore().students) {
      if (item.inCourse.includes(courseId)) {
        res.push(item);
      }
    }

    return res;
  }

  static async loadByCourse(courseId: number)
  : Promise<boolean> {
    return await useStudentStore().loadByCourse(courseId);
  }

  /**
   * will load data to useStudentStore().students
   */
  static async loadAll()
  : Promise<void> {
    await useStudentStore().loadAll()
  }

  static async getAll(): Promise<Student[]> {
    let res: Ref<Student[]> = ref();
    await new HTTP({ useBearer: true }).tryGet<Student[]>('/students', res);
    return toRaw(res.value);
  }

  static async addTag(tagId: number, studentId: number, courseId: number)
  : Promise<boolean> {
    let res = await (new HTTP({ useBearer: true })).tryPost("/students/"+studentId+"/addTag/"+tagId+"/toCourse/"+courseId)

    // if we success fully added, then lets add locally to, preventing loading too much data every little single click
    if (res == true) {
      // TODO: have to implement
      // useStudentStore().addTagLocally(tagId, studentId)
      return true
    }

    return false
  }


  static async removeTag(tagId: number, studentId: number, courseId: number)
  : Promise<boolean> {
    let res = await (new HTTP({ useBearer: true })).tryDelete("/students/"+studentId+"/removeTag/"+tagId+"/fromCourse/"+courseId)

    if (res == true) {
      // useStudentStore().removeTagLocally(tagId, studentId)
      return true
    }

    return false
  }
}
