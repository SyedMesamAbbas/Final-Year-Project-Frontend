import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";

//==================================================
// Design System Tokens
//==================================================
const Theme = {
  primary: colors?.primary || "#4F46E5",
  surface: "#FFFFFF",
  background: "#F8FAFC",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  
  // Destructive Actions
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  dangerBorder: "#FCA5A5",

  // Header Elements
  headerBg: "#0F172A",
  headerText: "#FFFFFF",
  headerMuted: "#94A3B8",
};

// Main navigation items excluding logout
const primaryMenuItems = [
  { id: "1", title: "All Classes", icon: "class", screen: "AdminClasses", badge: null },
  { id: "2", title: "Block List", icon: "block", screen: "BlockList", badge: null },
  { id: "3", title: "Feedback", icon: "rate-review", screen: "Feedback", badge: null },
  { id: "4", title: "Blocked Student", icon: "person-off", screen: "AdminBlockedStudent", badge: null },
  // { id: "4", title: "Tutor Courses", icon: "book", screen: "AdminTutorCourses" },
];

const AdminDrawerScreen = ({ navigation }) => {
  const userName = "Admin Name";

  const handleNavigation = (screenName) => {
    navigation.navigate(screenName);
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of your admin account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => navigation.navigate("AuthStack"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.headerBg} />

      {/* Top App Header */}
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close Menu"
        >
          <Icon name="close" size={20} color={Theme.headerText} />
        </TouchableOpacity>
      </View>

      {/* Profile Header Card */}
      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.userCard}
          onPress={() => navigation.navigate("AdminProfile")}
          activeOpacity={0.8}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="admin-panel-settings" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.activeStatusDot} />
          </View>

          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>System Admin</Text>
              </View>
            </View>
            <View style={styles.viewProfileRow}>
              <Text style={styles.userSub}>View & Edit Profile</Text>
              <Icon name="chevron-right" size={14} color={Theme.headerMuted} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Navigation Scroll Area */}
      <ScrollView
        style={styles.menuScrollView}
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeader}>MAIN NAVIGATION</Text>

        {primaryMenuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleNavigation(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Icon name={item.icon} size={20} color={Theme.primary} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </View>

            <View style={styles.menuRight}>
              {item.badge && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Icon name="chevron-right" size={18} color={Theme.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fixed Footer with Destructive Logout Option */}
      <View style={styles.footerContainer}>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIconBox}>
            <Icon name="logout" size={20} color={Theme.danger} />
          </View>
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AdminDrawerScreen;

//====================================================
// STYLESHEET
//====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 16,
    backgroundColor: Theme.headerBg,
  },
  logo: {
    width: 110,
    height: 38,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Profile Header */
  profileSection: {
    backgroundColor: Theme.headerBg,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  activeStatusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: Theme.headerBg,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.headerText,
    flexShrink: 1,
  },
  roleBadge: {
    backgroundColor: "rgba(79, 70, 229, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    color: "#A5B4FC",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  viewProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  userSub: {
    fontSize: 12,
    color: Theme.headerMuted,
    marginRight: 2,
  },

  /* Menu Navigation */
  menuScrollView: {
    flex: 1,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: Theme.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Theme.surface,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.textPrimary,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeContainer: {
    backgroundColor: Theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Footer & Logout */
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 16 : 24,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.border,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.dangerLight,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.dangerBorder,
  },
  logoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.danger,
  },
});


















// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   Image,
//   StatusBar,
//   Alert,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";

// const menuItems = [
//   { id: "1", title: "All Classes", icon: "class", screen: "AdminClasses" },
//   { id: "2", title: "Block List", icon: "block", screen: "BlockList" },
//   { id: "3", title: "Feedback", icon: "feedback", screen: "Feedback" },
//   { id: "4", title: "Blocked Student", icon: "block", screen: "AdminBlockedStudent" },
//   // { id: "4", title: "Tutor Courses", icon: "book", screen: "AdminTutorCourses" },
//   { id: "5", title: "Logout", icon: "logout", screen: "AuthStack" },
// ];

// const AdminDrawerScreen = ({ navigation }) => {
//   const userName = "Admin Name";

//   const handleNavigation = (item) => {
//     if (item.title === "Logout") {
//       navigation.navigate("AuthStack");
//     } else {
//       navigation.navigate(item.screen);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="close" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* User Section */}
//       <TouchableOpacity
//         style={styles.userContainer}
//         onPress={() => navigation.navigate("AdminProfile")}
//       >
//         <View style={styles.avatar}>
//           <Icon name="person" size={28} color="#fff" />
//         </View>

//         <View>
//           <Text style={styles.userName}>{userName}</Text>
//           <Text style={styles.userSub}>View Profile</Text>
//         </View>
//       </TouchableOpacity>

//       {/* Divider */}
//       <View style={styles.divider} />

//       {/* Menu */}
//       <View style={styles.menuContainer}>
//         {menuItems.map((item) => (
//           <TouchableOpacity
//             key={item.id}
//             style={styles.menuItem}
//             onPress={() => handleNavigation(item)}
//           >
//             <View style={styles.menuLeft}>
//               <Icon name={item.icon} size={22} color={colors.primary} />
//               <Text style={styles.menuText}>{item.title}</Text>
//             </View>

//             <Icon name="chevron-right" size={22} color="#999" />
//           </TouchableOpacity>
//         ))}
//       </View>
//     </SafeAreaView>
//   );
// };

// export default AdminDrawerScreen;

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.primary,
//     paddingHorizontal: 16,
//   },

//   /* Header */
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 40,
//   },

//   logo: {
//     width: 120,
//     height: 45,
//   },

//   /* User */
//   userContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 25,
//     paddingVertical: 10,
//   },

//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#ffffff30",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },

//   userName: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#fff",
//   },

//   userSub: {
//     fontSize: 12,
//     color: "#ddd",
//     marginTop: 2,
//   },

//   divider: {
//     height: 1,
//     backgroundColor: "#ffffff30",
//     marginVertical: 15,
//   },

//   /* Menu */
//   menuContainer: {
//     marginTop: 10,
//   },

//   menuItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 14,
//     paddingHorizontal: 15,
//     borderRadius: 12,
//     marginBottom: 10,
//   },

//   menuLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   menuText: {
//     fontSize: 15,
//     fontWeight: "600",
//     marginLeft: 10,
//     color: "#333",
//   },
// });




































































































// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   Image,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import Login from "../Auth/LoginScreen"
// import colors from "../utils/colors";

// const menuItems = [
//   { id: "1", title: "ALL CLASSES", screen: "AdminClasses" },
//   { id: "2", title: "BLOCK LIST", screen: "BlockList" },
//   { id: "3", title: "FEEDBACK", screen: "Feedback" }, 
//   { id: "4", title: "LOGOUT", screen: "Login" }, 
// ];

// const AdminDrawerScreen = ({ navigation }) => {
//   const userName = "Admin Name"; // 🔥 Replace with dynamic user later

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Top Logo */}
//       <Image
//         source={require("../../../assets/images/logo.png")}
//         style={styles.logo}
//         resizeMode="contain"
//       />

//       {/* Drawer Section */}
//       <View style={styles.drawerContainer}>
//         {/* Close Button */}
//         <TouchableOpacity
//           style={styles.closeBtn}
//           onPress={() => navigation.goBack()}
//         >
//           <Icon name="close" size={28} color="#fff" />
//         </TouchableOpacity>

//         {/* 👤 USER NAME (NEW FEATURE) */}
//         <TouchableOpacity
//           style={styles.userContainer}
//           onPress={() => navigation.navigate("AdminProfile")} // 🔥 Navigate on click
//         >
//           <Icon name="account-circle" size={40} color="#fff" />
//           <Text style={styles.userName}>{userName}</Text>
//         </TouchableOpacity>

//         {/* Divider */}
//         <View style={styles.divider} />

//         {/* Menu Items */}
//         {menuItems.map((item) => (
//           <TouchableOpacity
//             key={item.id}
//             style={styles.menuItem}
//             onPress={() => navigation.navigate(item.screen)}
//           >
//             <Text style={styles.menuText}>{item.title}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </SafeAreaView>
//   );
// };

// export default AdminDrawerScreen;

// /* ---------- Styles ---------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EDE7F6",
//   },

//   logo: {
//     width: 160,
//     height: 60,
//     alignSelf: "center",
//     marginTop: 10,
//   },

//   drawerContainer: {
//     flex: 1,
//     backgroundColor: colors.primary,
//     marginTop: 10,
//     paddingTop: 20,
//   },

//   closeBtn: {
//     marginLeft: 15,
//     marginBottom: 10,
//   },

//   /* ---------- USER SECTION ---------- */
//   userContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     marginBottom: 15,
//   },

//   userName: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//     marginLeft: 10,
//   },

//   divider: {
//     height: 1,
//     backgroundColor: "#ffffff50",
//     marginBottom: 10,
//   },

//   /* ---------- MENU ---------- */
//   menuItem: {
//     backgroundColor: "#fff",
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     marginBottom: 8,
//   },

//   menuText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#000",
//   },
// });