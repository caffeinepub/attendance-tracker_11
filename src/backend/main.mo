import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Include authorization system and state.
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Employee = {
    name : Text;
    employeeId : Text;
    leavesUsed : Nat;
    leavesRemaining : Nat;
    attendanceHistory : [AttendanceEntry];
  };

  module Employee {
    public func compareByEmployeeId(e1 : Employee, e2 : Employee) : Order.Order {
      Text.compare(e1.employeeId, e2.employeeId);
    };
  };

  type AttendanceEntry = {
    date : Text;
    status : Text; // "Present" or "Absent"
  };

  type AddEmployeePayload = {
    name : Text;
    employeeId : Text;
  };

  let employeesMap = Map.empty<Text, Employee>();

  let principalToEmployeeId = Map.empty<Principal, Text>();

  public shared ({ caller }) func addEmployee(payload : AddEmployeePayload) : async () {
    if (employeesMap.containsKey(payload.employeeId)) {
      Runtime.trap("Employee with this ID already exists");
    };

    let newEmployee : Employee = {
      name = payload.name;
      employeeId = payload.employeeId;
      leavesUsed = 0;
      leavesRemaining = 15;
      attendanceHistory = [];
    };

    employeesMap.add(payload.employeeId, newEmployee);
  };

  public shared ({ caller }) func removeEmployee(employeeId : Text) : async () {
    if (not employeesMap.containsKey(employeeId)) {
      Runtime.trap("Employee not found");
    };

    employeesMap.remove(employeeId);
  };

  public shared ({ caller }) func markAttendance(employeeId : Text, date : Text, status : Text) : async () {
    if (not employeesMap.containsKey(employeeId)) {
      Runtime.trap("Employee not found");
    };

    let employee = switch (employeesMap.get(employeeId)) {
      case (?emp) { emp };
      case (null) { Runtime.trap("Employee record not found") };
    };

    let normalizedStatus = if (status == "Present" or status == "present") {
      "Present";
    } else if (status == "Absent" or status == "absent") {
      "Absent";
    } else {
      Runtime.trap("Invalid status. Use 'Present' or 'Absent'");
    };

    let entry : AttendanceEntry = {
      date;
      status = normalizedStatus;
    };

    let existingEntries = employee.attendanceHistory.filter(
      func(e) { e.date != date }
    );

    if (normalizedStatus == "Absent") {
      if (employee.leavesUsed >= 15) {
        Runtime.trap("No remaining leave balance");
      };
      let updatedEmployee : Employee = {
        employee with
        attendanceHistory = existingEntries.concat([entry]);
        leavesUsed = employee.leavesUsed + 1;
        leavesRemaining = employee.leavesRemaining - 1;
      };
      employeesMap.add(employeeId, updatedEmployee);
    } else {
      let updatedEmployee : Employee = {
        employee with
        attendanceHistory = existingEntries.concat([entry]);
      };
      employeesMap.add(employeeId, updatedEmployee);
    };
  };

  public shared ({ caller }) func overrideAttendance(employeeId : Text, date : Text, status : Text) : async () {
    if (not employeesMap.containsKey(employeeId)) {
      Runtime.trap("Employee not found");
    };

    let employee = switch (employeesMap.get(employeeId)) {
      case (?emp) { emp };
      case (null) { Runtime.trap("Employee record not found") };
    };

    let normalizedStatus = if (status == "Present" or status == "present") {
      "Present";
    } else if (status == "Absent" or status == "absent") {
      "Absent";
    } else {
      Runtime.trap("Invalid status. Use 'Present' or 'Absent'");
    };

    let entry : AttendanceEntry = {
      date;
      status = normalizedStatus;
    };

    let withoutDate = employee.attendanceHistory.filter(
      func(e) { e.date != date }
    );

    let newHistory = withoutDate.concat([entry]);

    let leavesUsed = newHistory.filter(
      func(e) { e.status == "Absent" }
    ).size();

    let updatedEmployee : Employee = {
      employee with
      attendanceHistory = newHistory;
      leavesUsed;
      leavesRemaining = if (leavesUsed <= 15) {
        15 - leavesUsed;
      } else { 0 };
    };

    employeesMap.add(employeeId, updatedEmployee);
  };

  public query ({ caller }) func getAllEmployees() : async [Employee] {
    employeesMap.values().toArray().sort(Employee.compareByEmployeeId);
  };

  public query ({ caller }) func getEmployee(employeeId : Text) : async Employee {
    switch (employeesMap.get(employeeId)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?employee) { employee };
    };
  };

  public shared ({ caller }) func getMarkToday(employeeId : Text, todayDate : Text) : async Bool {
    switch (employeesMap.get(employeeId)) {
      case (null) { false };
      case (?employee) {
        switch (employee.attendanceHistory.find(func(e) { e.date == todayDate })) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  public query ({ caller }) func getAttendanceHistory(employeeId : Text) : async [AttendanceEntry] {
    switch (employeesMap.get(employeeId)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?employee) { employee.attendanceHistory };
    };
  };

  // Function to register the mapping between the caller's Principal and their employee ID
  public shared ({ caller }) func registerEmployeeMapping(employeeId : Text) : async () {
    principalToEmployeeId.add(caller, employeeId);
  };

  // Function to get the employee ID associated with the caller's Principal
  public query ({ caller }) func getCallerEmployeeId() : async Text {
    switch (principalToEmployeeId.get(caller)) {
      case (null) { Runtime.trap("No employee linked to this Principal") };
      case (?employeeId) { employeeId };
    };
  };

  // Function to get the name of the employee associated with the caller's Principal
  public query ({ caller }) func getCallerEmployeeName() : async Text {
    let employeeId = switch (principalToEmployeeId.get(caller)) {
      case (null) { Runtime.trap("No employee linked to this Principal") };
      case (?id) { id };
    };
    let employee = switch (employeesMap.get(employeeId)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?emp) { emp };
    };
    employee.name;
  };
};
