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
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

// ── Sub-components ────────────────────────────────────────────────

const ProfileAvatar = ({ name, email }) => {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "T";

  return (
    <View style={styles.avatarCard}>
      <View style={styles.avatarHeaderBg} />
      <View style={styles.avatarContent}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Icon name="check" size={12} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.avatarName}>{name || "Tutor Profile"}</Text>
        {email ? <Text style={styles.avatarEmail}>{email}</Text> : null}

        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <Icon name="verified-user" size={13} color={colors.primary || "#4F46E5"} />
            <Text style={styles.roleBadgeText}>Verified Tutor</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const InfoCard = ({ title, icon, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardIconWrap}>
        <Icon name={icon} size={18} color={colors.primary || "#4F46E5"} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.cardBody}>{children}</View>
  </View>
);

const ProfileField = ({ label, value, icon, isLast }) => (
  <View style={[styles.field, isLast && styles.fieldLast]}>
    <View style={styles.fieldIconWrap}>
      <Icon name={icon} size={18} color={colors.primary || "#4F46E5"} />
    </View>
    <View style={styles.fieldTextGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || "Not Specified"}</Text>
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
      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(`${BASE_URL}/Tutor/my-profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

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
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
        <Text style={styles.loadingText}>Loading profile details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerLogoWrap}>
            <Icon name="school" size={16} color="#FFFFFF" />
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
        {/* AVATAR HERO CARD */}
        <ProfileAvatar name={profile?.full_name} email={profile?.email} />

        {/* PERSONAL INFO CARD */}
        <InfoCard title="Personal Information" icon="badge">
          <ProfileField
            label="Full Name"
            value={profile?.full_name}
            icon="person"
          />
          <ProfileField
            label="E-mail Address"
            value={profile?.email}
            icon="email"
          />
          <ProfileField
            label="Contact Number"
            value={profile?.phone}
            icon="phone"
          />
          <ProfileField
            label="CNIC / ID Number"
            value={profile?.cnic}
            icon="credit-card"
            isLast
          />
        </InfoCard>

        {/* PROFESSIONAL INFO CARD */}
        <InfoCard title="Professional Details" icon="workspace-premium">
          <ProfileField
            label="Highest Qualification"
            value={profile?.qualification}
            icon="school"
          />
          <ProfileField
            label="Teaching Experience"
            value={
              profile?.experience ? `${profile.experience} Years` : null
            }
            icon="work"
          />
          <ProfileField
            label="Service Radius"
            value={profile?.radius ? `${profile.radius} KM` : null}
            icon="place"
            isLast
          />
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
    backgroundColor: "#F8FAFC",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  /* HEADER */
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogoWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary || "#4F46E5",
    alignItems: "center",
    justifyscontent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    letterSpacing: -0.2,
  },

  /* CONTENT */
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },

  /* AVATAR HERO CARD */
  avatarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarHeaderBg: {
    height: 60,
    backgroundColor: (colors.primary || "#4F46E5") + "12",
  },
  avatarContent: {
    alignItems: "center",
    marginTop: -36,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary || "#4F46E5",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifycontent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#10B981",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifycontent: "center",
  },
  avatarName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  avatarEmail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  badgeRow: {
    marginTop: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: (colors.primary || "#4F46E5") + "12",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: (colors.primary || "#4F46E5") + "25",
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
  },

  /* CARD */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: (colors.primary || "#4F46E5") + "15",
    alignItems: "center",
    justifycontent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardBody: {
    paddingHorizontal: 16,
  },

  /* FIELD */
  field: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  fieldLast: {
    borderBottomWidth: 0,
  },
  fieldIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifycontent: "center",
    marginRight: 12,
  },
  fieldTextGroup: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
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
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// // ── Sub-components ────────────────────────────────────────────────

// const ProfileAvatar = ({ name }) => {
//   const initials = name
//     ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
//     : "T";
//   return (
//     <View style={styles.avatarSection}>
//       <View style={styles.avatarCircle}>
//         <Text style={styles.avatarInitials}>{initials}</Text>
//       </View>
//       <Text style={styles.avatarName}>{name || "Tutor"}</Text>
//       <View style={styles.avatarBadge}>
//         <Text style={styles.avatarBadgeText}>Tutor</Text>
//       </View>
//     </View>
//   );
// };

// const InfoCard = ({ title, icon, children }) => (
//   <View style={styles.card}>
//     <View style={styles.cardHeader}>
//       <Icon name={icon} size={18} color={colors.primary} />
//       <Text style={styles.cardTitle}>{title}</Text>
//     </View>
//     {children}
//   </View>
// );

// const ProfileField = ({ label, value, icon }) => (
//   <View style={styles.field}>
//     <Text style={styles.fieldLabel}>{label}</Text>
//     <View style={styles.fieldRow}>
//       <Icon name={icon} size={16} color={colors.primary} style={styles.fieldIcon} />
//       <Text style={styles.fieldValue}>{value || "N/A"}</Text>
//     </View>
//   </View>
// );

// // ── Main Screen ───────────────────────────────────────────────────

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
//       if (!token) { Alert.alert("Error", "User not logged in"); return; }

//       const response = await fetch(`${BASE_URL}/Tutor/my-profile`, {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const text = await response.text();
//       let data = {};
//       try { data = text ? JSON.parse(text) : {}; } catch {}

//       if (response.ok) {
//         setProfile(data);
//       } else {
//         Alert.alert("Error", data.message || "Failed to load profile");
//       }
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={20} color={colors.primary} />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <View style={styles.headerLogoWrap}>
//             <Icon name="school" size={15} color="#fff" />
//           </View>
//           <Text style={styles.headerTitle}>House of Tutor</Text>
//         </View>

//         <View style={{ width: 36 }} />
//       </View>

//       {/* CONTENT */}
//       <ScrollView
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* AVATAR */}
//         <ProfileAvatar name={profile?.full_name} />

//         {/* PERSONAL INFO CARD */}
//         <InfoCard title="Personal information" icon="badge">
//           <ProfileField label="Full name"       value={profile?.full_name} icon="person"       />
//           <ProfileField label="E-mail"          value={profile?.email}     icon="email"        />
//           <ProfileField label="Contact number"  value={profile?.phone}     icon="phone"        />
//           <ProfileField label="CNIC"            value={profile?.cnic}      icon="credit-card"  />
//         </InfoCard>

//         {/* PROFESSIONAL INFO CARD */}
//         <InfoCard title="Professional details" icon="school">
//           <ProfileField label="Qualification"  value={profile?.qualification} icon="workspace-premium" />
//           <ProfileField label="Experience"     value={profile?.experience}    icon="work"              />
//           <ProfileField label="Radius (KM)"    value={profile?.radius}        icon="place"             />
//         </InfoCard>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default TutorProfile;

// // ── Styles ────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F4FB",
//   },

//   // HEADER
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#E0DEF5",
//   },
//   backBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#F5F4FB",
//     borderWidth: 0.5,
//     borderColor: "#E0DEF5",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerCenter: {
//     alignItems: "center",
//     gap: 3,
//   },
//   headerLogoWrap: {
//     width: 26,
//     height: 26,
//     borderRadius: 6,
//     backgroundColor: colors.primary,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerTitle: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   // CONTENT
//   content: {
//     padding: 16,
//     paddingBottom: 40,
//     gap: 14,
//   },

//   // AVATAR
//   avatarSection: {
//     alignItems: "center",
//     paddingVertical: 20,
//     gap: 8,
//   },
//   avatarCircle: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: "#EEEDFE",
//     borderWidth: 2.5,
//     borderColor: colors.primary,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   avatarInitials: {
//     fontSize: 26,
//     fontWeight: "600",
//     color: colors.primary,
//   },
//   avatarName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1A1A2E",
//   },
//   avatarBadge: {
//     backgroundColor: "#EEEDFE",
//     paddingHorizontal: 12,
//     paddingVertical: 3,
//     borderRadius: 20,
//   },
//   avatarBadgeText: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: colors.primary,
//   },

//   // CARD
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     borderWidth: 0.5,
//     borderColor: "#E8E6F4",
//     overflow: "hidden",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#E8E6F4",
//   },
//   cardTitle: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   // FIELD
//   field: {
//     paddingHorizontal: 16,
//     paddingVertical: 11,
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#F0EEF9",
//     gap: 3,
//   },
//   fieldLabel: {
//     fontSize: 11,
//     fontWeight: "500",
//     color: "#9896B0",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   fieldRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 7,
//   },
//   fieldIcon: {
//     opacity: 0.65,
//   },
//   fieldValue: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#1A1A2E",
//   },
// });


















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
