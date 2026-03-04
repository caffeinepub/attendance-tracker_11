import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Employee {
    leavesUsed: bigint;
    name: string;
    employeeId: string;
    attendanceHistory: Array<AttendanceEntry>;
    leavesRemaining: bigint;
}
export interface AttendanceEntry {
    status: string;
    date: string;
}
export interface AddEmployeePayload {
    name: string;
    employeeId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEmployee(payload: AddEmployeePayload): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllEmployees(): Promise<Array<Employee>>;
    getAttendanceHistory(employeeId: string): Promise<Array<AttendanceEntry>>;
    getCallerEmployeeId(): Promise<string>;
    getCallerEmployeeName(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getEmployee(employeeId: string): Promise<Employee>;
    getMarkToday(employeeId: string, todayDate: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    markAttendance(employeeId: string, date: string, status: string): Promise<void>;
    overrideAttendance(employeeId: string, date: string, status: string): Promise<void>;
    registerEmployeeMapping(employeeId: string): Promise<void>;
    removeEmployee(employeeId: string): Promise<void>;
}
