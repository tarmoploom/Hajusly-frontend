import {
  mdiAccountCircle,
  mdiMonitor,
  mdiTable,
  mdiViewList,
    
} from "@mdi/js";

const courseMenu = [];

const loadCourses = async () => {
  const res = await fetch('https://localhost:7116/api/courses');
  const data = await res.json();

  if (data) {
    for (var i = 0; i < data.length; i++) {
      courseMenu.push({
        to: "/course/"+ data[i].id,
        label: data[i].name,
      });
    }
  
  }
  courseMenu.push({
    to: "/createCourse",
    label: "Create new course",
  });
};

loadCourses();

export default [
  {
    to: "/dashboard",
    icon: mdiMonitor,
    label: "Dashboard",
  },
  {
    to: "/resultlist",
    label: "Result List",
    icon: mdiTable,
  },
  {
    to: "/addStudent",
    label: "Add Student",
    icon: mdiAccountCircle,
  },
  {
    label: "Courses",
    icon: mdiViewList,
    menu: courseMenu
  },
];
