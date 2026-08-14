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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";

const menuItems = [
  { id: "1", title: "All Classes", icon: "class", screen: "AdminClasses" },
  { id: "2", title: "Block List", icon: "block", screen: "BlockList" },
  { id: "3", title: "Feedback", icon: "feedback", screen: "Feedback" },
  { id: "4", title: "Blocked Student", icon: "block", screen: "AdminBlockedStudent" },
  // { id: "4", title: "Tutor Courses", icon: "book", screen: "AdminTutorCourses" },
  { id: "5", title: "Logout", icon: "logout", screen: "AuthStack" },
];

const AdminDrawerScreen = ({ navigation }) => {
  const userName = "Admin Name";

  const handleNavigation = (item) => {
    if (item.title === "Logout") {
      navigation.navigate("AuthStack");
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* User Section */}
      <TouchableOpacity
        style={styles.userContainer}
        onPress={() => navigation.navigate("AdminProfile")}
      >
        <View style={styles.avatar}>
          <Icon name="person" size={28} color="#fff" />
        </View>

        <View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userSub}>View Profile</Text>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Menu */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleNavigation(item)}
          >
            <View style={styles.menuLeft}>
              <Icon name={item.icon} size={22} color={colors.primary} />
              <Text style={styles.menuText}>{item.title}</Text>
            </View>

            <Icon name="chevron-right" size={22} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default AdminDrawerScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  },

  logo: {
    width: 120,
    height: 45,
  },

  /* User */
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    paddingVertical: 10,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffffff30",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  userSub: {
    fontSize: 12,
    color: "#ddd",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#ffffff30",
    marginVertical: 15,
  },

  /* Menu */
  menuContainer: {
    marginTop: 10,
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
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