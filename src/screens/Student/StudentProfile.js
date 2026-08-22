import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const PRIMARY_COLOR = colors.primary || "#2563EB";

const StudentProfile = ({ navigation }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(`${BASE_URL}/Student/my-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log("RAW PROFILE RESPONSE:", text);

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.log("JSON Parse Error:", e);
      }

      if (response.ok) {
        setStudentData(data);
      } else {
        Alert.alert("Error", data.message || "Failed to load profile");
      }
    } catch (error) {
      console.log("Profile Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back-ios-new" size={18} color="#1E293B" />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.placeholderWidth} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Avatar & Hero Header */}
        <View style={styles.profileHero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Icon name="person" size={48} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.name}>
            {studentData?.full_name || "Student Name"}
          </Text>

          <View style={styles.badge}>
            <Icon name="verified" size={14} color={PRIMARY_COLOR} />
            <Text style={styles.badgeText}>Student Account</Text>
          </View>
        </View>

        {/* Detailed Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>PERSONAL INFORMATION</Text>

          <ProfileItem
            icon="person-outline"
            label="Full Name"
            value={studentData?.full_name}
          />
          <ProfileItem
            icon="mail-outline"
            label="Email Address"
            value={studentData?.email}
          />
          <ProfileItem
            icon="badge"
            label="CNIC Number"
            value={studentData?.cnic}
          />
          <ProfileItem
            icon="phone"
            label="Contact Number"
            value={studentData?.phone}
          />
          <ProfileItem
            icon="location-on"
            label="Primary Location"
            value={studentData?.location}
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentProfile;

/* ---------- Reusable Profile Item Component ---------- */
const ProfileItem = ({ icon, label, value, isLast = false }) => (
  <View style={[styles.itemContainer, !isLast && styles.itemBorder]}>
    <View style={styles.iconBox}>
      <Icon name={icon} size={20} color={PRIMARY_COLOR} />
    </View>
    <View style={styles.itemTextContainer}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={[styles.itemValue, !value && styles.emptyValue]}>
        {value || "Not provided"}
      </Text>
    </View>
  </View>
);

/* ---------- Stylesheet ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 110,
    height: 38,
  },
  placeholderWidth: {
    width: 38,
  },

  // PROFILE HERO
  profileHero: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
    letterSpacing: -0.3,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY_COLOR,
    marginLeft: 4,
  },

  // CARD & ITEMS
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  itemValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
    marginTop: 2,
  },
  emptyValue: {
    color: "#94A3B8",
    fontWeight: "400",
    fontStyle: "italic",
  },
});




























// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Image,
//   StatusBar,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const StudentProfile = ({ navigation }) => {
//   const [studentData, setStudentData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchStudentProfile();
//   }, []);

//   const fetchStudentProfile = async () => {
//   try {
//     setLoading(true);

//     const token = await AsyncStorage.getItem("token");

//     if (!token) {
//       Alert.alert("Error", "User not logged in");
//       return;
//     }

//     const response = await fetch(`${BASE_URL}/Student/my-profile`, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const text = await response.text();
//     console.log("RAW PROFILE RESPONSE:", text);

//     let data = {};
//     try {
//       data = text ? JSON.parse(text) : {};
//     } catch (e) {
//       console.log("JSON Parse Error:", e);
//     }

//     if (response.ok) {
//       setStudentData(data);
//     } else {
//       Alert.alert("Error", data.message || "Failed to load profile");
//     }

//   } catch (error) {
//     console.log("Profile Error:", error);
//     Alert.alert("Error", error.message);
//   } finally {
//     setLoading(false);
//   }
// };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color={colors.primary} />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color={colors.primary} />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={{ width: 26 }} />
//       </View>

//       {/* Profile Section */}
//       <View style={styles.profileContainer}>
//         <View style={styles.avatar}>
//           <Icon name="person" size={40} color="#fff" />
//         </View>

//         <Text style={styles.name}>{studentData?.full_name}</Text>
//         <Text style={styles.subText}>Student Profile</Text>
//       </View>

//       {/* Info Card */}
//       <View style={styles.card}>
//         <ProfileItem label="Full Name" value={studentData?.full_name} />
//         <ProfileItem label="E-Mail" value={studentData?.email} />
//         <ProfileItem label="CNIC" value={studentData?.cnic} />
//         <ProfileItem label="Contact Number" value={studentData?.phone} />
//         <ProfileItem label="Location" value={studentData?.location} />
//       </View>
//     </SafeAreaView>
//   );
// };

// export default StudentProfile;

// /* ---------- Reusable Item ---------- */
// const ProfileItem = ({ label, value }) => (
//   <View style={styles.inputGroup}>
//     <Text style={styles.label}>{label}</Text>
//     <View style={styles.inputBox}>
//       <Text style={styles.inputText}>{value || "N/A"}</Text>
//     </View>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EDE7F6",
//     paddingHorizontal: 16,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#EDE7F6",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 35,
//   },
//   logo: {
//     width: 120,
//     height: 45,
//   },
//   profileContainer: {
//     alignItems: "center",
//     marginTop: 20,
//   },
//   avatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: colors.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   name: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#000",
//   },
//   subText: {
//     fontSize: 13,
//     color: "#666",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     marginTop: 20,
//     elevation: 4,
//   },
//   inputGroup: {
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: 13,
//     color: "#666",
//     marginBottom: 4,
//   },
//   inputBox: {
//     backgroundColor: "#F5F5F5",
//     borderRadius: 10,
//     padding: 12,
//   },
//   inputText: {
//     fontSize: 15,
//     color: colors.primary,
//     fontWeight: "500",
//   },
// });