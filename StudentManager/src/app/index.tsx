import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";

import StudentItem from "../components/StudentItem";
import { Student } from "../types/Student";
import { getStudents } from "../services/storage";
import t from "../../i18n";

export default function HomeScreen() {
  const [students, setStudents] = useState<Student[]>([]);

  const loadStudents = async () => {
    const data = await getStudents();
    setStudents(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.studentList}</Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudentItem
            student={item}
            onPress={() =>
              router.push({
                pathname: "/student-detail",
                params: {
                  id: item.id,
                },
              })
            }
          />
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
  },

  addText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
