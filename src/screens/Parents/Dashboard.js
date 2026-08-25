import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

// --- Sub-components for clean architecture ---

const ChildCard = ({ item, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={styles.cardContainer}
    onPress={onPress}
  >
    <View style={styles.cardHeader}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarInner}>
          <Text style={styles.avatarInitials}>
            {item.fullName ? item.fullName.charAt(0).toUpperCase() : "C"}
          </Text>
        </View>
        <View style={styles.statusIndicator} />
      </View>

      <View style={styles.headerTextContainer}>
        <Text style={styles.childName} numberOfLines={1}>
          {item.fullName}
        </Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeLabel}>CNIC/ID:</Text>
          <Text style={styles.badgeValue}>{item.cnic || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.chevronWrapper}>
        <Icon name="chevron-forward" size={18} color={colors.primary} />
      </View>
    </View>

    <View style={styles.cardDivider} />

    <View style={styles.cardDetails}>
      <View style={styles.detailRow}>
        <View style={styles.iconContainer}>
          <Icon name="mail" size={14} color={colors.primary} />
        </View>
        <Text style={styles.detailText} numberOfLines={1}>
          {item.email}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.iconContainer}>
          <Icon name="call" size={14} color={colors.primary} />
        </View>
        <Text style={styles.detailText} numberOfLines={1}>
          {item.phone || "No phone provided"}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <Icon name="people-outline" size={48} color="#94A3B8" />
    </View>
    <Text style={styles.emptyTitle}>No Children Linked</Text>
    <Text style={styles.emptySubtitle}>
      There are no student profiles currently connected to your parent account.
    </Text>
  </View>
);

// --- Main Screen ---

const ParentChildren = ({ navigation }) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChildren = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/Parent/my-children`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChildren(response.data || []);
    } catch (error) {
      console.log(error.response?.data || error);
      Alert.alert(
        "Connection Error",
        error.response?.data?.message || "Unable to retrieve profiles."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChildren();
  }, []);

  const handleCardPress = (item) => {
    navigation.navigate("ParentChildDetail", {
      studentId: item.studentId,
      userId: item.userId,
      fullName: item.fullName,
      email: item.email,
    });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => navigation.navigate("AuthStack") },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Modern Top Header Bar */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
          />
        </View>
        <TouchableOpacity 
          onPress={handleLogout} 
          style={styles.logoutButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 4 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profiles...</Text>
        </View>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item) => item.studentId.toString()}
          renderItem={({ item }) => (
            <ChildCard item={item} onPress={() => handleCardPress(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.screenHeader}>
              <Text style={styles.title}>My Children</Text>
              <Text style={styles.subtitle}>
                Select a child profile to view academic details and metrics
              </Text>
            </View>
          }
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ParentChildren;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Navbar Styling
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 38,
    resizeMode: "contain",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
  },

  // Screen Header
  screenHeader: {
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 20,
  },

  // List & Cards
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    flexGrow: 1,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },
  avatarInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary || "#2563EB",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  headerTextContainer: {
    flex: 1,
  },
  childName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    marginRight: 4,
  },
  badgeValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
  chevronWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  detailText: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
    fontWeight: "400",
  },

  // State Views
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});
