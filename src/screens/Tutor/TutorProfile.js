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
