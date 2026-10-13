import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";

import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { addStudent, getStudents, updateStudent } from "../services/storage";

import { Student } from "../types/Student";
import t from "../../i18n";

export default function StudentForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const studentIdParam = id ? String(id) : "";
  const isEdit = studentIdParam !== "";

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (isEdit) {
      loadStudent();
    }
  }, [studentIdParam]);

  // Hiển thị thông báo phù hợp trên web và điện thoại
  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Quay về danh sách sinh viên
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  // Đọc thông tin sinh viên khi chỉnh sửa
  const loadStudent = async () => {
    try {
      const students = await getStudents();

      const student = students.find(
        (item) => String(item.id) === studentIdParam,
      );

      if (!student) {
        showMessage("Lỗi", "Không tìm thấy sinh viên.");
        return;
      }

      setName(student.name);
      setStudentId(student.studentId);
      setEmail(student.email);
      setAvatar(student.avatar || "");
    } catch (error) {
      console.error("Lỗi tải sinh viên:", error);
      showMessage("Lỗi", "Không thể tải thông tin sinh viên.");
    }
  };

  // Chọn ảnh đại diện
  const chooseImage = async () => {
    try {
      if (Platform.OS === "web") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled) {
          setAvatar(result.assets[0].uri);
        }

        return;
      }

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showMessage(
          "Quyền truy cập",
          "Vui lòng cho phép truy cập thư viện ảnh.",
        );
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
      showMessage("Lỗi", "Không thể chọn ảnh.");
    }
  };

  // Xác nhận và thực hiện lưu
  const save = async () => {
    console.log("ĐÃ BẤM NÚT LƯU");

    const trimmedName = name.trim();
    const trimmedStudentId = studentId.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedStudentId || !trimmedEmail) {
      showMessage(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ họ tên, mã sinh viên và email.",
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      showMessage("Email không hợp lệ", "Vui lòng nhập đúng định dạng email.");
      return;
    }

    try {
      const students = await getStudents();

      // Kiểm tra MSSV trùng với sinh viên khác
      const duplicate = students.some(
        (item) =>
          item.studentId.trim().toLowerCase() ===
            trimmedStudentId.toLowerCase() &&
          String(item.id) !== studentIdParam,
      );

      if (duplicate) {
        showMessage("MSSV đã tồn tại", "Vui lòng nhập mã sinh viên khác.");
        return;
      }

      const student: Student = {
        id: isEdit ? studentIdParam : Date.now().toString(),
        name: trimmedName,
        studentId: trimmedStudentId,
        email: trimmedEmail,
        avatar,
      };

      // Trên web dùng confirm để xác nhận thao tác chỉnh sửa
      if (isEdit) {
        let confirmed = false;

        if (Platform.OS === "web") {
          confirmed = window.confirm(
            "Bạn có muốn lưu thay đổi thông tin sinh viên không?",
          );
        } else {
          confirmed = await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Xác nhận",
              "Bạn có muốn lưu thay đổi thông tin sinh viên không?",
              [
                {
                  text: "Không",
                  style: "cancel",
                  onPress: () => resolve(false),
                },
                {
                  text: "Có",
                  onPress: () => resolve(true),
                },
              ],
              { cancelable: true, onDismiss: () => resolve(false) },
            );
          });
        }

        if (!confirmed) return;

        await updateStudent(student);
        console.log("CẬP NHẬT SINH VIÊN THÀNH CÔNG");
        showMessage("Thành công", "Đã cập nhật thông tin sinh viên.");
      } else {
        await addStudent(student);
        console.log("THÊM SINH VIÊN THÀNH CÔNG");
        showMessage("Thành công", "Đã thêm sinh viên.");
      }

      goBack();
    } catch (error) {
      console.error("LỖI KHI LƯU SINH VIÊN:", error);
      showMessage(
        "Lỗi lưu dữ liệu",
        "Không thể lưu sinh viên. Vui lòng kiểm tra Console để xem lỗi.",
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEdit ? t.editStudent : t.addStudent}</Text>

      <TouchableOpacity onPress={chooseImage} style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholder}>
            <Text>{t.chooseImage}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>{t.name}</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t.enterName}
        style={styles.input}
      />

      <Text style={styles.label}>{t.studentId}</Text>
      <TextInput
        value={studentId}
        onChangeText={setStudentId}
        placeholder={t.enterStudentId}
        style={styles.input}
      />

      <Text style={styles.label}>{t.email}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={t.enterEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

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
