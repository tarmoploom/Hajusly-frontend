import { Tag } from "../model/Tag";
import { ref, Ref, toRaw } from "vue";
import { HTTP } from "../modules/api";
import { StudentAndTags } from "../model/StudentAndTags";
import Log from "../Log";

export default class TagsStore {

  private static m_tags: Tag[] = [
    {
      id: 1,
      name: "blu tag",
      color: "#4169e1"
    }
  ]


  public static get tags(): Tag[] {
    return TagsStore.m_tags
  }

  /**
   * > Returns all the tags that are not trashed
   * @returns The unTrashedTags property returns an array of Tag objects that are not trashed.
   */
  public static get unTrashedTags(): Tag[] {
    return TagsStore.m_tags.filter(it => !it?.trashed ?? true)
  }

  /**
   * > Returns all the tags that are trashed
   * @returns An array of all the tags that are trashed.
   */
  public static get trashedTags(): Tag[] {
    return TagsStore.m_tags.filter(it => it?.trashed ?? false)
  }

  // private static set tags(tags: Tag[]) {
  //   TagsStore.m_tags = tags
  // }

  /**
   * will load data from api to this class variable 'tags'
   */
  public static async load()
  : Promise<boolean> {
    let res: Ref<Tag[]> = ref()
    let isSuccess = await (new HTTP({ useBearer: true })).tryGet<Tag[]>("/tags", res)
    TagsStore.m_tags = toRaw(res.value)

    return isSuccess
  }

  /**
   * will load data from api to this class variable 'tags'
   */
  public static async loadByCourse(courseId: number)
  : Promise<boolean> {
    let res: Ref<Tag[]> = ref()
    let isSuccess = await (new HTTP({ useBearer: true })).tryGet<Tag[]>("/courses/"+courseId+"/tags", res)
    TagsStore.m_tags = toRaw(res.value)

    return isSuccess
  }

  /**
   * It updates a tag.
   * @param {UpdateTagsAddNewNamedArgs}  - UpdateTagsAddNewNamedArgs
   * @returns A boolean
   */
  public static async updateTag({id = 1, name = "tag name", color = "#001100", courseId = null} :UpdateTagsAddNewNamedArgs)
  : Promise<boolean> {
    return await (new HTTP({ useBearer: true })).tryPatch("/tags", {
      id: id,
      name: name,
      color: color,
      partOfCourseId: courseId
    })
  }

  /**
   * It sends a DELETE request to the server, but it wont delete it, instead trashing it,
   * and returns true if the request was successful
   * @param {number} tagId - The id of the tag you want to delete.
   * @returns A boolean
   */
  public static async trashTag(tagId: number)
    : Promise<boolean> {
    return await (new HTTP({ useBearer: true })).tryDelete("/tags/"+tagId)
  }

  /**
   * It empties the trash.
   * @returns A boolean value.
   */
  public static async emptyTrash()
    : Promise<boolean> {
    return await (new HTTP({ useBearer: true })).tryDelete("/tags/emptyTrash")
  }

  /**
   * It recovers a tag.
   * @param {number} tagId - The id of the tag you want to recover.
   * @returns A boolean value.
   */
  public static async recoverTag(tagId: number)
    : Promise<boolean> {
    return await (new HTTP({ useBearer: true })).tryPost("/tags/"+tagId+"/recover")
  }

  /**
   * Add new tag based on name, color and courseId, courseId can be null and then the tag will be global
   * @param {TagsStoreAddNewNamedArgs}  - TagsStoreAddNewNamedArgs
   * @returns A boolean
   */
  public static async addNew({name = "tag name", color = "#001100", courseId = null} :TagsStoreAddNewNamedArgs)
  : Promise<boolean> {
    return await (new HTTP({ useBearer: true })).tryPost("/tags", {
      name: name,
      color: color,
      partOfCourseId: courseId
    })
  }

  /**
   * It gets the students and their tags for a given course
   * @param {number} courseId - number
   * @returns StudentAndTags[]
   */
  public static async getStudentsTagsByCourse(courseId: number)
  : Promise<StudentAndTags[]> {
    let res: Ref<StudentAndTags[]> = ref()
    let isSuccess = await (new HTTP({ useBearer: true })).tryGet<StudentAndTags[]>("/courses/"+courseId+"/tagsAndStudents", res)

    return toRaw(res.value)
  }

}

export interface TagsStoreAddNewNamedArgs {
  name: string
  color: string
  courseId: number
}

export interface UpdateTagsAddNewNamedArgs {
  id: number
  name: string
  color: string
  courseId: number
}
