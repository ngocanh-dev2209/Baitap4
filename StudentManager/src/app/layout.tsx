import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="student-detail"
        options={{
          title: "Student Detail",
        }}
      />

      <Stack.Screen
        name="student-form"
        options={{
          title: "Student",
        }}
      />
    </Stack>
  );
}
