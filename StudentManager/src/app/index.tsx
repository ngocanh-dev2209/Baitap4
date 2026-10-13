import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";

import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";

import StudentItem from "../components/StudentItem";
import { Student } from "../types/Student";
import { getStudents, deleteStudent } from "../services/storage";
import t from "../../i18n";

export default function HomeScreen() {
  const [students, setStudents] = useState<Student[]>([]);

  // Tải danh sách sinh viên
  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error("Lỗi tải danh sách sinh viên:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, []),
  );

  // Thực hiện xóa sinh viên
  const removeStudent = async (id: string) => {
    try {
      await deleteStudent(id);
      await loadStudents();

      if (Platform.OS === "web") {
        window.alert("Đã xóa sinh viên thành công!");
      } else {
        Alert.alert("Thành công", "Đã xóa sinh viên thành công!");
      }
    } catch (error) {
      console.error("Lỗi xóa sinh viên:", error);

      if (Platform.OS === "web") {
        window.alert("Không thể xóa sinh viên. Vui lòng thử lại!");
      } else {
        Alert.alert("Lỗi", "Không thể xóa sinh viên. Vui lòng thử lại!");
      }
    }
  };

  // Xác nhận trước khi xóa
  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn xóa sinh viên này không?",
      );

      if (confirmed) {
        removeStudent(id);
      }

      return;
    }

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa sinh viên này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => removeStudent(id),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.studentList}</Text>

      <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.studentRow}>
            <View style={styles.studentInfo}>
              <StudentItem
                student={item}
                onPress={() =>
                  router.push({
                    pathname: "/student-detail",
                    params: { id: String(item.id) },
                  })
                }
              />
            </View>

          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t.noStudents}</Text>}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/student-form" as any)}
      >
        <Text style={styles.addText}>+ {t.addStudent}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  studentInfo: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#777",
  },
  addButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  addText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
