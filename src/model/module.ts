export interface Module {
    id: number;
    name: string;
    abbreviation?: string;
    courseId: number;
    parentModuleId?: number;
    maxPoints?: number;
    deadline?: Date;
    children?: Module[] | undefined;
    passingPercent?: number;
}
