import { Module } from "./module";

export interface StudentResults {
  id?: number;
  moduleName?: string;
  parentModuleId?: number;
  receivedPoints?: number;
  maxPoints?: number;
  children?: StudentResults[] | undefined;
}
