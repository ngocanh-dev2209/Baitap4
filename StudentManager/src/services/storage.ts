import AsyncStorage from "@react-native-async-storage/async-storage";
import { Student } from "../types/Student";

const STUDENTS_KEY = "@students";

// Lấy danh sách sinh viên
export const getStudents = async (): Promise<Student[]> => {
  try {
    const data = await AsyncStorage.getItem(STUDENTS_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Lỗi đọc dữ liệu:", error);
    throw error;
  }
};

// Lưu toàn bộ danh sách sinh viên
export const saveStudents = async (students: Student[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(students));

    console.log("Đã lưu:", students);
  } catch (error) {
    console.error("Lỗi lưu dữ liệu:", error);
    throw error;
  }
};

// Thêm sinh viên
export const addStudent = async (student: Student): Promise<void> => {
  try {
    const students = await getStudents();

    students.push(student);

    await saveStudents(students);

    console.log("Đã thêm sinh viên:", student);
  } catch (error) {
    console.error("Lỗi thêm sinh viên:", error);
    throw error;
  }
};

// Sửa sinh viên
export const updateStudent = async (updatedStudent: Student): Promise<void> => {
  try {
    const students = await getStudents();

    const newStudents = students.map((student) =>
      student.id === updatedStudent.id ? updatedStudent : student,
    );

    await saveStudents(newStudents);

    console.log("Đã cập nhật sinh viên:", updatedStudent);
  } catch (error) {
    console.error("Lỗi cập nhật sinh viên:", error);
    throw error;
  }
};

// Xóa sinh viên
export const deleteStudent = async (studentId: string): Promise<void> => {
  try {
    const students = await getStudents();

    const newStudents = students.filter((student) => student.id !== studentId);

    await saveStudents(newStudents);

    console.log("Đã xóa sinh viên:", studentId);
  } catch (error) {
    console.error("Lỗi xóa sinh viên:", error);
    throw error;
  }
};
