import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";

const MENU_ITEMS = [
  {
    label: "Profile",
    icon: "person",
    screen: "TutorProfile",
  },
  {
    label: "Tutor all classes",
    icon: "school",
    screen: "TutorAllClasses",
  },
  {
    label: "History",
    icon: "history",
    screen: "History",
  },
  {
    label: "Dashboard",
    icon: "dashboard",
    screen: "TutorDashboard",
  },
  {
    label: "My-Courses",
    icon: "book",
    screen: "TutorCourses",
  },
  {
    label: "My-Student",
    icon: "groups",
    screen: "MyStudent",
  },
  {
    label: "Payment Screen",
    icon: "groups",
    screen: "PaymentScreen",
  },
  {
    label: "Pending Classes(Cancel Classes)",
    icon: "class",
    screen: "CancelClasses",
  },
];

const MenuItem = ({
  icon,
  label,
  onPress,
  danger,
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View
      style={[
        styles.iconWrap,
        danger && styles.iconWrapDanger,
      ]}
    >
      <Icon
        name={icon}
        size={20}
        color={danger ? "#A32D2D" : colors.primary}
      />
    </View>

    <Text
      style={[
        styles.menuText,
        danger && styles.menuTextDanger,
      ]}
    >
      {label}
    </Text>

    <Icon
      name="chevron-right"
      size={20}
      color={danger ? "#A32D2D" : "#BBBAC0"}
      style={styles.chevron}
    />
  </TouchableOpacity>
);

const TutorDrawer = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.logoCircle}>
              <Icon
                name="school"
                size={28}
                color="#fff"
              />
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => navigation.goBack()}
            >
              <Icon
                name="close"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.appName}>
            House of Tutor
          </Text>
        </View>

        {/* ================= NAVIGATION ================= */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>
            Navigation
          </Text>

          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.screen}
              icon={item.icon}
              label={item.label}
              onPress={() =>
                navigation.navigate(item.screen)
              }
            />
          ))}
        </View>

        {/* ================= ACCOUNT ================= */}
        <View style={styles.bottomSection}>
          <Text style={styles.sectionLabel}>
            Account
          </Text>

          <MenuItem
            icon="logout"
            label="Logout"
            danger
            onPress={() =>
              navigation.navigate("AuthStack")
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TutorDrawer;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F4FB",
  },

  // Makes the drawer responsive and scrollable
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 25,
  },

  // ================= HEADER =================

  header: {
    backgroundColor: colors.primary,
    paddingTop: 35,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  // ================= MENU =================

  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  bottomSection: {
    paddingHorizontal: 16,
    marginTop: 12,
    paddingTop: 10,
    paddingBottom: 30,
    borderTopWidth: 0.5,
    borderTopColor: "#E0DEF5",
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9896B0",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 8,
    paddingHorizontal: 4,
  },

  // ================= MENU ITEM =================

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#E8E6F4",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEEDFE",
    justifyContent: "center",
    alignItems: "center",
  },

  iconWrapDanger: {
    backgroundColor: "#FCEBEB",
  },

  menuText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A2E",
  },

  menuTextDanger: {
    color: "#A32D2D",
  },

  chevron: {
    marginLeft: 8,
  },
});




// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";

// const MENU_ITEMS = [
//   { label: "Profile",          icon: "person",           screen: "TutorProfile" },
//   { label: "Tutor all classes", icon: "school",           screen: "TutorAllClasses" },
//   { label: "History",          icon: "history",          screen: "History" },
//   { label: "Dashboard",        icon: "dashboard",        screen: "TutorDashboard" },
//   { label: "My-Courses",        icon: "book",            screen: "TutorCourses" },
//   { label: "My-Student",        icon: "person",        screen: "MyStudent" },
// ];

// const MenuItem = ({ icon, label, onPress, danger }) => (
//   <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
//     <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
//       <Icon name={icon} size={20} color={danger ? "#A32D2D" : colors.primary} />
//     </View>
//     <Text style={[styles.menuText, danger && styles.menuTextDanger]}>{label}</Text>
//     <Icon name="chevron-right" size={20} color={danger ? "#A32D2D" : "#BBBAC0"} style={styles.chevron} />
//   </TouchableOpacity>
// );

// const TutorDrawer = ({ navigation }) => (
//   <SafeAreaView style={styles.container}>
//     {/* HEADER */}
//     <View style={styles.header}>
//       <View style={styles.headerRow}>
//         <View style={styles.logoCircle}>
//           <Icon name="school" size={28} color="#fff" />
//         </View>
//         <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
//           <Icon name="close" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//       <Text style={styles.appName}>House of Tutor</Text>
//     </View>

//     {/* TOP MENU */}
//     <View style={styles.menuSection}>
//       <Text style={styles.sectionLabel}>Navigation</Text>
//       {MENU_ITEMS.map((item) => (
//         <MenuItem
//           key={item.screen}
//           icon={item.icon}
//           label={item.label}
//           onPress={() => navigation.navigate(item.screen)}
//         />
//       ))}
//     </View>

//     {/* BOTTOM MENU */}
//     <View style={styles.bottomSection}>
//       <Text style={styles.sectionLabel}>Account</Text>
//       <MenuItem
//         icon="logout"
//         label="Logout"
//         danger
//         onPress={() => navigation.navigate("AuthStack")}
//       />
//     </View>
//   </SafeAreaView>
// );

// export default TutorDrawer;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F4FB",
//   },

//   // ── HEADER ────────────────────────────────
//   header: {
//     backgroundColor: colors.primary,   // #534AB7
//     paddingTop: 48,
//     paddingHorizontal: 20,
//     paddingBottom: 24,
//   },
//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   logoCircle: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     borderWidth: 1.5,
//     borderColor: "rgba(255,255,255,0.35)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   closeBtn: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   appName: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#fff",
//     letterSpacing: 0.2,
//   },

//   // ── MENU SECTIONS ─────────────────────────
//   menuSection: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 8,
//   },
//   bottomSection: {
//     paddingHorizontal: 16,
//     paddingBottom: 28,
//     borderTopWidth: 0.5,
//     borderTopColor: "#E0DEF5",
//     paddingTop: 4,
//   },
//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "#9896B0",
//     textTransform: "uppercase",
//     letterSpacing: 0.7,
//     marginTop: 12,
//     marginBottom: 8,
//     paddingHorizontal: 4,
//   },

//   // ── MENU ITEM ─────────────────────────────
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     paddingVertical: 13,
//     paddingHorizontal: 14,
//     marginBottom: 6,
//     borderWidth: 0.5,
//     borderColor: "#E8E6F4",
//   },
//   iconWrap: {
//     width: 36,
//     height: 36,
//     borderRadius: 8,
//     backgroundColor: "#EEEDFE",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconWrapDanger: {
//     backgroundColor: "#FCEBEB",
//   },
//   menuText: {
//     flex: 1,
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#1A1A2E",
//     marginLeft: 14,
//   },
//   menuTextDanger: {
//     color: "#A32D2D",
//   },
//   chevron: {
//     marginLeft: 4,
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

// const TutorDrawer = ({ navigation }) => {
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <View style={styles.headerTop}>
//           <View style={styles.profileSection}>
//             <Image
//               source={require("../../../assets/images/logo.png")}
//               style={styles.logo}
//             />

//             <Text style={styles.appName}>
//               House of Tutor
//             </Text>
//           </View>

//           <TouchableOpacity
//             onPress={() =>
//               navigation.goBack()
//             }
//           >
//             <Icon
//               name="close"
//               size={28}
//               color="#fff"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* TOP MENU */}
//       <View style={styles.topMenu}>
//         {/* PROFILE */}
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() =>
//             navigation.navigate(
//               "TutorProfile"
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

//         {/* TUTOR ALL CLASSES */}
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() =>
//             navigation.navigate(
//               "TutorAllClasses"
//             )
//           }
//         >
//           <View style={styles.menuRow}>
//             <Icon
//               name="school"
//               size={22}
//               color={colors.primary}
//             />

//             <Text style={styles.menuText}>
//               Tutor All Classes
//             </Text>
//           </View>
//         </TouchableOpacity>

//         {/* HISTORY */}
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() =>
//             navigation.navigate(
//               "History"
//             )
//           }
//         >
//           <View style={styles.menuRow}>
//             <Icon
//               name="history"
//               size={22}
//               color={colors.primary}
//             />

//             <Text style={styles.menuText}>
//               History
//             </Text>
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() =>
//             navigation.navigate(
//               "TutorDashboard"
//             )
//           }
//         >
//           <View style={styles.menuRow}>
//             <Icon
//               name="history"
//               size={22}
//               color={colors.primary}
//             />

//             <Text style={styles.menuText}>
//               Dashboard
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

// export default TutorDrawer;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.primary,
//     justifyContent: "space-between",
//   },

//   // =====================================
//   // HEADER
//   // =====================================

//   header: {
//     paddingTop: 45,
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },

//   headerTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },

//   profileSection: {
//     alignItems: "center",
//   },

//   logo: {
//     width: 65,
//     height: 65,
//     resizeMode: "contain",
//     marginBottom: 10,
//   },

//   appName: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#fff",
//   },

//   // =====================================
//   // MENUS
//   // =====================================

//   topMenu: {
//     flex: 1,
//     marginTop: 10,
//   },

//   bottomMenu: {
//     paddingBottom: 25,
//   },

//   // =====================================
//   // MENU ITEM
//   // =====================================

//   menuItem: {
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderRadius: 14,
//     paddingVertical: 15,
//     paddingHorizontal: 16,
//     elevation: 3,
//   },

//   menuRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   menuText: {
//     fontSize: 16,
//     marginLeft: 14,
//     fontWeight: "600",
//     color: "#333",
//   },
// });