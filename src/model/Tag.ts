export interface Tag {
  id: number
  name: string
  color: string
  trashed?: boolean
  partOfCourseId?: number

  // just for ui
  isGlobalTag?: boolean
}
