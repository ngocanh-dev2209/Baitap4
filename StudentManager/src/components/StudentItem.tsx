import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

import { Student } from "../types/Student";

interface Props {
  student: Student;
  onPress: () => void;
}

export default function StudentItem({ student, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{
          uri: student.avatar || "https://via.placeholder.com/100",
        }}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.name}>{student.name}</Text>

        <Text>MSSV: {student.studentId}</Text>

        <Text>{student.email}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 12,

    elevation: 3,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    marginRight: 15,
  },

  info: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
