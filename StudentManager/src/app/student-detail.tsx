import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";

import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import { deleteStudent, getStudents } from "../services/storage";

import { Student } from "../types/Student";
import t from "../../i18n";

export default function StudentDetail() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const studentId = Array.isArray(id) ? id[0] : id;

  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!studentId) {
      setStudent(null);
      return;
    }

    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    const students = await getStudents();
    const found = students.find((item) => String(item.id) === String(studentId));
    setStudent(found || null);
  };

  const handleDelete = async () => {
    if (!student) return;

    const deleteStudentById = async () => {
      await deleteStudent(String(student.id));
      router.back();
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(t.confirmDelete || "Bạn có chắc chắn muốn xóa sinh viên này không?");

      if (!confirmed) return;

      await deleteStudentById();
      return;
    }

    Alert.alert(t.confirmDelete, "", [
      {
        text: t.no,
        style: "cancel",
      },
      {
        text: t.yes,
        style: "destructive",
        onPress: deleteStudentById,
      },
    ]);
  };

  if (!student) {
    return (
      <View style={styles.center}>
        <Text>Student not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: student.avatar,
        }}
        style={styles.avatar}
      />

      <Text style={styles.name}>{student.name}</Text>

      <View style={styles.info}>
        <Text style={styles.label}>{t.studentId}</Text>

        <Text style={styles.value}>{student.studentId}</Text>

        <Text style={styles.label}>{t.email}</Text>

        <Text style={styles.value}>{student.email}</Text>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: "/student-form",
            params: {
              id: student.id,
            },
          })
        }
      >
        <Text style={styles.buttonText}>{t.edit}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.buttonText}>{t.delete}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    alignItems: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },

  name: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 30,
  },

  info: {
    width: "100%",
  },

  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 15,
  },

  value: {
    fontSize: 17,
    marginTop: 5,
  },

  editButton: {
    width: "100%",
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },

  deleteButton: {
    width: "100%",
    backgroundColor: "#dc2626",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
