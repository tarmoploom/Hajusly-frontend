import { Module } from '../model/module';
import useApi, { useApiRawRequest } from '../modules/api';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { HTTP } from "../modules/api";
import { AxiosError } from "axios";
import { ModuleIdAndPoints } from "../model/ModuleIdAndPoints";
import {useAuthStore} from "./authStore";

export const useModuleStore = defineStore('moduleStore', () => {

  const authStore = useAuthStore();

  // NOTICE: can be removed, just for testing if .load() is not called on mounted(vue)
  const modules = ref<Module[]>([
    {
      id: 1,
      name: "Back-end",
      abbreviation: "BE",
      courseId: 1,
      maxPoints: 10,
      passingPercent: 51,
      children: [
        {
          id: 2,
          name: "Installing tools",
          abbreviation: "1.1",
          courseId: 1,
          parentModuleId: 1,
          maxPoints: 2
        },
        {
          id: 3,
          name: "Hello world",
          abbreviation: "1.2",
          courseId: 1,
          parentModuleId: 1,
          maxPoints: 1
        }
      ]
    },
    {
      id: 4,
      name: "Front-end",
      abbreviation: "FE",
      courseId: 1,
      maxPoints: 10,
      passingPercent: 51,
      children: [
        {
          id: 5,
          name: "Installing tools",
          abbreviation: "2.1",
          courseId: 1,
          parentModuleId: 4,
          maxPoints: 2
        }
      ]
    }
  ]);

  const load = async () => {
    try {
      let response = await HTTP.client({useBearer: true}).get("/modules");
      modules.value = response.data as Module[]
    } catch (e) {
      console.error((e as AxiosError).response);
      modules.value = []
    }
  }

  const loadByCourse = async (courseId: number) => {
    try {
      let response = await HTTP.client({useBearer: true}).get("/courses/"+courseId+"/modules");
      modules.value = response.data as Module[]
    } catch (e) {
      console.error((e as AxiosError).response);
      modules.value = []
    }
  }

  const addModule = async (module: Module, title: string) => {
    try {
      if (title.includes("Edit")) {
        let response = await HTTP.client({useBearer: true}).put("/modules/"+module.id, module);
        var index = modules.value.indexOf(module);
        if (index !== -1)
          modules.value.splice(index, 1);
        modules.value.push(response.data as Module);
        return response.data.id;
      }
      let response = await HTTP.client({useBearer: true}).post("/modules", module);
      modules.value.push(response.data as Module);
      return response.data.id;
    }
    catch (e) {
      return (e as AxiosError).response;
    }
  };

  return { modules, load, loadByCourse, addModule };
});

/**
 * basically wrapper to fix IDE type detection
 * also store static functions
 */
export class ModuleStore {

  static async load()
  : Promise<void> {
    useModuleStore().load()
  }

  static async loadByCourse(courseId: number)
  : Promise<void> {
    await useModuleStore().loadByCourse(courseId)
  }

  /**
   * get all rot modules provided by 'rootModuleId' or just get top level ones
   * @param courseId
   * @param rootModuleId
   * @param arr
   * @returns flat array [module1, module2, module3]
   */
  public static getRootModulesByCourseId(courseId: number, rootModuleId: number = null, arr: Module[] = useModuleStore().modules)
  : Module[] {
    let res: Module[] = []

    for (let item of arr) {
      if (item.courseId === courseId) {
        if (item.parentModuleId == rootModuleId) {
          res.push(item)
        } else {
          if (item.children != undefined) {
            for (let el of ModuleStore.getRootModulesByCourseId(courseId, rootModuleId, item.children)) { res.push(el) }
          }
        }
      }
    }

    return res
  }

  /**
   * recursively find module reference
   * @param moduleId
   * @param arr
   */
  public static getModuleById(moduleId: number, arr: Module[] = useModuleStore().modules)
  : Module {

    // check if there is module by id
    for (let item of arr) {
      if (item.id === moduleId) {
        return item
      }
    }

    for (let item of arr) {
      let res = ModuleStore.getModuleById(moduleId, item.children)
      if (res != null) { return res }
    }

    return null
  }

  /**
   * ... TODO:
   * @param item
   * @returns flat array [module1, module2, module3] from tree
   */
  public static recursiveFindChildren(item: Module)
  : Module[] {
    let res: Module[] = [ item ]

    if (item.children != undefined) {

      // since it has children meaning children will give points to final sum
      if (item.children.length > 0) {
        item.maxPoints = 0
      }

      for (let child of item.children) {
        for (let el of ModuleStore.recursiveFindChildren(child)) { res.push(el) }
      }
    }

    return res
  }

  /**
   * get module max points,
   * if it has sub modules, max points from submodules will be added together
   * instead of using root object 'maxPoints' field
  */
  public static getModuleMaxPoints(moduleId: number)
  : number {
    let findModule = (arr: Module[]) => {
      for (let item of arr) {
        if (item.id == moduleId) { return item }

        if (item.children != undefined) {
          let res = findModule(item.children)
          if (res != null) { return res }
        }
      }

      return null
    }

    let module = findModule(useModuleStore().modules)
    if (module != null) {
      return ModuleStore.recursiveFindChildren(module).map((it) => it.maxPoints)
        .reduce((partialSum, a) => partialSum + a, 0)
    }

    return 0
  }

}
