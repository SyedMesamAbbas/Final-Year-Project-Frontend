import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const PRIMARY_COLOR = colors?.primary || "#4F46E5";

const AdminSubjectScreen = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ================= MODAL =================
  const [modalVisible, setModalVisible] = useState(false);

  // ================= FORM =================
  const [courseTitle, setCourseTitle] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");

  // ================= SAVE LOADING =================
  const [saving, setSaving] = useState(false);

  // =========================================================
  // FETCH SUBJECTS
  // =========================================================
  const fetchSubjects = async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${BASE_URL}/Admin/all-subjects`);
      const result = await response.json();

      console.log("Subjects Response:", result);

      if (response.ok) {
        // Make sure result is an array
        if (Array.isArray(result)) {
          setSubjects(result);
        } else if (Array.isArray(result?.data)) {
          setSubjects(result.data);
        } else {
          setSubjects([]);
        }
      } else {
        Alert.alert("Error", result?.message || "Failed to load subjects");
      }
    } catch (error) {
      console.log("Fetch Subjects Error:", error);

      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================
  const resetForm = () => {
    setCourseTitle("");
    setMinRate("");
    setMaxRate("");
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================
  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalVisible(false);
    resetForm();
  };

  // =========================================================
  // ADD SUBJECT
  // =========================================================
  const handleAddSubject = async () => {
    // -----------------------------
    // Course title validation
    // -----------------------------
    if (!courseTitle.trim()) {
      Alert.alert("Error", "Please enter course name");
      return;
    }

    // -----------------------------
    // Minimum rate validation
    // -----------------------------
    if (!minRate.trim()) {
      Alert.alert("Error", "Please enter minimum rate");
      return;
    }

    // -----------------------------
    // Maximum rate validation
    // -----------------------------
    if (!maxRate.trim()) {
      Alert.alert("Error", "Please enter maximum rate");
      return;
    }

    // -----------------------------
    // Convert rates to numbers
    // -----------------------------
    const minimumRate = Number(minRate);
    const maximumRate = Number(maxRate);

    // -----------------------------
    // Check valid numbers
    // -----------------------------
    if (Number.isNaN(minimumRate) || Number.isNaN(maximumRate)) {
      Alert.alert("Error", "Please enter valid rates");
      return;
    }

    // -----------------------------
    // Check negative values
    // -----------------------------
    if (minimumRate < 0 || maximumRate < 0) {
      Alert.alert("Error", "Rates cannot be negative");
      return;
    }

    // -----------------------------
    // Check min <= max
    // -----------------------------
    if (minimumRate > maximumRate) {
      Alert.alert("Error", "Minimum rate cannot be greater than maximum rate");
      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // REQUEST BODY
      // Must match AddSubjectDTO
      // =====================================================
      const requestBody = {
        courseTitle: courseTitle.trim(),
        minRate: minimumRate,
        maxRate: maximumRate,
      };

      console.log("Add Subject Request:", requestBody);

      const response = await fetch(`${BASE_URL}/Admin/add-subject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // =====================================================
      // Read response safely
      // =====================================================
      let result = {};

      try {
        result = await response.json();
      } catch (jsonError) {
        console.log("Response JSON Error:", jsonError);
      }

      console.log("Add Subject Response:", result);

      // =====================================================
      // SUCCESS
      // =====================================================
      if (response.ok) {
        Alert.alert(
          "Success",
          result?.message || "Subject added successfully"
        );

        resetForm();
        setModalVisible(false);

        // Refresh list
        await fetchSubjects();
      } else {
        // ===================================================
        // BACKEND ERROR
        // ===================================================
        Alert.alert(
          "Error",
          result?.message || result?.error || "Failed to add subject"
        );
      }
    } catch (error) {
      console.log("Add Subject Error:", error);

      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE SUBJECT
  // =========================================================
  const handleDelete = (id) => {
    Alert.alert(
      "Delete Subject",
      "Are you sure you want to delete this subject?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${BASE_URL}/Admin/delete-subject/${id}`,
                {
                  method: "DELETE",
                  headers: {
                    Accept: "application/json",
                  },
                }
              );

              let result = {};

              try {
                result = await response.json();
              } catch (jsonError) {
                console.log("Delete JSON Error:", jsonError);
              }

              console.log("Delete Subject Response:", result);

              if (response.ok) {
                setSubjects((prev) =>
                  prev.filter(
                    (item) => item.id !== id && item.courseId !== id
                  )
                );

                Alert.alert(
                  "Success",
                  result?.message || "Subject deleted successfully"
                );
              } else {
                Alert.alert(
                  "Error",
                  result?.message ||
                    result?.error ||
                    "Failed to delete subject"
                );
              }
            } catch (error) {
              console.log("Delete Subject Error:", error);

              Alert.alert("Error", "Unable to connect to server");
            }
          },
        },
      ]
    );
  };

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================
  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  // =========================================================
  // FETCH ON SCREEN LOAD
  // =========================================================
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Helper function to extract initials or icon label
  const getSubjectIconText = (name) => {
    if (!name) return "SB";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // =========================================================
  // SUBJECT ITEM
  // =========================================================
  const renderItem = ({ item, index }) => {
    const subjectId = item.id ?? item.courseId;

    const title = item.courseTitle ?? item.name ?? "Unknown Subject";

    const itemMinRate = item.minRate ?? item.adminSetMinHourlyRate;

    const itemMaxRate = item.maxRate ?? item.adminSetMaxHourlyRate;

    return (
      <View style={styles.card}>
        {/* Card Header & Avatar Badge */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getSubjectIconText(title)}</Text>
          </View>

          <View style={styles.titleWrapper}>
            <Text style={styles.subjectText} numberOfLines={2}>
              {title}
            </Text>
            {/* <Text style={styles.subjectIdBadge}>
              ID: #{subjectId ?? index + 1}
            </Text> */}
          </View>

          {/* Delete Action Button */}
          <TouchableOpacity
            style={styles.deleteIconButton}
            onPress={() => handleDelete(subjectId)}
            disabled={!subjectId}
            activeOpacity={0.7}
          >
            <Icon name="delete-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardDivider} />

        {/* Rates Display Grid */}
        <View style={styles.ratesContainer}>
          {/* Minimum Rate Pill */}
          <View style={[styles.rateBadge, styles.minRateBadge]}>
            <View style={styles.rateHeader}>
              <Icon name="trending-down" size={14} color="#059669" />
              <Text style={styles.rateLabel}>Min Rate</Text>
            </View>
            <Text style={styles.rateValueMin}>
              {itemMinRate !== null && itemMinRate !== undefined
                ? `Rs. ${itemMinRate.toLocaleString()}`
                : "Not Set"}
            </Text>
          </View>

          {/* Maximum Rate Pill */}
          <View style={[styles.rateBadge, styles.maxRateBadge]}>
            <View style={styles.rateHeader}>
              <Icon name="trending-up" size={14} color="#4F46E5" />
              <Text style={styles.rateLabel}>Max Rate</Text>
            </View>
            <Text style={styles.rateValueMax}>
              {itemMaxRate !== null && itemMaxRate !== undefined
                ? `Rs. ${itemMaxRate.toLocaleString()}`
                : "Not Set"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back-ios" size={18} color="#1E293B" />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => fetchSubjects()}
          disabled={loading || refreshing}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={22} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      {/* ================= TITLE & OVERVIEW BANNER ================= */}
      <View style={styles.topSection}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Subject Management</Text>
            <Text style={styles.subtitle}>
              Configure curriculum subjects and tutor hourly rate boundaries
            </Text>
          </View>
        </View>

        {/* Quick Stats Chip */}
        <View style={styles.statsBanner}>
          <View style={styles.statsItem}>
            <Icon name="library-books" size={18} color={PRIMARY_COLOR} />
            <Text style={styles.statsText}>
              Total Subjects:{" "}
              <Text style={styles.statsCount}>{subjects.length}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addInlineButton}
            onPress={openAddModal}
            activeOpacity={0.8}
          >
            <Icon name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addInlineButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= SUBJECT LIST ================= */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loaderText}>Loading subjects...</Text>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item, index) =>
            String(item.id ?? item.courseId ?? index)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSubjects(true)}
              colors={[PRIMARY_COLOR]}
              tintColor={PRIMARY_COLOR}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon name="menu-book" size={48} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Subjects Found</Text>
              <Text style={styles.emptySubtext}>
                Get started by creating your first curriculum subject with min
                and max tutor rates.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={openAddModal}
                activeOpacity={0.8}
              >
                <Icon name="add" size={18} color="#FFFFFF" />
                <Text style={styles.emptyActionText}>Add Subject</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* ================= FLOATING ADD BUTTON ================= */}
      {subjects.length > 0 && !loading && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={openAddModal}
          activeOpacity={0.85}
        >
          <Icon name="add" size={22} color="#FFF" />
          <Text style={styles.fabText}>Add Subject</Text>
        </TouchableOpacity>
      )}

      {/* =====================================================
          ADD SUBJECT MODAL
          ===================================================== */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={closeModal}
            disabled={saving}
          />

          <View style={styles.modalCard}>
            {/* Modal Top Handle / Indicator */}
            <View style={styles.modalHandle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* ================= MODAL HEADER ================= */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <View style={styles.modalIconContainer}>
                    <Icon name="add-task" size={22} color={PRIMARY_COLOR} />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Add New Subject</Text>
                    <Text style={styles.modalSubtitle}>
                      Specify name and rate constraints
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeIconButton}
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Icon name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                {/* ================= COURSE TITLE ================= */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>
                    Course Name <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="book"
                      size={20}
                      color="#94A3B8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="e.g. Mathematics, Physics..."
                      placeholderTextColor="#94A3B8"
                      value={courseTitle}
                      onChangeText={setCourseTitle}
                      style={styles.input}
                      editable={!saving}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Rates Row (Min & Max) */}
                <View style={styles.ratesInputRow}>
                  {/* ================= MIN RATE ================= */}
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>
                      Min Rate (PKR) <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Icon
                        name="arrow-downward"
                        size={18}
                        color="#059669"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="e.g. 500"
                        placeholderTextColor="#94A3B8"
                        value={minRate}
                        onChangeText={(text) => {
                          const cleanedText = text.replace(/[^0-9.]/g, "");
                          const parts = cleanedText.split(".");
                          if (parts.length > 2) return;
                          setMinRate(cleanedText);
                        }}
                        style={styles.input}
                        editable={!saving}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  {/* ================= MAX RATE ================= */}
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>
                      Max Rate (PKR) <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Icon
                        name="arrow-upward"
                        size={18}
                        color={PRIMARY_COLOR}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="e.g. 2500"
                        placeholderTextColor="#94A3B8"
                        value={maxRate}
                        onChangeText={(text) => {
                          const cleanedText = text.replace(/[^0-9.]/g, "");
                          const parts = cleanedText.split(".");
                          if (parts.length > 2) return;
                          setMaxRate(cleanedText);
                        }}
                        style={styles.input}
                        editable={!saving}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Icon name="info-outline" size={16} color="#6366F1" />
                  <Text style={styles.infoBoxText}>
                    Tutors offering this subject will only be allowed to charge
                    rates within this minimum and maximum range.
                  </Text>
                </View>
              </View>

              {/* Modal Buttons */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                  disabled={saving}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    saving && styles.submitButtonDisabled,
                  ]}
                  onPress={handleAddSubject}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon name="check" size={18} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Save Subject</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= BOTTOM NAVIGATION ================= */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AdminHome")}
          activeOpacity={0.7}
        >
          <Icon name="home" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AdminApprovedTutor")}
          activeOpacity={0.7}
        >
          <Icon name="groups" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Tutors</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AdminStudent")}
          activeOpacity={0.7}
        >
          <Icon name="school" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Student</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={1.0}>
          <Icon name="menu-book" size={22} color={PRIMARY_COLOR} />
          <Text style={styles.navTextActive}>Subject</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Navigation Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 110,
    height: 36,
  },

  // Title Section & Overview
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 18,
  },
  statsBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  statsCount: {
    fontWeight: "700",
    color: "#0F172A",
  },
  addInlineButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addInlineButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // List Styling
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
  },

  // Card Design
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },
  titleWrapper: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 22,
  },
  subjectIdBadge: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },
  deleteIconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },

  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },

  // Rates Row
  ratesContainer: {
    flexDirection: "row",
    gap: 10,
  },
  rateBadge: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  minRateBadge: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  maxRateBadge: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
  },
  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  rateLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  rateValueMin: {
    fontSize: 14,
    fontWeight: "700",
    color: "#047857",
  },
  rateValueMax: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },

  // Floating Action Button
  fabButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: PRIMARY_COLOR,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    gap: 8,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Loader & Empty States
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
    gap: 6,
  },
  emptyActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  backdropTouchable: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHandle: {
    width: 38,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
  },
  modalScrollContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  closeIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  // Form Inputs
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  requiredStar: {
    color: "#EF4444",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  ratesInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: "#4338CA",
    lineHeight: 16,
  },

  // Modal Footer
  modalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    minWidth: 130,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Bottom Navigation
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 2,
  },
  navText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
    fontWeight: "500",
  },
  navTextActive: {
    fontSize: 11,
    color: PRIMARY_COLOR,
    fontWeight: "700",
    marginTop: 3,
  },
});

export default AdminSubjectScreen;
