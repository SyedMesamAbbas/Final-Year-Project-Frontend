import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";

const MENU_ITEMS = [
  {
    label: "Profile",
    icon: "person-outline",
    screen: "TutorProfile",
  },
  {
    label: "Tutor All Classes",
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
    label: "My Courses",
    icon: "menu-book",
    screen: "TutorCourses",
  },
  {
    label: "My Students",
    icon: "groups",
    screen: "MyStudent",
  },
  {
    label: "Payment Screen",
    icon: "payments",
    screen: "PaymentScreen",
  },
  {
    label: "Pending Classes (Cancel Classes)",
    icon: "event-busy",
    screen: "CancelClasses",
  },
];

const MenuItem = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity
    style={[styles.menuItem, danger && styles.menuItemDanger]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
      <Icon
        name={icon}
        size={22}
        color={danger ? "#DC2626" : colors.primary || "#4F46E5"}
      />
    </View>

    <Text style={[styles.menuText, danger && styles.menuTextDanger]}>
      {label}
    </Text>

    <Icon
      name="chevron-right"
      size={20}
      color={danger ? "#EF4444" : "#94A3B8"}
      style={styles.chevron}
    />
  </TouchableOpacity>
);

const TutorDrawer = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary || "#4F46E5"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.logoCircle}>
              <Icon name="school" size={28} color="#FFFFFF" />
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.8}
            >
              <Icon name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.appName}>House of Tutor</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>TUTOR PORTAL</Text>
          </View>
        </View>

        {/* ================= NAVIGATION ================= */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>Navigation</Text>

          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.screen}
              icon={item.icon}
              label={item.label}
              onPress={() => navigation.navigate(item.screen)}
            />
          ))}
        </View>

        {/* ================= ACCOUNT ================= */}
        <View style={styles.bottomSection}>
          <Text style={styles.sectionLabel}>Account</Text>

          <MenuItem
            icon="logout"
            label="Logout"
            danger
            onPress={() => navigation.navigate("AuthStack")}
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
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  /* ================= HEADER ================= */
  header: {
    backgroundColor: colors.primary || "#4F46E5",
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.primary || "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },

  roleBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },

  /* ================= MENU SECTION ================= */
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  bottomSection: {
    paddingHorizontal: 16,
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  /* ================= MENU ITEM ================= */
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  menuItemDanger: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  iconWrapDanger: {
    backgroundColor: "#FEE2E2",
  },

  menuText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },

  menuTextDanger: {
    color: "#DC2626",
  },

  chevron: {
    marginLeft: 8,
  },
});
