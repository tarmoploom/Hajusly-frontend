import { Module } from "./module";

export interface Course {
    id?: number;
    name: string;
    code?: string;
    courseStart: Date;
    courseEnd: Date;
    teacherId?: number;
    isArchived?: boolean;
    modules?: Array<Module>;
}
