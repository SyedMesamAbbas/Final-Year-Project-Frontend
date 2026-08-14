import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import colors from "../utils/colors";

const RoleScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState("student");

  const handleStudentPress = () => {
    setSelectedRole("student");
    navigation.navigate("StudentSignup");
  };

  const handleTeacherPress = () => {
    setSelectedRole("tutor");
    navigation.navigate("TeacherSignup");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
        />

        <TouchableOpacity
          style={[
            styles.card,
            selectedRole === "student" && styles.cardSelected,
          ]}
          onPress={handleStudentPress}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.radio,
                selectedRole === "student" && styles.radioSelected,
              ]}
            />
            <Text style={styles.cardTitle}>🎓 I am a Student</Text>
          </View>

          <Text style={styles.description}>
            I am here to enhance my learning experience by connecting with qualified tutors.
            I want to book sessions, track my progress, and improve my academic performance.
            I am committed to learning in a structured and supportive environment.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            selectedRole === "tutor" && styles.cardSelected,
          ]}
          onPress={handleTeacherPress}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.radio,
                selectedRole === "tutor" && styles.radioSelected,
              ]}
            />
            <Text style={styles.cardTitle}>👨‍🏫 I am a Teacher</Text>
          </View>

          <Text style={styles.description}>
            I am here to share my knowledge and help students achieve academic success.
            I want to manage my teaching schedule, conduct sessions, and monitor student progress.
            I am dedicated to providing quality education through structured and engaging lessons.
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default RoleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    padding: 16,
  },

  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginVertical: 20,
    resizeMode: "contain",
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 10,
  },

  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});


















// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   SafeAreaView,
//   ScrollView,
// } from "react-native";
// import colors from "../utils/colors";

// const RoleScreen = ({ navigation }) => {
//   const [selectedRole, setSelectedRole] = useState("student");

//   const handleStudentPress = () => {
//     setSelectedRole("student");
//     navigation.navigate("StudentSignup");
//   };

//   const handleTeacherPress = () => {
//     setSelectedRole("tutor");
//     navigation.navigate("TeacherSignup");
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.inner}>
        
//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//         />

//         <TouchableOpacity
//           style={[
//             styles.card,
//             selectedRole === "student" && styles.cardSelected,
//           ]}
//           onPress={handleStudentPress}
//           activeOpacity={0.8}
//         >
//           <View style={styles.cardHeader}>
//             <View
//               style={[
//                 styles.radio,
//                 selectedRole === "student" && styles.radioSelected,
//               ]}
//             />
//             <Text style={styles.cardTitle}>🎓 I am a Student</Text>
//           </View>

//           <Text style={styles.description}>
//             I am here to enhance my learning experience by connecting with qualified tutors.
//             I want to book sessions, track my progress, and improve my academic performance.
//             I am committed to learning in a structured and supportive environment.
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.card,
//             selectedRole === "tutor" && styles.cardSelected,
//           ]}
//           onPress={handleTeacherPress}
//           activeOpacity={0.8}
//         >
//           <View style={styles.cardHeader}>
//             <View
//               style={[
//                 styles.radio,
//                 selectedRole === "tutor" && styles.radioSelected,
//               ]}
//             />
//             <Text style={styles.cardTitle}>👨‍🏫 I am a Teacher</Text>
//           </View>

//           <Text style={styles.description}>
//             I am here to share my knowledge and help students achieve academic success.
//             I want to manage my teaching schedule, conduct sessions, and monitor student progress.
//             I am dedicated to providing quality education through structured and engaging lessons.
//           </Text>
//         </TouchableOpacity>

//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default RoleScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background || "#EDEAF0",
//   },
//   inner: {
//     padding: 16,
//   },

//   logo: {
//     width: 120,
//     height: 120,
//     alignSelf: "center",
//     marginVertical: 20,
//     resizeMode: "contain",
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//     elevation: 4,
//   },
//   cardSelected: {
//     borderWidth: 2,
//     borderColor: colors.primary,
//   },

//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   radio: {
//     width: 22,
//     height: 22,
//     borderRadius: 11,
//     borderWidth: 2,
//     borderColor: "#999",
//     marginRight: 10,
//   },

//   radioSelected: {
//     borderColor: colors.primary,
//     backgroundColor: colors.primary,
//   },

//   cardTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#000",
//   },

//   description: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//   },
// });