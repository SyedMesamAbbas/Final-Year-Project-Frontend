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
  { id: "2", title: "Blocked Tutor", icon: "block", screen: "BlockList", badge: null },
  { id: "3", title: "Feedback", icon: "rate-review", screen: "Feedback", badge: null },
  { id: "4", title: "Blocked Student", icon: "person-off", screen: "AdminBlockedStudent", badge: null },
  { id: "5", title: "Venue Management", icon: "location-on", screen: "AdminVenueManagement" },
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
