import { useCourseStore } from "./store/courseStore";
import { Ref, ref } from "vue";
import {mdiForwardburger, mdiBackburger, mdiMenu, mdiViewList, mdiMonitor, mdiTable, mdiAccountCircle} from "@mdi/js";
import { Course } from "./model/course";
import Log from "./Log";

export class Menu {

  static Instance: Menu = undefined

  forceRerender: Function = undefined
  menu: Ref = undefined
  menuCourses: Ref = ref()
  menuStudents: Ref = ref()

  static Instantiate(): void {
    Menu.Instance = new Menu()
  }

  /**
   * should be called first to load menu without any server requests
   */
  loadMenuSync() {
    this.menuStudents.value = [
      {
        to: "/addStudent",
        label: "Add Student",
      },
      {
        to: "/editStudents",
        label: "Manage Students",
      },
    ]

    this.menuCourses.value = [
      {
        label: "Loading ..."
      }
    ]

    this.menu.value =
      [
        {
          to: "/dashboard",
          icon: mdiMonitor,
          label: "Dashboard",
        },
        {
          to: "/resultlist/1/null",
          label: "Result List",
          icon: mdiTable,
        },
        {
          // NOTICE: removed since sub menu exists
          // to: "/addStudent",
          label: "Add Student",
          icon: mdiAccountCircle,
          menu: this.menuStudents,
        },
        {
          label: "Courses",
          icon: mdiViewList,
          menu: this.menuCourses
        },
      ]
  }

  /**
   * should be called if start menu has any kinda server requests
   */
  async loadMenuAsync() : Promise<void> {
    if (await useCourseStore().loadWithAxios()) {
      this.updateCoursesInMenu(useCourseStore().courses)
    }
    else {
      this.menuCourses.value = [];

      // TODO: show some other error maybe
      this.menuCourses.value.push({
        label: "! failed to load !",
      })

      this.addCreateNewCourseMenuItem()
    }

    // NOTICE: might not need since we use vue ref
    // this.forceRerender()
  }

  updateCoursesInMenu(courses: Course[]) {
    this.menuCourses.value = []

    for (let i = 0; i < courses.length; i++) {
      this.menuCourses.value.push({
        to: "/course/"+ courses[i].id,
        label: courses[i].name,
      })
    }

    this.addCreateNewCourseMenuItem()
  }

  addCreateNewCourseMenuItem() {
    this.menuCourses.value.push({
      to: "/createCourse",
      label: "Create new course",
    })
  }

}
