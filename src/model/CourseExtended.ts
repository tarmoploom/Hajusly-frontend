import { Course } from "./course";
import { Student } from "./student";
import { Module } from "./module";


export interface CourseExtended {
  course: Course,
  students?: Student[] | null;
  studentsCount?: number | null;
  modules?: Module[] | null;
  modulesCount?: number | null;
}
