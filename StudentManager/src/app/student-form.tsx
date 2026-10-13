import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import * as ImagePicker from "expo-image-picker";

import { addStudent, getStudents, updateStudent } from "../services/storage";

import { Student } from "../types/Student";
import t from "../../i18n";

export default function StudentForm() {
  // ==============================
  // LẤY ID TỪ URL
  // ==============================

  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const studentIdParam = id ? String(id) : "";

  // Có ID = đang sửa
  // Không có ID = thêm mới
  const isEdit = studentIdParam !== "";

  // ==============================
  // STATE
  // ==============================

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  // ==============================
  // LOAD SINH VIÊN KHI SỬA
  // ==============================

  useEffect(() => {
    if (isEdit) {
      loadStudent();
    }
  }, [studentIdParam]);

  const loadStudent = async () => {
    try {
      console.log("Đang tìm sinh viên có ID:", studentIdParam);

      const students = await getStudents();

      console.log("Danh sách sinh viên:", students);

      const student = students.find(
        (item) => String(item.id) === studentIdParam,
      );

      if (!student) {
        console.log("Không tìm thấy sinh viên:", studentIdParam);

        Alert.alert("Lỗi", "Không tìm thấy sinh viên");

        return;
      }

      console.log("Đã tìm thấy sinh viên:", student);

      setName(student.name);
      setStudentId(student.studentId);
      setEmail(student.email);
      setAvatar(student.avatar || "");
    } catch (error) {
      console.error("Lỗi tải sinh viên:", error);

      Alert.alert("Lỗi", "Không thể tải thông tin sinh viên");
    }
  };

  // ==============================
  // CHỌN ẢNH
  // ==============================

  const chooseImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Quyền truy cập", "Cần quyền truy cập thư viện ảnh");

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Lỗi chọn ảnh:", error);

      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  // ==============================
  // LƯU
  // ==============================

  const save = async () => {
    console.log("====================");
    console.log("BẮT ĐẦU LƯU");
    console.log("ID:", studentIdParam);
    console.log("isEdit:", isEdit);
    console.log("Tên:", name);
    console.log("MSSV:", studentId);
    console.log("Email:", email);
    console.log("====================");

    // Kiểm tra dữ liệu
    if (!name.trim() || !studentId.trim() || !email.trim()) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ họ tên, mã sinh viên và email",
      );

      return;
    }

    try {
      // ==============================
      // TRƯỜNG HỢP SỬA
      // ==============================

      if (isEdit) {
        const updatedStudent: Student = {
          id: studentIdParam,
          name: name.trim(),
          studentId: studentId.trim(),
          email: email.trim(),
          avatar: avatar,
        };

        console.log("Sinh viên chuẩn bị cập nhật:", updatedStudent);

        Alert.alert("Xác nhận", "Bạn có muốn lưu thay đổi không?", [
          {
            text: "Không",
            style: "cancel",
          },
          {
            text: "Có",
            onPress: async () => {
              try {
                console.log("Đang gọi updateStudent...");

                await updateStudent(updatedStudent);

                console.log("CẬP NHẬT THÀNH CÔNG");

                Alert.alert("Thành công", "Đã cập nhật thông tin sinh viên", [
                  {
                    text: "OK",
                    onPress: () => {
                      router.back();
                    },
                  },
                ]);
              } catch (error) {
                console.error("LỖI CẬP NHẬT:", error);

                Alert.alert("Lỗi", "Không thể cập nhật sinh viên");
              }
            },
          },
        ]);

        return;
      }

      // ==============================
      // TRƯỜNG HỢP THÊM MỚI
      // ==============================

      const newStudent: Student = {
        id: Date.now().toString(),
        name: name.trim(),
        studentId: studentId.trim(),
        email: email.trim(),
        avatar: avatar,
      };

      console.log("Sinh viên mới:", newStudent);

      await addStudent(newStudent);

      console.log("THÊM SINH VIÊN THÀNH CÔNG");

      Alert.alert("Thành công", "Đã thêm sinh viên", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("LỖI KHI LƯU:", error);

      Alert.alert("Lỗi", "Không thể lưu sinh viên");
    }
  };

  // ==============================
  // GIAO DIỆN
  // ==============================

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* TIÊU ĐỀ */}

      <Text style={styles.title}>{isEdit ? t.editStudent : t.addStudent}</Text>

      {/* ẢNH ĐẠI DIỆN */}

      <TouchableOpacity onPress={chooseImage} style={styles.avatarContainer}>
        {avatar ? (
          <Image
            source={{
              uri: avatar,
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text>{t.chooseImage}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* HỌ TÊN */}

      <Text style={styles.label}>{t.name}</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t.enterName}
        style={styles.input}
      />

      {/* MÃ SINH VIÊN */}

      <Text style={styles.label}>{t.studentId}</Text>

      <TextInput
        value={studentId}
        onChangeText={setStudentId}
        placeholder={t.enterStudentId}
        style={styles.input}
      />

      {/* EMAIL */}

      <Text style={styles.label}>{t.email}</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={t.enterEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {/* NÚT LƯU */}

      <TouchableOpacity
        style={styles.button}
        onPress={save}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{t.save}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==============================
// STYLE
// ==============================

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
  },

  avatarContainer: {
    alignSelf: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
