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
  {
    label: "My Fee",
    icon: "account-balance-wallet",
    route: "StudentFee",
    description: "View and manage your course fee",
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
