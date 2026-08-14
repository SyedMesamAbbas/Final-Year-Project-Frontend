import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

// ── Sub-components ────────────────────────────────────────────────

const ProfileAvatar = ({ name }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "T";
  return (
    <View style={styles.avatarSection}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitials}>{initials}</Text>
      </View>
      <Text style={styles.avatarName}>{name || "Tutor"}</Text>
      <View style={styles.avatarBadge}>
        <Text style={styles.avatarBadgeText}>Tutor</Text>
      </View>
    </View>
  );
};

const InfoCard = ({ title, icon, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Icon name={icon} size={18} color={colors.primary} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const ProfileField = ({ label, value, icon }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.fieldRow}>
      <Icon name={icon} size={16} color={colors.primary} style={styles.fieldIcon} />
      <Text style={styles.fieldValue}>{value || "N/A"}</Text>
    </View>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────

const TutorProfile = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) { Alert.alert("Error", "User not logged in"); return; }

      const response = await fetch(`${BASE_URL}/Tutor/my-profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}

      if (response.ok) {
        setProfile(data);
      } else {
        Alert.alert("Error", data.message || "Failed to load profile");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerLogoWrap}>
            <Icon name="school" size={15} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>House of Tutor</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR */}
        <ProfileAvatar name={profile?.full_name} />

        {/* PERSONAL INFO CARD */}
        <InfoCard title="Personal information" icon="badge">
          <ProfileField label="Full name"       value={profile?.full_name} icon="person"       />
          <ProfileField label="E-mail"          value={profile?.email}     icon="email"        />
          <ProfileField label="Contact number"  value={profile?.phone}     icon="phone"        />
          <ProfileField label="CNIC"            value={profile?.cnic}      icon="credit-card"  />
        </InfoCard>

        {/* PROFESSIONAL INFO CARD */}
        <InfoCard title="Professional details" icon="school">
          <ProfileField label="Qualification"  value={profile?.qualification} icon="workspace-premium" />
          <ProfileField label="Experience"     value={profile?.experience}    icon="work"              />
          <ProfileField label="Radius (KM)"    value={profile?.radius}        icon="place"             />
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TutorProfile;

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F4FB",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0DEF5",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F4FB",
    borderWidth: 0.5,
    borderColor: "#E0DEF5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
    gap: 3,
  },
  headerLogoWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  // CONTENT
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },

  // AVATAR
  avatarSection: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EEEDFE",
    borderWidth: 2.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.primary,
  },
  avatarName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  avatarBadge: {
    backgroundColor: "#EEEDFE",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
  },
  avatarBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
  },

  // CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#E8E6F4",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8E6F4",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  // FIELD
  field: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0EEF9",
    gap: 3,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9896B0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  fieldIcon: {
    opacity: 0.65,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A2E",
  },
});


















// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const TutorProfile = ({ navigation }) => {

//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);

//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "User not logged in");
//         return;
//       }

//       const response = await fetch(`${BASE_URL}/Tutor/my-profile`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const text = await response.text();
//       console.log("PROFILE RESPONSE:", text);

//       let data = {};
//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch {}

//       if (response.ok) {
//         setProfile(data);
//       } else {
//         Alert.alert("Error", data.message || "Failed to load profile");
//       }

//     } catch (error) {
//       console.log("Profile Error:", error);
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const ProfileField = ({ label, value }) => (
//     <View style={styles.fieldContainer}>
//       <Text style={styles.label}>{label}</Text>
//       <View style={styles.inputBox}>
//         <Text style={styles.value}>{value || "N/A"}</Text>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImage}
//           />
//           <Text style={styles.logoText}>House of Tutor</Text>
//         </View>

//         <View style={{ width: 26 }} />
//       </View>

//       {/* CONTENT */}
//       <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Profile Information</Text>

//           <ProfileField label="Full Name" value={profile?.full_name} />
//           <ProfileField label="E-Mail" value={profile?.email} />
//           <ProfileField label="CNIC" value={profile?.cnic} />
//           <ProfileField label="Experience" value={profile?.experience} />
//           <ProfileField label="Contact Number" value={profile?.phone} />
//           <ProfileField label="Qualification" value={profile?.qualification} />
//           <ProfileField label="Radius (KM)" value={profile?.radius} />

//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default TutorProfile;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//   },

//   /* HEADER */
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     elevation: 2,
//   },

//   headerCenter: {
//     alignItems: "center",
//   },

//   logoImage: {
//     width: 28,
//     height: 28,
//   },

//   logoText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   /* CONTENT */
//   content: {
//     padding: 16,
//     paddingBottom: 80,
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 16,
//     elevation: 3,
//   },

//   cardTitle: {
//     fontSize: 15,
//     fontWeight: "600",
//     marginBottom: 12,
//     color: colors.primary,
//   },

//   fieldContainer: {
//     marginBottom: 14,
//   },

//   label: {
//     fontSize: 12,
//     color: "#777",
//     marginBottom: 4,
//   },

//   inputBox: {
//     backgroundColor: "#F1F3F6",
//     padding: 12,
//     borderRadius: 8,
//   },

//   value: {
//     fontSize: 14,
//     color: "#333",
//     fontWeight: "500",
//   },

//   /* NAV */
//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 8,
//     backgroundColor: "#fff",
//     borderTopWidth: 1,
//     borderColor: "#eee",
//   },

//   navItem: {
//     alignItems: "center",
//   },

//   activeTab: {
//     fontSize: 11,
//     color: colors.primary,
//     marginTop: 2,
//   },

//   inactiveTab: {
//     fontSize: 11,
//     color: "#999",
//     marginTop: 2,
//   },
// });
