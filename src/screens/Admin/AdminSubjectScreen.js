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
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const AdminSubjectScreen = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const fetchSubjects = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/Admin/all-subjects`
      );

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
        Alert.alert(
          "Error",
          result?.message || "Failed to load subjects"
        );
      }
    } catch (error) {
      console.log("Fetch Subjects Error:", error);

      Alert.alert(
        "Error",
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
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
      Alert.alert(
        "Error",
        "Please enter course name"
      );
      return;
    }

    // -----------------------------
    // Minimum rate validation
    // -----------------------------
    if (!minRate.trim()) {
      Alert.alert(
        "Error",
        "Please enter minimum rate"
      );
      return;
    }

    // -----------------------------
    // Maximum rate validation
    // -----------------------------
    if (!maxRate.trim()) {
      Alert.alert(
        "Error",
        "Please enter maximum rate"
      );
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
    if (
      Number.isNaN(minimumRate) ||
      Number.isNaN(maximumRate)
    ) {
      Alert.alert(
        "Error",
        "Please enter valid rates"
      );
      return;
    }

    // -----------------------------
    // Check negative values
    // -----------------------------
    if (
      minimumRate < 0 ||
      maximumRate < 0
    ) {
      Alert.alert(
        "Error",
        "Rates cannot be negative"
      );
      return;
    }

    // -----------------------------
    // Check min <= max
    // -----------------------------
    if (minimumRate > maximumRate) {
      Alert.alert(
        "Error",
        "Minimum rate cannot be greater than maximum rate"
      );
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

      console.log(
        "Add Subject Request:",
        requestBody
      );

      const response = await fetch(
        `${BASE_URL}/Admin/add-subject`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify(requestBody),
        }
      );

      // =====================================================
      // Read response safely
      // =====================================================
      let result = {};

      try {
        result = await response.json();
      } catch (jsonError) {
        console.log(
          "Response JSON Error:",
          jsonError
        );
      }

      console.log(
        "Add Subject Response:",
        result
      );

      // =====================================================
      // SUCCESS
      // =====================================================
      if (response.ok) {
        Alert.alert(
          "Success",
          result?.message ||
            "Subject added successfully"
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
          result?.message ||
            result?.error ||
            "Failed to add subject"
        );
      }
    } catch (error) {
      console.log(
        "Add Subject Error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to connect to server"
      );
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
                console.log(
                  "Delete JSON Error:",
                  jsonError
                );
              }

              console.log(
                "Delete Subject Response:",
                result
              );

              if (response.ok) {
                setSubjects((prev) =>
                  prev.filter(
                    (item) =>
                      item.id !== id &&
                      item.courseId !== id
                  )
                );

                Alert.alert(
                  "Success",
                  result?.message ||
                    "Subject deleted successfully"
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
              console.log(
                "Delete Subject Error:",
                error
              );

              Alert.alert(
                "Error",
                "Unable to connect to server"
              );
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

  // =========================================================
  // SUBJECT ITEM
  // =========================================================
  const renderItem = ({ item }) => {
    /*
      Depending on your backend response, the ID may be:
      item.id
      OR
      item.courseId

      Same for title:
      item.courseTitle
    */

    const subjectId =
      item.id ?? item.courseId;

    const title =
      item.courseTitle ??
      item.name ??
      "Unknown Subject";

    const itemMinRate =
      item.minRate ??
      item.adminSetMinHourlyRate;

    const itemMaxRate =
      item.maxRate ??
      item.adminSetMaxHourlyRate;

    return (
      <View style={styles.card}>
        {/* ================= SUBJECT INFORMATION ================= */}
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectText}>
            {title}
          </Text>

          {/* Minimum Rate */}
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>
              Min Rate:
            </Text>

            <Text style={styles.rateValue}>
              {itemMinRate !== null &&
              itemMinRate !== undefined
                ? `Rs. ${itemMinRate}`
                : "Not Set"}
            </Text>
          </View>

          {/* Maximum Rate */}
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>
              Max Rate:
            </Text>

            <Text style={styles.rateValue}>
              {itemMaxRate !== null &&
              itemMaxRate !== undefined
                ? `Rs. ${itemMaxRate}`
                : "Not Set"}
            </Text>
          </View>
        </View>

        {/* ================= DELETE ================= */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() =>
              handleDelete(subjectId)
            }
            disabled={!subjectId}
          >
            <Icon
              name="delete"
              size={24}
              color="#B71C1C"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#EDE7F6"
      />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
        >
          <Icon
            name="arrow-back"
            size={26}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          onPress={fetchSubjects}
          disabled={loading}
        >
          <Icon
            name="refresh"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* ================= TITLE ================= */}
      <Text style={styles.title}>
        Subjects
      </Text>

      <Text style={styles.subtitle}>
        Manage your curriculum, minimum
        and maximum tutor rates
      </Text>

      {/* ================= SUBJECT LIST ================= */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item, index) =>
            String(
              item.id ??
                item.courseId ??
                index
            )
          }
          renderItem={renderItem}
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No subjects available
            </Text>
          }
        />
      )}

      {/* ================= ADD BUTTON ================= */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={openAddModal}
      >
        <Icon
          name="add"
          size={20}
          color="#fff"
        />

        <Text style={styles.addText}>
          Add Subject
        </Text>
      </TouchableOpacity>

      {/* =====================================================
          ADD SUBJECT MODAL
          ===================================================== */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.modalBox}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ================= MODAL HEADER ================= */}
              <View style={styles.modalHeader}>
                <Text
                  style={styles.modalTitle}
                >
                  Add Subject
                </Text>

                <TouchableOpacity
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Icon
                    name="close"
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* ================= COURSE TITLE ================= */}
              <Text style={styles.fieldLabel}>
                Course Name
              </Text>

              <TextInput
                placeholder="Enter course name"
                placeholderTextColor="#999"
                value={courseTitle}
                onChangeText={setCourseTitle}
                style={styles.input}
                editable={!saving}
                autoCapitalize="words"
              />

              {/* ================= MIN RATE ================= */}
              <Text style={styles.fieldLabel}>
                Minimum Rate
              </Text>

              <TextInput
                placeholder="Enter minimum hourly rate"
                placeholderTextColor="#999"
                value={minRate}
                onChangeText={(text) => {
                  // Allow only numbers and decimal point
                  const cleanedText =
                    text.replace(
                      /[^0-9.]/g,
                      ""
                    );

                  // Allow only one decimal point
                  const parts =
                    cleanedText.split(".");

                  if (parts.length > 2) {
                    return;
                  }

                  setMinRate(cleanedText);
                }}
                style={styles.input}
                keyboardType="decimal-pad"
                editable={!saving}
              />

              {/* ================= MAX RATE ================= */}
              <Text style={styles.fieldLabel}>
                Maximum Rate
              </Text>

              <TextInput
                placeholder="Enter maximum hourly rate"
                placeholderTextColor="#999"
                value={maxRate}
                onChangeText={(text) => {
                  // Allow only numbers and decimal point
                  const cleanedText =
                    text.replace(
                      /[^0-9.]/g,
                      ""
                    );

                  // Allow only one decimal point
                  const parts =
                    cleanedText.split(".");

                  if (parts.length > 2) {
                    return;
                  }

                  setMaxRate(cleanedText);
                }}
                style={styles.input}
                keyboardType="decimal-pad"
                editable={!saving}
              />

              {/* ================= RATE INFORMATION ================= */}
              <View style={styles.infoBox}>
                <Icon
                  name="info-outline"
                  size={20}
                  color={colors.primary}
                />

                <Text
                  style={styles.infoText}
                >
                  The minimum rate cannot be
                  greater than the maximum
                  rate.
                </Text>
              </View>

              {/* ================= BUTTONS ================= */}
              <View
                style={styles.modalButtons}
              >
                {/* CANCEL */}
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.cancelBtn,
                  ]}
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Text
                    style={
                      styles.modalBtnText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                {/* SAVE */}
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.saveBtn,
                  ]}
                  onPress={
                    handleAddSubject
                  }
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                    />
                  ) : (
                    <Text
                      style={
                        styles.modalBtnText
                      }
                    >
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= BOTTOM NAVIGATION ================= */}
      <View style={styles.bottomNav}>
        {/* HOME */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              "AdminHome"
            )
          }
        >
          <Icon
            name="home"
            size={24}
            color="#999"
          />

          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        {/* TEACHER */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              "AdminApprovedTutor"
            )
          }
        >
          <Icon
            name="groups"
            size={24}
            color="#999"
          />

          <Text style={styles.navText}>
            Teacher
          </Text>
        </TouchableOpacity>

        {/* STUDENT */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              "AdminStudent"
            )
          }
        >
          <Icon
            name="school"
            size={24}
            color="#999"
          />

          <Text style={styles.navText}>
            Student
          </Text>
        </TouchableOpacity>

        {/* SUBJECT */}
        <TouchableOpacity
          style={styles.navItem}
        >
          <Icon
            name="menu-book"
            size={24}
            color={colors.primary}
          />

          <Text
            style={styles.navTextActive}
          >
            Subject
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AdminSubjectScreen;

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE7F6",
    paddingHorizontal: 16,
  },

  // ================= HEADER =================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
  },

  logo: {
    width: 120,
    height: 45,
  },

  // ================= TITLE =================

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 15,
    color: "#333",
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },

  // ================= CARD =================

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },

  subjectInfo: {
    flex: 1,
    paddingRight: 10,
  },

  subjectText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  rateLabel: {
    fontSize: 13,
    color: "#777",
    width: 85,
  },

  rateValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
  },

  // ================= LIST =================

  listContent: {
    paddingBottom: 130,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    color: "#777",
  },

  // ================= ADD BUTTON =================

  addButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 5,
  },

  addText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
  },

  // ================= BOTTOM NAV =================

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderColor: "#ddd",
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  navTextActive: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },

  // ================= MODAL =================

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 15,
  },

  modalBox: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },

  // ================= FORM =================

  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
    color: "#333",
    backgroundColor: "#fff",
    fontSize: 15,
  },

  // ================= INFO =================

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F3EFFA",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    lineHeight: 18,
  },

  // ================= MODAL BUTTONS =================

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
  },

  modalBtn: {
    minWidth: 90,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  cancelBtn: {
    backgroundColor: "#999",
  },

  saveBtn: {
    backgroundColor: colors.primary,
  },

  modalBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});







































// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   StatusBar,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   TextInput,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";

// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const AdminSubjectScreen = ({ navigation }) => {
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [modalVisible, setModalVisible] =
//     useState(false);

//   const [courseTitle, setCourseTitle] =
//     useState("");

//   // ================= FETCH SUBJECTS =================
//   const fetchSubjects = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch(
//         `${BASE_URL}/Admin/all-subjects`
//       );

//       const result = await response.json();

//       console.log("Subjects Response:", result);

//       if (response.ok) {
//         setSubjects(result);
//       } else {
//         Alert.alert(
//           "Error",
//           result.message ||
//             "Failed to load subjects"
//         );
//       }
//     } catch (error) {
//       console.log(
//         "Fetch Subjects Error:",
//         error
//       );

//       Alert.alert(
//         "Error",
//         "Unable to connect to server"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= ADD SUBJECT =================
//   const handleAddSubject = async () => {
//     try {
//       if (!courseTitle.trim()) {
//         Alert.alert(
//           "Error",
//           "Please enter subject name"
//         );
//         return;
//       }

//       const response = await fetch(
//         `${BASE_URL}/Admin/add-subject`,
//         {
//           method: "POST",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           body: JSON.stringify({
//             courseTitle: courseTitle,
//           }),
//         }
//       );

//       const result = await response.json();

//       if (response.ok) {
//         Alert.alert(
//           "Success",
//           "Subject added successfully"
//         );

//         setCourseTitle("");
//         setModalVisible(false);

//         fetchSubjects();
//       } else {
//         Alert.alert(
//           "Error",
//           result.message ||
//             "Failed to add subject"
//         );
//       }
//     } catch (error) {
//       console.log(
//         "Add Subject Error:",
//         error
//       );

//       Alert.alert(
//         "Error",
//         "Unable to connect to server"
//       );
//     }
//   };

//   // ================= DELETE SUBJECT =================
//   const handleDelete = (id) => {
//     Alert.alert(
//       "Delete Subject",
//       "Are you sure you want to delete this subject?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Delete",

//           onPress: async () => {
//             try {
//               const response =
//                 await fetch(
//                   `${BASE_URL}/Admin/delete-subject/${id}`,
//                   {
//                     method: "DELETE",
//                   }
//                 );

//               const result =
//                 await response.json();

//               if (response.ok) {
//                 setSubjects((prev) =>
//                   prev.filter(
//                     (item) =>
//                       item.id !== id
//                   )
//                 );

//                 Alert.alert(
//                   "Success",
//                   "Subject deleted successfully"
//                 );
//               } else {
//                 Alert.alert(
//                   "Error",
//                   result.message ||
//                     "Failed to delete subject"
//                 );
//               }
//             } catch (error) {
//               console.log(
//                 "Delete Subject Error:",
//                 error
//               );

//               Alert.alert(
//                 "Error",
//                 "Unable to connect to server"
//               );
//             }
//           },
//         },
//       ]
//     );
//   };

//   useEffect(() => {
//     fetchSubjects();
//   }, []);

//   // ================= SUBJECT ITEM =================
//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View>
//         <Text style={styles.subjectText}>
//           {item.courseTitle}
//         </Text>

//         {/* <Text style={styles.subText}>
//           Subject ID: {item.id}
//         </Text> */}
//       </View>

//       <View style={styles.actions}>
//         <TouchableOpacity
//           onPress={() =>
//             handleDelete(item.id)
//           }
//         >
//           <Icon
//             name="delete"
//             size={24}
//             color="#B71C1C"
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() =>
//             navigation.goBack()
//           }
//         >
//           <Icon
//             name="arrow-back"
//             size={26}
//             color={colors.primary}
//           />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={{ width: 26 }} />
//       </View>

//       {/* Title */}
//       <Text style={styles.title}>
//         Subjects
//       </Text>

//       <Text style={styles.subtitle}>
//         Manage your curriculum and
//         categories
//       </Text>

//       {/* Subject List */}
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator
//             size="large"
//             color={colors.primary}
//           />
//         </View>
//       ) : (
//         <FlatList
//           data={subjects}
//           keyExtractor={(item) =>
//             item.id.toString()
//           }
//           renderItem={renderItem}
//           contentContainerStyle={{
//             paddingBottom: 120,
//           }}
//           showsVerticalScrollIndicator={
//             false
//           }
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>
//               No subjects available
//             </Text>
//           }
//         />
//       )}

//       {/* ADD SUBJECT BUTTON */}
//       <TouchableOpacity
//         style={styles.addButton}
//         onPress={() =>
//           setModalVisible(true)
//         }
//       >
//         <Icon
//           name="add"
//           size={20}
//           color="#fff"
//         />

//         <Text style={styles.addText}>
//           Add Subject
//         </Text>
//       </TouchableOpacity>

//       {/* ADD SUBJECT MODAL */}
//       <Modal
//         visible={modalVisible}
//         transparent={true}
//         animationType="slide"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalBox}>
//             <Text style={styles.modalTitle}>
//               Add Subject
//             </Text>

//             <TextInput
//               placeholder="Enter subject name"
//               value={courseTitle}
//               onChangeText={
//                 setCourseTitle
//               }
//               style={styles.input}
//             />

//             <View
//               style={styles.modalButtons}
//             >
//               <TouchableOpacity
//                 style={[
//                   styles.modalBtn,
//                   {
//                     backgroundColor:
//                       "#999",
//                   },
//                 ]}
//                 onPress={() => {
//                   setModalVisible(
//                     false
//                   );

//                   setCourseTitle("");
//                 }}
//               >
//                 <Text
//                   style={
//                     styles.modalBtnText
//                   }
//                 >
//                   Cancel
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.modalBtn}
//                 onPress={
//                   handleAddSubject
//                 }
//               >
//                 <Text
//                   style={
//                     styles.modalBtnText
//                   }
//                 >
//                   Save
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate(
//               "AdminHome"
//             )
//           }
//         >
//           <Icon
//             name="home"
//             size={24}
//             color="#999"
//           />

//           <Text style={styles.navText}>
//             Home
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate(
//               "AdminTutor"
//             )
//           }
//         >
//           <Icon
//             name="groups"
//             size={24}
//             color="#999"
//           />

//           <Text style={styles.navText}>
//             Teacher
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate(
//               "AdminStudent"
//             )
//           }
//         >
//           <Icon
//             name="school"
//             size={24}
//             color="#999"
//           />

//           <Text style={styles.navText}>
//             Student
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//         >
//           <Icon
//             name="menu-book"
//             size={24}
//             color={colors.primary}
//           />

//           <Text style={styles.navTextActive}>
//             Subject
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default AdminSubjectScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EDE7F6",
//     paddingHorizontal: 16,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 40,
//   },

//   logo: {
//     width: 120,
//     height: 45,
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginTop: 15,
//     color: "#333",
//   },

//   subtitle: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 15,
//   },

//   card: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 12,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     elevation: 3,
//   },

//   subjectText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },

//   subText: {
//     fontSize: 13,
//     color: "#777",
//     marginTop: 3,
//   },

//   actions: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 15,
//     color: "#777",
//   },

//   addButton: {
//     position: "absolute",
//     bottom: 80,
//     right: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 18,
//     borderRadius: 30,
//     elevation: 5,
//   },

//   addText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginLeft: 5,
//   },

//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     backgroundColor: "#fff",
//     borderTopWidth: 0.5,
//     borderColor: "#ddd",
//   },

//   navItem: {
//     alignItems: "center",
//   },

//   navText: {
//     fontSize: 12,
//     color: "#999",
//     marginTop: 2,
//   },

//   navTextActive: {
//     fontSize: 12,
//     color: colors.primary,
//     fontWeight: "600",
//     marginTop: 2,
//   },

//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor:
//       "rgba(0,0,0,0.5)",
//   },

//   modalBox: {
//     width: "85%",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//   },

//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginBottom: 15,
//     color: "#333",
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     height: 50,
//     marginBottom: 20,
//   },

//   modalButtons: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//   },

//   modalBtn: {
//     backgroundColor: colors.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderRadius: 10,
//     marginLeft: 10,
//   },

//   modalBtnText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });




























// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   FlatList,
// //   TouchableOpacity,
// //   Image,
// //   StatusBar,
// //   ActivityIndicator,
// //   Alert,
// // } from "react-native";
// // import Icon from "react-native-vector-icons/MaterialIcons";
// // import colors from "../utils/colors";

// // const AdminSubjectScreen = ({ navigation }) => {
// //   const [subjects, setSubjects] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   // ================= FETCH SUBJECTS API =================
// //   const fetchSubjects = async () => {
// //     try {
// //       setLoading(true);

// //       const response = await fetch(
// //         "http://YOUR_IP_ADDRESS:5000/api/Subject"
// //       );

// //       const result = await response.json();

// //       if (response.ok) {
// //         setSubjects(result);
// //       } else {
// //         Alert.alert("Error", "Failed to load subjects");
// //       }
// //     } catch (error) {
// //       console.log("Fetch Subjects Error:", error);
// //       Alert.alert("Error", "Unable to connect to server");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ================= DELETE SUBJECT API =================
// //   const handleDelete = (id) => {
// //     Alert.alert(
// //       "Delete Subject",
// //       "Are you sure you want to delete this subject?",
// //       [
// //         {
// //           text: "Cancel",
// //           style: "cancel",
// //         },
// //         {
// //           text: "Delete",
// //           onPress: async () => {
// //             try {
// //               const response = await fetch(
// //                 `http://YOUR_IP_ADDRESS:5000/api/Subject/${id}`,
// //                 {
// //                   method: "DELETE",
// //                 }
// //               );

// //               if (response.ok) {
// //                 setSubjects((prevSubjects) =>
// //                   prevSubjects.filter((item) => item.id !== id)
// //                 );
// //                 Alert.alert("Success", "Subject deleted successfully");
// //               } else {
// //                 Alert.alert("Error", "Failed to delete subject");
// //               }
// //             } catch (error) {
// //               console.log("Delete Subject Error:", error);
// //               Alert.alert("Error", "Unable to connect to server");
// //             }
// //           },
// //         },
// //       ]
// //     );
// //   };

// //   useEffect(() => {
// //     fetchSubjects();
// //   }, []);

// //   const renderItem = ({ item }) => (
// //     <View style={styles.card}>
// //       <View>
// //         <Text style={styles.subjectText}>{item.name}</Text>
// //         <Text style={styles.subText}>
// //           Code: {item.code || "Not Available"}
// //         </Text>
// //       </View>

// //       <View style={styles.actions}>
// //         <TouchableOpacity
// //           onPress={() =>
// //             navigation.navigate("EditSubject", {
// //               subjectId: item.id,
// //             })
// //           }
// //         >
// //           <Icon name="edit" size={22} color={colors.primary} />
// //         </TouchableOpacity>

// //         <TouchableOpacity onPress={() => handleDelete(item.id)}>
// //           <Icon name="delete" size={22} color="#B71C1C" />
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StatusBar barStyle="dark-content" />

// //       {/* Header */}
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()}>
// //           <Icon name="arrow-back" size={26} color={colors.primary} />
// //         </TouchableOpacity>

// //         <Image
// //           source={require("../../../assets/images/logo.png")}
// //           style={styles.logo}
// //           resizeMode="contain"
// //         />

// //         <TouchableOpacity onPress={fetchSubjects}>
// //           <Icon name="refresh" size={24} color={colors.primary} />
// //         </TouchableOpacity>
// //       </View>

// //       {/* Title */}
// //       <Text style={styles.title}>Subjects</Text>
// //       <Text style={styles.subtitle}>
// //         Manage your curriculum and categories
// //       </Text>

// //       {/* List */}
// //       {loading ? (
// //         <View style={styles.loaderContainer}>
// //           <ActivityIndicator size="large" color={colors.primary} />
// //         </View>
// //       ) : (
// //         <FlatList
// //           data={subjects}
// //           keyExtractor={(item) => item.id.toString()}
// //           renderItem={renderItem}
// //           contentContainerStyle={{ paddingBottom: 120 }}
// //           showsVerticalScrollIndicator={false}
// //           ListEmptyComponent={
// //             <Text style={styles.emptyText}>No subjects available</Text>
// //           }
// //         />
// //       )}

// //       {/* Add Button */}
// //       <TouchableOpacity
// //         style={styles.addButton}
// //         onPress={() => navigation.navigate("AddSubject")}
// //       >
// //         <Icon name="add" size={20} color="#fff" />
// //         <Text style={styles.addText}>Add Subject</Text>
// //       </TouchableOpacity>

// //       {/* Bottom Navigation */}
// //       <View style={styles.bottomNav}>
// //         <TouchableOpacity
// //           style={styles.navItem}
// //           onPress={() => navigation.navigate("AdminHome")}
// //         >
// //           <Icon name="home" size={24} color="#999" />
// //           <Text style={styles.navText}>Home</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={styles.navItem}
// //           onPress={() => navigation.navigate("AdminTutor")}
// //         >
// //           <Icon name="groups" size={24} color="#999" />
// //           <Text style={styles.navText}>Teacher</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={styles.navItem}
// //           onPress={() => navigation.navigate("AdminStudent")}
// //         >
// //           <Icon name="school" size={24} color="#999" />
// //           <Text style={styles.navText}>Student</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity style={styles.navItem}>
// //           <Icon name="menu-book" size={24} color={colors.primary} />
// //           <Text style={styles.navTextActive}>Subject</Text>
// //         </TouchableOpacity>
// //       </View>
// //     </SafeAreaView>
// //   );
// // };

// // export default AdminSubjectScreen;

// // /* ================= STYLES ================= */

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#EDE7F6",
// //     paddingHorizontal: 16,
// //   },

// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     marginTop: 40,
// //   },

// //   logo: {
// //     width: 120,
// //     height: 45,
// //   },

// //   title: {
// //     fontSize: 22,
// //     fontWeight: "700",
// //     marginTop: 15,
// //     color: "#333",
// //   },

// //   subtitle: {
// //     fontSize: 14,
// //     color: "#666",
// //     marginBottom: 15,
// //   },

// //   card: {
// //     backgroundColor: "#fff",
// //     padding: 16,
// //     borderRadius: 16,
// //     marginBottom: 12,
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     elevation: 3,
// //   },

// //   subjectText: {
// //     fontSize: 16,
// //     fontWeight: "600",
// //     color: "#333",
// //   },

// //   subText: {
// //     fontSize: 13,
// //     color: "#777",
// //     marginTop: 3,
// //   },

// //   actions: {
// //     flexDirection: "row",
// //     gap: 15,
// //   },

// //   loaderContainer: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },

// //   emptyText: {
// //     textAlign: "center",
// //     marginTop: 40,
// //     fontSize: 15,
// //     color: "#777",
// //   },

// //   addButton: {
// //     position: "absolute",
// //     bottom: 80,
// //     right: 20,
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: colors.primary,
// //     paddingVertical: 10,
// //     paddingHorizontal: 16,
// //     borderRadius: 30,
// //     elevation: 5,
// //   },

// //   addText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //     marginLeft: 5,
// //   },

// //   bottomNav: {
// //     position: "absolute",
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     flexDirection: "row",
// //     justifyContent: "space-around",
// //     alignItems: "center",
// //     paddingVertical: 10,
// //     backgroundColor: "#fff",
// //     borderTopWidth: 0.5,
// //     borderColor: "#ddd",
// //   },

// //   navItem: {
// //     alignItems: "center",
// //   },

// //   navText: {
// //     fontSize: 12,
// //     color: "#999",
// //     marginTop: 2,
// //   },

// //   navTextActive: {
// //     fontSize: 12,
// //     color: colors.primary,
// //     fontWeight: "600",
// //     marginTop: 2,
// //   },
// // });
















































// // import React, { useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   FlatList,
// //   TouchableOpacity,
// //   Image,
// //   StatusBar,
// // } from "react-native";
// // import Icon from "react-native-vector-icons/MaterialIcons";
// // import colors from "../utils/colors";

// // const initialSubjects = [
// //   { id: "1", name: "Mathematics" },
// //   { id: "2", name: "Physics" },
// //   { id: "3", name: "Computer Network" },
// //   { id: "4", name: "Operating System" },
// //   { id: "5", name: "Web Technology" },
// // ];

// // const AdminSubjectScreen = ({ navigation }) => {
// //   const [subjects, setSubjects] = useState(initialSubjects);

// //   const handleDelete = (id) => {
// //     setSubjects(subjects.filter((item) => item.id !== id));
// //   };

// //   const renderItem = ({ item }) => (
// //     <View style={styles.card}>
// //       <Text style={styles.subjectText}>{item.name}</Text>

// //       <View style={styles.actions}>
// //         <TouchableOpacity
// //           onPress={() =>
// //             navigation.navigate("EditSubject", { subject: item })
// //           }
// //         >
// //           <Icon name="edit" size={22} color={colors.primary} />
// //         </TouchableOpacity>

// //         <TouchableOpacity onPress={() => handleDelete(item.id)}>
// //           <Icon name="delete" size={22} color="#B71C1C" />
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StatusBar barStyle="dark-content" />

// //       {/* Header */}
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()}>
// //           <Icon name="arrow-back" size={26} color={colors.primary} />
// //         </TouchableOpacity>

// //         <Image
// //           source={require("../../../assets/images/logo.png")}
// //           style={styles.logo}
// //           resizeMode="contain"
// //         />

// //         <View style={{ width: 26 }} />
// //       </View>

// //       {/* Title */}
// //       <Text style={styles.title}>Subjects</Text>
// //       <Text style={styles.subtitle}>
// //         Manage your curriculum and categories
// //       </Text>

// //       {/* List */}
// //       <FlatList
// //         data={subjects}
// //         keyExtractor={(item) => item.id}
// //         renderItem={renderItem}
// //         contentContainerStyle={{ paddingBottom: 100 }}
// //         showsVerticalScrollIndicator={false}
// //       />

// //       {/* Add Button */}
// //       <TouchableOpacity
// //         style={styles.addButton}
// //         onPress={() => navigation.navigate("AddSubject")}
// //       >
// //         <Icon name="add" size={20} color="#fff" />
// //         <Text style={styles.addText}>Add Subject</Text>
// //       </TouchableOpacity>

// //       {/* Bottom Navigation */}
// //       <View style={styles.bottomNav}>
// //         <TouchableOpacity
// //           style={styles.navItem}
// //           onPress={() => navigation.navigate("AdminHome")}
// //         >
// //           <Icon name="home" size={24} color="#999" />
// //           <Text style={styles.navText}>Home</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={styles.navItem}
// //           onPress={() => navigation.navigate("AdminTutor")}
// //         >
// //           <Icon name="groups" size={24} color="#999" />
// //           <Text style={styles.navText}>Teacher</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={styles.navItem}
// //           onPress={() => navigation.navigate("AdminStudent")}
// //         >
// //           <Icon name="school" size={24} color="#999" />
// //           <Text style={styles.navText}>Student</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity style={styles.navItem}>
// //           <Icon name="menu-book" size={24} color={colors.primary} />
// //           <Text style={styles.navTextActive}>Subject</Text>
// //         </TouchableOpacity>
// //       </View>
// //     </SafeAreaView>
// //   );
// // };

// // export default AdminSubjectScreen;

// // /* ================= STYLES ================= */

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#EDE7F6",
// //     paddingHorizontal: 16,
// //   },

// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     marginTop: 40,
// //   },

// //   logo: {
// //     width: 120,
// //     height: 45,
// //   },

// //   title: {
// //     fontSize: 22,
// //     fontWeight: "700",
// //     marginTop: 15,
// //     color: "#333",
// //   },

// //   subtitle: {
// //     fontSize: 14,
// //     color: "#666",
// //     marginBottom: 15,
// //   },

// //   card: {
// //     backgroundColor: "#fff",
// //     padding: 16,
// //     borderRadius: 16,
// //     marginBottom: 12,
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     elevation: 3,
// //   },

// //   subjectText: {
// //     fontSize: 16,
// //     fontWeight: "600",
// //     color: "#333",
// //   },

// //   actions: {
// //     flexDirection: "row",
// //     gap: 15,
// //   },

// //   addButton: {
// //     position: "absolute",
// //     bottom: 80,
// //     right: 20,
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: colors.primary,
// //     paddingVertical: 10,
// //     paddingHorizontal: 16,
// //     borderRadius: 30,
// //     elevation: 5,
// //   },

// //   addText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //     marginLeft: 5,
// //   },

// //   bottomNav: {
// //     position: "absolute",
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     flexDirection: "row",
// //     justifyContent: "space-around",
// //     alignItems: "center",
// //     paddingVertical: 10,
// //     backgroundColor: "#fff",
// //     borderTopWidth: 0.5,
// //     borderColor: "#ddd",
// //   },

// //   navItem: {
// //     alignItems: "center",
// //   },

// //   navText: {
// //     fontSize: 12,
// //     color: "#999",
// //     marginTop: 2,
// //   },

// //   navTextActive: {
// //     fontSize: 12,
// //     color: colors.primary,
// //     fontWeight: "600",
// //     marginTop: 2,
// //   },
// // });