import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Platform,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";

const MENU_ITEMS = [
  {
    label: "My Profile",
    icon: "person-outline",
    route: "StudentProfile",
    description: "View and edit your personal details",
  },
  {
    label: "My Tutor",
    icon: "school",
    route: "MyTutor",
    description: "View your assigned tutor profile",
  },
  {
    label: "Session History",
    icon: "history",
    route: "StudentHistory",
    description: "Past learning sessions and records",
  },
  {
    label: "Today Classes",
    icon: "event-note",
    route: "TodayClasses",
    description: "Manage your daily class schedule",
  },
];

const StudentDrawer = ({ navigation }) => {
  const primaryColor = colors?.primary || "#4F46E5";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: primaryColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      {/* BRANDING HEADER */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logoImg}
            />
          </View>
          <View style={styles.brandTitleGroup}>
            <Text style={styles.logoText}>House of Tutor</Text>
            <Text style={styles.logoTagline}>Your learning companion</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* DRAWER BODY / SHEET */}
      <View style={styles.drawerSheet}>
        <Text style={styles.sectionLabel}>NAVIGATION</Text>

        {/* MENU LIST */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconWrapper,
                  { backgroundColor: `${primaryColor}12` },
                ]}
              >
                <Icon name={item.icon} size={22} color={primaryColor} />
              </View>

              <View style={styles.menuTextGroup}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.description}</Text>
              </View>

              <Icon name="chevron-right" size={22} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        {/* FOOTER / LOGOUT */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => navigation.navigate("AuthStack")}
            activeOpacity={0.7}
          >
            <View style={styles.logoutIconWrapper}>
              <Icon name="logout" size={20} color="#EF4444" />
            </View>
            <View style={styles.menuTextGroup}>
              <Text style={styles.logoutText}>Log Out</Text>
              <Text style={styles.logoutSubtext}>Sign out of your account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StudentDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── HEADER ─────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 36 : 16,
    paddingBottom: 24,
  },

  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },

  logoImg: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  brandTitleGroup: {
    marginLeft: 14,
  },

  logoText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  logoTagline: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 2,
    fontWeight: "500",
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },

  // ── DRAWER SHEET ───────────────────────
  drawerSheet: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 20 : 28,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1.2,
    marginLeft: 6,
    marginBottom: 14,
  },

  // ── MENU ITEMS ─────────────────────────
  menuList: {
    gap: 12,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },

  menuIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  menuTextGroup: {
    flex: 1,
  },

  menuLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },

  menuDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "400",
  },

  // ── FOOTER & LOGOUT ────────────────────
  footer: {
    paddingTop: 12,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },

  logoutIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },

  logoutSubtext: {
    fontSize: 12,
    color: "#F87171",
    marginTop: 2,
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
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";

// const MENU_ITEMS = [
//   {
//     label: "My Profile",
//     icon: "person-outline",
//     route: "StudentProfile",
//     description: "View and edit your details",
//   },
//   {
//     label: "My Tutor",
//     icon: "school",
//     route: "MyTutor",
//     description: "View your assigned tutor",
//   },
//   {
//     label: "Session History",
//     icon: "history",
//     route: "StudentHistory",
//     description: "Past sessions and records",
//   },
//   {
//     label: "Today Classes",
//     icon: "book",
//     route: "TodayClasses",
//     description: "Manage your Classes",
//   },
// ];

// const StudentDrawer = ({ navigation }) => {
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

//       {/* HEADER */}
//       <View style={styles.header}>
//         <View style={styles.headerBrand}>
//           <View style={styles.logoWrapper}>
//             <Image
//               source={require("../../../assets/images/logo.png")}
//               style={styles.logoImg}
//             />
//           </View>
//           <View>
//             <Text style={styles.logoText}>House of Tutor</Text>
//             <Text style={styles.logoTagline}>Your learning companion</Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.closeBtn}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Icon name="close" size={22} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* DIVIDER */}
//       <View style={styles.divider} />

//       {/* SECTION LABEL */}
//       <Text style={styles.sectionLabel}>NAVIGATION</Text>

//       {/* MENU ITEMS */}
//       <View style={styles.menuList}>
//         {MENU_ITEMS.map((item) => (
//           <TouchableOpacity
//             key={item.route}
//             style={styles.menuItem}
//             onPress={() => navigation.navigate(item.route)}
//             activeOpacity={0.85}
//           >
//             <View style={styles.menuIconWrapper}>
//               <Icon name={item.icon} size={20} color={colors.primary} />
//             </View>
//             <View style={styles.menuTextGroup}>
//               <Text style={styles.menuLabel}>{item.label}</Text>
//               <Text style={styles.menuDesc}>{item.description}</Text>
//             </View>
//             <Icon name="chevron-right" size={20} color="#ccc" />
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* SPACER */}
//       <View style={{ flex: 1 }} />

//       {/* BOTTOM — LOGOUT */}
//       <View style={styles.footer}>
//         <View style={styles.divider} />
//         <TouchableOpacity
//           style={styles.logoutBtn}
//           onPress={() => navigation.navigate("AuthStack")}
//           activeOpacity={0.85}
//         >
//           <View style={styles.logoutIconWrapper}>
//             <Icon name="logout" size={20} color="#e53935" />
//           </View>
//           <Text style={styles.logoutText}>Log Out</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default StudentDrawer;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.primary,
//   },

//   // ── HEADER ─────────────────────────────
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 50,
//     paddingBottom: 24,
//   },

//   headerBrand: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },

//   logoWrapper: {
//     width: 46,
//     height: 46,
//     borderRadius: 12,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   logoImg: {
//     width: 28,
//     height: 28,
//     resizeMode: "contain",
//   },

//   logoText: {
//     fontSize: 17,
//     fontWeight: "700",
//     color: "#fff",
//     letterSpacing: 0.3,
//   },

//   logoTagline: {
//     fontSize: 11,
//     color: "rgba(255,255,255,0.6)",
//     marginTop: 1,
//     letterSpacing: 0.2,
//   },

//   closeBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   // ── DIVIDER ────────────────────────────
//   divider: {
//     height: 1,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     marginHorizontal: 20,
//   },

//   // ── SECTION LABEL ──────────────────────
//   sectionLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: "rgba(255,255,255,0.45)",
//     letterSpacing: 1.4,
//     marginHorizontal: 20,
//     marginTop: 22,
//     marginBottom: 10,
//   },

//   // ── MENU ───────────────────────────────
//   menuList: {
//     paddingHorizontal: 16,
//     gap: 8,
//   },

//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     paddingVertical: 14,
//     paddingHorizontal: 14,
//     gap: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 2,
//   },

//   menuIconWrapper: {
//     width: 38,
//     height: 38,
//     borderRadius: 10,
//     backgroundColor: `${colors.primary}15`,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   menuTextGroup: {
//     flex: 1,
//   },

//   menuLabel: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#1a1a1a",
//     letterSpacing: 0.1,
//   },

//   menuDesc: {
//     fontSize: 12,
//     color: "#999",
//     marginTop: 2,
//   },

//   // ── FOOTER ─────────────────────────────
//   footer: {
//     paddingBottom: 30,
//     gap: 16,
//   },

//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 16,
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     paddingVertical: 14,
//     paddingHorizontal: 14,
//     gap: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 2,
//   },

//   logoutIconWrapper: {
//     width: 38,
//     height: 38,
//     borderRadius: 10,
//     backgroundColor: "#fdecea",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   logoutText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#e53935",
//   },
// });


















// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//  Image,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";

// const StudentDrawer = ({ navigation }) => {
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImg}
//           />

//           <Text style={styles.logoText}>
//             House of Tutor
//           </Text>
//         </View>

//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//         >
//           <Icon
//             name="close"
//             size={28}
//             color="#fff"
//           />
//         </TouchableOpacity>
//       </View>

//       {/* TOP MENU */}
//       <View style={styles.topMenu}>
//         {/* PROFILE */}
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() =>
//             navigation.navigate(
//               "StudentHistory"
//             )
//           }
//         >
//           <View style={styles.menuRow}>
//             <Icon
//               name="person"
//               size={22}
//               color={colors.primary}
//             />

//             <Text style={styles.menuText}>
//               History
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </View>


//       {/* TOP MENU */}
//       <View style={styles.topMenu}>
//         {/* PROFILE */}
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() =>
//             navigation.navigate(
//               "StudentProfile"
//             )
//           }
//         >
//           <View style={styles.menuRow}>
//             <Icon
//               name="person"
//               size={22}
//               color={colors.primary}
//             />

//             <Text style={styles.menuText}>
//               Profile
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       {/* TOP MENU */}
//       <View style={styles.topMenu}>
//         {/* PROFILE */}
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() =>
//             navigation.navigate(
//               "MyTutor"
//             )
//           }
//         >
//           <View style={styles.menuRow}>
//             <Icon
//               name="person"
//               size={22}
//               color={colors.primary}
//             />

//             <Text style={styles.menuText}>
//               My Tutor
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       {/* BOTTOM MENU */}
//       <View style={styles.bottomMenu}>
//         {/* LOGOUT */}
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() =>
//             navigation.navigate(
//               "AuthStack"
//             )
//           }
//         >
//           <View style={styles.menuRow}>
//             <Icon
//               name="logout"
//               size={22}
//               color="red"
//             />

//             <Text
//               style={[
//                 styles.menuText,
//                 { color: "red" },
//               ]}
//             >
//               Logout
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default StudentDrawer;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.primary,
//   },

//   // =====================================
//   // HEADER
//   // =====================================
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 18,
//     paddingTop: 45,
//     paddingBottom: 20,
//   },

//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   logoImg: {
//     width: 40,
//     height: 40,
//     resizeMode: "contain",
//     marginRight: 10,
//   },

//   logoText: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#fff",
//   },

//   // =====================================
//   // MENU
//   // =====================================
//   topMenu: {
//     flex: 1,
//     marginTop: 10,
//   },

//   bottomMenu: {
//     paddingBottom: 25,
//   },

//   menuItem: {
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderRadius: 14,
//     paddingVertical: 15,
//     paddingHorizontal: 16,
//   },

//   menuRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   menuText: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginLeft: 14,
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
// import colors from "../utils/colors";

// const StudentDrawer = ({ navigation }) => {
//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImg}
//           />
//           <Text style={styles.logoText}>House of Tutor</Text>
//         </View>

//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="close" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.menu}>
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => navigation.navigate("StudentProfile")}
//         >
//           <View style={styles.menuRow}>
//             <Icon name="logout" size={22} color="red" />
//             <Text style={[styles.menuText, { color: "red" }]}>Profile</Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.menu}>
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => navigation.navigate("AuthStack")}
//         >
//           <View style={styles.menuRow}>
//             <Icon name="logout" size={22} color="red" />
//             <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default StudentDrawer;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.primary,
//   },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 15,
//     marginTop:35
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   logoImg: {
//     width: 35,
//     height: 35,
//     marginRight: 8,
//   },
//   logoText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#fff",
//   },

//   menu: {
//     marginTop: 20,
//   },
//   menuItem: {
//     backgroundColor: "#fff",
//     marginHorizontal: 15,
//     marginVertical: 8,
//     borderRadius: 12,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     elevation: 3,
//   },
//   menuRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   menuText: {
//     fontSize: 16,
//     marginLeft: 12,
//     fontWeight: "500",
//     color: "#333",
//   },
// });










//-------------Professional----------------
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   Image,
//   StatusBar,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";

// const MENU_ITEMS = [
//   {
//     label: "My Profile",
//     icon: "person-outline",
//     screen: "StudentProfile",
//     description: "View & edit your info",
//   },
//   {
//     label: "History",
//     icon: "history",
//     screen: "StudentHistory",
//     description: "Past sessions & bookings",
//   },
// ];

// const StudentDrawer = ({ navigation }) => {
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />

//       {/* ── HEADER ── */}
//       <View style={styles.header}>
//         <View style={styles.brandRow}>
//           <View style={styles.logoWrap}>
//             <Image
//               source={require("../../../assets/images/logo.png")}
//               style={styles.logoImg}
//             />
//           </View>
//           <View>
//             <Text style={styles.brandName}>House of Tutor</Text>
//             <Text style={styles.brandTagline}>Learning, Simplified</Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.closeBtn}
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Icon name="close" size={20} color="rgba(255,255,255,0.7)" />
//         </TouchableOpacity>
//       </View>

//       {/* ── DIVIDER ── */}
//       <View style={styles.divider} />

//       {/* ── USER CARD ── */}
//       <View style={styles.userCard}>
//         <View style={styles.avatarCircle}>
//           <Icon name="person" size={28} color={colors.primary} />
//         </View>
//         <View style={styles.userInfo}>
//           <Text style={styles.userName}>Student</Text>
//           <View style={styles.badgeRow}>
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>Active</Text>
//             </View>
//           </View>
//         </View>
//       </View>

//       {/* ── NAV SECTION ── */}
//       <View style={styles.section}>
//         <Text style={styles.sectionLabel}>NAVIGATION</Text>
//         {MENU_ITEMS.map((item) => (
//           <TouchableOpacity
//             key={item.screen}
//             style={styles.menuItem}
//             onPress={() => navigation.navigate(item.screen)}
//             activeOpacity={0.75}
//           >
//             <View style={styles.menuIconWrap}>
//               <Icon name={item.icon} size={20} color={colors.primary} />
//             </View>
//             <View style={styles.menuTextWrap}>
//               <Text style={styles.menuLabel}>{item.label}</Text>
//               <Text style={styles.menuDesc}>{item.description}</Text>
//             </View>
//             <Icon name="chevron-right" size={18} color="rgba(255,255,255,0.25)" />
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* ── SPACER ── */}
//       <View style={{ flex: 1 }} />

//       {/* ── LOGOUT ── */}
//       <View style={styles.footer}>
//         <View style={styles.footerDivider} />
//         <TouchableOpacity
//           style={styles.logoutBtn}
//           onPress={() => navigation.navigate("AuthStack")}
//           activeOpacity={0.75}
//         >
//           <View style={styles.logoutIconWrap}>
//             <Icon name="logout" size={18} color="#FF5A5A" />
//           </View>
//           <Text style={styles.logoutText}>Log Out</Text>
//         </TouchableOpacity>
//         <Text style={styles.version}>v1.0.0</Text>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default StudentDrawer;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#0F1A2E",
//   },

//   // ── HEADER ──
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 48,
//     paddingBottom: 18,
//   },
//   brandRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   logoWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 12,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//   },
//   logoImg: {
//     width: 34,
//     height: 34,
//     resizeMode: "contain",
//   },
//   brandName: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#FFFFFF",
//     letterSpacing: 0.3,
//   },
//   brandTagline: {
//     fontSize: 11,
//     color: "rgba(255,255,255,0.45)",
//     marginTop: 1,
//     letterSpacing: 0.5,
//   },
//   closeBtn: {
//     width: 34,
//     height: 34,
//     borderRadius: 10,
//     backgroundColor: "rgba(255,255,255,0.08)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   // ── DIVIDER ──
//   divider: {
//     height: 1,
//     backgroundColor: "rgba(255,255,255,0.07)",
//     marginHorizontal: 20,
//   },

//   // ── USER CARD ──
//   userCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 16,
//     marginTop: 20,
//     marginBottom: 8,
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 14,
//     gap: 14,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.07)",
//   },
//   avatarCircle: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#FFFFFF",
//     letterSpacing: 0.2,
//   },
//   badgeRow: {
//     flexDirection: "row",
//     marginTop: 5,
//   },
//   badge: {
//     backgroundColor: "rgba(72, 199, 142, 0.2)",
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderWidth: 1,
//     borderColor: "rgba(72, 199, 142, 0.4)",
//   },
//   badgeText: {
//     fontSize: 10,
//     color: "#48C78E",
//     fontWeight: "600",
//     letterSpacing: 0.5,
//   },

//   // ── SECTION ──
//   section: {
//     marginTop: 24,
//     paddingHorizontal: 20,
//   },
//   sectionLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: "rgba(255,255,255,0.3)",
//     letterSpacing: 1.5,
//     marginBottom: 10,
//     marginLeft: 4,
//   },

//   // ── MENU ITEM ──
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 13,
//     paddingHorizontal: 14,
//     borderRadius: 14,
//     marginBottom: 4,
//     backgroundColor: "rgba(255,255,255,0.04)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.06)",
//     gap: 12,
//   },
//   menuIconWrap: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     backgroundColor: "rgba(255,255,255,0.08)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   menuTextWrap: {
//     flex: 1,
//   },
//   menuLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#FFFFFF",
//     letterSpacing: 0.2,
//   },
//   menuDesc: {
//     fontSize: 11,
//     color: "rgba(255,255,255,0.4)",
//     marginTop: 2,
//   },

//   // ── FOOTER ──
//   footer: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   footerDivider: {
//     height: 1,
//     backgroundColor: "rgba(255,255,255,0.07)",
//     marginBottom: 16,
//   },
//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 13,
//     paddingHorizontal: 14,
//     borderRadius: 14,
//     backgroundColor: "rgba(255, 90, 90, 0.08)",
//     borderWidth: 1,
//     borderColor: "rgba(255, 90, 90, 0.2)",
//     gap: 12,
//   },
//   logoutIconWrap: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     backgroundColor: "rgba(255, 90, 90, 0.12)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   logoutText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#FF5A5A",
//     letterSpacing: 0.2,
//   },
//   version: {
//     textAlign: "center",
//     fontSize: 11,
//     color: "rgba(255,255,255,0.2)",
//     marginTop: 14,
//     letterSpacing: 0.5,
//   },
// });