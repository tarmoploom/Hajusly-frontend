export interface PrivateMessage {
    id?: string;
    StudentId: number;
    TeacherId: number;
    courseId: number;
    Sent: Date;
    isRead?: boolean;
    Subject: string;
    Message: string;
    
}
