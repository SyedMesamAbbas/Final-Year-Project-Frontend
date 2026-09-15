import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const PRIMARY_COLOR = colors?.primary || "#249688";

const DURATION_UNITS = [
  "Days",
  "Weeks",
  "Months",
];

// ======================================================
// SORT OPTIONS
// ======================================================

const SORT_OPTIONS = [
  {
    key: "institute",
    label: "Institute",
  },
  {
    key: "feedback",
    label: "Feedback",
  },
  {
    key: "grade",
    label: "Grade",
  },
  {
    key: "fee",
    label: "Fee",
  },
];

const StudentFindTutor = ({ navigation, route }) => {
  const {
    courseId,
    courseName,
    userLat,
    userLng,
  } = route.params || {};

  // ======================================================
  // STATE
  // ======================================================

  const [tutorsData, setTutorsData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Backend default sort = feedback
  const [sortBy, setSortBy] = useState("feedback");

  // ======================================================
  // MULTIPLE TUTOR SELECTION
  // ======================================================

  const [selectedTutors, setSelectedTutors] = useState([]);

  /*
   * All selected tutors must have the same day/time because
   * the backend CreateRequestDto accepts only one day and
   * one time for the complete request group.
   */
  const [selectedRequestDay, setSelectedRequestDay] =
    useState("");

  const [selectedRequestTime, setSelectedRequestTime] =
    useState("");

  // ======================================================
  // REQUEST MODAL
  // ======================================================

  const [requestModal, setRequestModal] =
    useState(false);

  // ======================================================
  // LEARNING MODE
  // ======================================================

  const [learningMode, setLearningMode] =
    useState("FullTime");

  const [learningDuration, setLearningDuration] =
    useState("");

  const [learningDurationUnit, setLearningDurationUnit] =
    useState("Weeks");

  const [requestLoading, setRequestLoading] =
    useState(false);

  // ======================================================
  // FETCH TUTORS WHEN SORT CHANGES
  // ======================================================

  useEffect(() => {
    fetchTutors(sortBy);
  }, [sortBy]);

  // ======================================================
  // FETCH TUTORS
  // ======================================================

  const fetchTutors = async (
    selectedSort = "feedback"
  ) => {
    try {
      setLoading(true);

      // --------------------------------------------------
      // VALIDATE PARAMETERS
      // --------------------------------------------------

      if (
        !courseId ||
        userLat == null ||
        userLng == null
      ) {
        Alert.alert(
          "Error",
          "Missing required location or course parameters."
        );

        navigation.goBack();
        return;
      }

      // --------------------------------------------------
      // TOKEN
      // --------------------------------------------------

      const token =
        await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Authentication Error",
          "Your login session has expired. Please login again."
        );

        setTutorsData([]);
        return;
      }

      // --------------------------------------------------
      // API URL
      // --------------------------------------------------

      const url =
        `${BASE_URL}/Student/search-by-time-location` +
        `?courseId=${encodeURIComponent(courseId)}` +
        `&userLat=${encodeURIComponent(userLat)}` +
        `&userLng=${encodeURIComponent(userLng)}` +
        `&sortBy=${encodeURIComponent(selectedSort)}`;

      console.log(
        "===================================="
      );

      console.log(
        "SEARCH TUTORS API"
      );

      console.log(
        "SORT BY:",
        selectedSort
      );

      console.log(
        "URL:",
        url
      );

      console.log(
        "===================================="
      );

      // --------------------------------------------------
      // API CALL
      // --------------------------------------------------

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // --------------------------------------------------
      // RESPONSE
      // --------------------------------------------------

      const responseText =
        await response.text();

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (error) {
        console.log(
          "JSON PARSE ERROR:",
          error
        );

        data = {
          message:
            responseText ||
            "Invalid server response.",
        };
      }

      console.log(
        "===================================="
      );

      console.log(
        "SEARCH TUTORS RESPONSE"
      );

      console.log(
        "STATUS:",
        response.status
      );

      console.log(
        "DATA:",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      console.log(
        "===================================="
      );

      // --------------------------------------------------
      // SUCCESS
      // --------------------------------------------------

      if (response.ok) {
        if (Array.isArray(data?.tutors)) {
          setTutorsData(data.tutors);
        } else {
          setTutorsData([]);
        }

        return;
      }

      // --------------------------------------------------
      // ERROR
      // --------------------------------------------------

      setTutorsData([]);

      Alert.alert(
        "Info",
        data?.message ||
          "No tutors found in your area."
      );
    } catch (error) {
      console.log(
        "===================================="
      );

      console.log(
        "FETCH TUTORS ERROR:"
      );

      console.log(error);

      console.log(
        "===================================="
      );

      setTutorsData([]);

      Alert.alert(
        "Error",
        "Unable to load available tutors."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // HELPER FUNCTIONS
  // ======================================================

  const getInstitute = (item) => {
    return (
      item?.institute ||
      "Institute unavailable"
    );
  };

  const getGrade = (item) => {
    return (
      item?.grade ||
      "N/A"
    );
  };

  // ======================================================
  // HOURLY RATE
  // ======================================================

  const getHourlyRate = (item) => {
    const value =
      item?.hourly_rate ?? 0;

    const numberValue =
      Number(value);

    return Number.isFinite(
      numberValue
    )
      ? numberValue
      : 0;
  };

  // ======================================================
  // RATING
  // ======================================================

  const getRating = (item) => {
    const value =
      item?.average_rating ?? 0;

    const numberValue =
      Number(value);

    return Number.isFinite(
      numberValue
    )
      ? numberValue
      : 0;
  };

  // ======================================================
  // REVIEW COUNT
  // ======================================================

  const getReviewCount = (item) => {
    const value =
      item?.total_reviews ?? 0;

    const numberValue =
      Number(value);

    return Number.isFinite(
      numberValue
    )
      ? numberValue
      : 0;
  };

  // ======================================================
  // CHECK IF TUTOR IS SELECTED
  // ======================================================

  const isTutorSelected = (tutorId) => {
    return selectedTutors.some(
      (tutor) =>
        Number(tutor.tutor_id) ===
        Number(tutorId)
    );
  };

  // ======================================================
  // SELECT / UNSELECT TUTOR
  // ======================================================

  const toggleTutorSelection = (item) => {
    const tutorId =
      Number(item?.tutor_id);

    if (!tutorId) {
      Alert.alert(
        "Error",
        "Invalid tutor selected."
      );

      return;
    }

    const alreadySelected =
      isTutorSelected(tutorId);

    // --------------------------------------------------
    // REMOVE TUTOR
    // --------------------------------------------------

    if (alreadySelected) {
      const updatedTutors =
        selectedTutors.filter(
          (tutor) =>
            Number(tutor.tutor_id) !==
            tutorId
        );

      setSelectedTutors(
        updatedTutors
      );

      // If no tutors remain, clear day/time
      if (updatedTutors.length === 0) {
        setSelectedRequestDay("");
        setSelectedRequestTime("");
      }

      return;
    }

    // --------------------------------------------------
    // UNAVAILABLE SLOT
    // --------------------------------------------------

    if (item?.is_available === false) {
      Alert.alert(
        "Tutor Unavailable",
        item?.availability_message ||
          "This tutor is unavailable for this slot."
      );

      return;
    }

    // --------------------------------------------------
    // CHECK DAY/TIME
    // --------------------------------------------------

    const itemDay =
      String(
        item?.day || ""
      ).trim();

    const itemTime =
      String(
        item?.time || ""
      ).trim();

    if (!itemDay || !itemTime) {
      Alert.alert(
        "Invalid Slot",
        "This tutor does not have a valid day or time slot."
      );

      return;
    }

    /*
     * Backend CreateRequestDto has only one day
     * and one time for the complete tutor group.
     *
     * Therefore all selected tutors must have
     * the same day and time.
     */
    if (
      selectedTutors.length > 0 &&
      (
        selectedRequestDay !== itemDay ||
        selectedRequestTime !== itemTime
      )
    ) {
      Alert.alert(
        "Different Time Slot",
        `Please select tutors with the same day and time.\n\nSelected:\n${selectedRequestDay}\n${selectedRequestTime}`
      );

      return;
    }

    // --------------------------------------------------
    // ADD TUTOR
    // --------------------------------------------------

    setSelectedTutors(
      (previous) => [
        ...previous,
        {
          tutor_id:
            tutorId,

          tutor_name:
            item?.tutor_name ||
            "Tutor",

          institute:
            item?.institute ||
            "",

          grade:
            item?.grade ||
            "",

          hourly_rate:
            item?.hourly_rate ??
            0,

          average_rating:
            item?.average_rating ??
            0,

          total_reviews:
            item?.total_reviews ??
            0,

          day:
            itemDay,

          time:
            itemTime,
        },
      ]
    );

    setSelectedRequestDay(
      itemDay
    );

    setSelectedRequestTime(
      itemTime
    );
  };

  // ======================================================
  // OPEN REQUEST MODAL
  // ======================================================

  const openRequestModal = () => {
    if (selectedTutors.length === 0) {
      Alert.alert(
        "Select Tutor",
        "Please select at least one tutor first."
      );

      return;
    }

    if (!selectedRequestDay) {
      Alert.alert(
        "Missing Day",
        "Selected tutor day is missing."
      );

      return;
    }

    if (!selectedRequestTime) {
      Alert.alert(
        "Missing Time",
        "Selected tutor time is missing."
      );

      return;
    }

    setLearningMode(
      "FullTime"
    );

    setLearningDuration("");

    setLearningDurationUnit(
      "Weeks"
    );

    setRequestModal(true);
  };

  // ======================================================
  // CLOSE REQUEST MODAL
  // ======================================================

  const closeRequestModal = () => {
    if (requestLoading) {
      return;
    }

    setRequestModal(false);

    setLearningMode(
      "FullTime"
    );

    setLearningDuration("");

    setLearningDurationUnit(
      "Weeks"
    );
  };

  // ======================================================
  // CLEAR ALL SELECTED TUTORS
  // ======================================================

  const clearSelectedTutors = () => {
    if (requestLoading) {
      return;
    }

    setSelectedTutors([]);

    setSelectedRequestDay("");

    setSelectedRequestTime("");
  };

  // ======================================================
  // SEND REQUEST
  // ======================================================

  const sendRequest = async () => {
    if (requestLoading) {
      return;
    }

    try {
      // ==================================================
      // VALIDATION
      // ==================================================

      if (
        !selectedTutors ||
        selectedTutors.length === 0
      ) {
        Alert.alert(
          "Validation Error",
          "Please select at least one tutor."
        );

        return;
      }

      if (!courseId) {
        Alert.alert(
          "Validation Error",
          "Course is not selected."
        );

        return;
      }

      if (!selectedRequestDay) {
        Alert.alert(
          "Validation Error",
          "Please select a day."
        );

        return;
      }

      if (!selectedRequestTime) {
        Alert.alert(
          "Validation Error",
          "Please select a time slot."
        );

        return;
      }

      if (!learningMode) {
        Alert.alert(
          "Validation Error",
          "Learning mode is required."
        );

        return;
      }

      // ==================================================
      // DURATION
      // ==================================================

      let durationValue = null;

      let durationUnitValue = null;

      if (
        learningMode ===
        "SpecificTime"
      ) {
        const parsedDuration =
          Number(
            String(
              learningDuration
            ).trim()
          );

        if (
          !learningDuration ||
          !Number.isFinite(
            parsedDuration
          ) ||
          parsedDuration <= 0
        ) {
          Alert.alert(
            "Validation Error",
            "Please enter a valid duration greater than zero."
          );

          return;
        }

        durationValue =
          parsedDuration;

        durationUnitValue =
          learningDurationUnit;
      }

      // ==================================================
      // TUTOR IDS
      // ==================================================

      const tutorIds =
        selectedTutors
          .map(
            (tutor) =>
              Number(
                tutor.tutor_id
              )
          )
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0
          );

      if (
        tutorIds.length === 0
      ) {
        Alert.alert(
          "Validation Error",
          "No valid tutor was selected."
        );

        return;
      }

      // Remove duplicate tutor IDs
      const uniqueTutorIds =
        [...new Set(tutorIds)];

      // ==================================================
      // REQUEST BODY
      // ==================================================

      /*
       * IMPORTANT:
       *
       * New backend expects:
       *
       * tutor_ids
       * course_id
       * day
       * time
       * learning_mode
       * learning_duration
       * learning_duration_unit
       *
       * class_date is NOT sent.
       * request_type is NOT sent.
       * tutor_id is NOT sent.
       */

      const requestBody = {
        tutor_ids:
          uniqueTutorIds,

        course_id:
          Number(courseId),

        day:
          String(
            selectedRequestDay
          ).trim(),

        time:
          String(
            selectedRequestTime
          ).trim(),

        learning_mode:
          learningMode,

        learning_duration:
          durationValue,

        learning_duration_unit:
          durationUnitValue,
      };

      console.log(
        "===================================="
      );

      console.log(
        "CREATE MULTIPLE TUTOR REQUEST"
      );

      console.log(
        "URL:",
        `${BASE_URL}/Student/create-request`
      );

      console.log(
        "SELECTED TUTORS:",
        JSON.stringify(
          selectedTutors,
          null,
          2
        )
      );

      console.log(
        "BODY:",
        JSON.stringify(
          requestBody,
          null,
          2
        )
      );

      console.log(
        "===================================="
      );

      // ==================================================
      // TOKEN
      // ==================================================

      const token =
        await AsyncStorage.getItem(
          "token"
        );

      if (!token) {
        Alert.alert(
          "Authentication Error",
          "Your login session has expired. Please login again."
        );

        return;
      }

      setRequestLoading(true);

      // ==================================================
      // API CALL
      // ==================================================

      const response =
        await fetch(
          `${BASE_URL}/Student/create-request`,
          {
            method: "POST",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                requestBody
              ),
          }
        );

      // ==================================================
      // READ RESPONSE
      // ==================================================

      const responseText =
        await response.text();

      console.log(
        "===================================="
      );

      console.log(
        "CREATE REQUEST RESPONSE"
      );

      console.log(
        "STATUS:",
        response.status
      );

      console.log(
        "BODY:",
        responseText
      );

      console.log(
        "===================================="
      );

      let data = {};

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : {};
      } catch (parseError) {
        console.log(
          "RESPONSE JSON PARSE ERROR:",
          parseError
        );

        data = {
          message:
            responseText ||
            "Unknown server response.",
        };
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      if (response.ok) {
        // -----------------------------------------------
        // Save information before clearing selection
        // -----------------------------------------------

        const totalTutors =
          data?.total_tutors ??
          uniqueTutorIds.length;

        const currentTutorId =
          data?.current_tutor_id;

        const requestGroupId =
          data?.request_group_id;

        // -----------------------------------------------
        // Close modal
        // -----------------------------------------------

        setRequestModal(false);

        // -----------------------------------------------
        // Clear selected tutors
        // -----------------------------------------------

        setSelectedTutors([]);

        setSelectedRequestDay("");

        setSelectedRequestTime("");

        // -----------------------------------------------
        // Reset learning fields
        // -----------------------------------------------

        setLearningMode(
          "FullTime"
        );

        setLearningDuration("");

        setLearningDurationUnit(
          "Weeks"
        );

        // -----------------------------------------------
        // SUCCESS MESSAGE
        // -----------------------------------------------

        let successMessage =
          data?.message ||
          "Tutor request created successfully.";

        successMessage +=
          `\n\n${totalTutors} tutor${
            totalTutors === 1
              ? ""
              : "s"
          } selected.`;

        if (
          currentTutorId
        ) {
          successMessage +=
            `\n\nRequest has started with Tutor #${currentTutorId}.`;
        }

        if (
          data?.response_deadline
        ) {
          const deadline =
            new Date(
              data.response_deadline
            );

          if (
            !Number.isNaN(
              deadline.getTime()
            )
          ) {
            successMessage +=
              `\nFirst tutor has 2 minutes to accept.`;
          }
        }

        if (
          requestGroupId
        ) {
          successMessage +=
            `\n\nRequest Group ID: ${requestGroupId}`;
        }

        Alert.alert(
          "Request Sent",
          successMessage,
          [
            {
              text: "OK",
            },
          ]
        );

        return;
      }

      // ==================================================
      // BACKEND ERROR
      // ==================================================

      const serverMessage =
        data?.message ||
        data?.error ||
        data?.title ||
        data?.detail ||
        `Server returned HTTP ${response.status}.`;

      let additionalMessage =
        "";

      // --------------------------------------------------
      // Existing active request
      // --------------------------------------------------

      if (
        data?.request_group_id
      ) {
        additionalMessage =
          `\n\nRequest Group ID: ${data.request_group_id}`;
      }

      // --------------------------------------------------
      // Missing tutor IDs
      // --------------------------------------------------

      if (
        Array.isArray(
          data?.missing_tutor_ids
        ) &&
        data.missing_tutor_ids.length >
          0
      ) {
        additionalMessage +=
          `\n\nMissing Tutor IDs: ${data.missing_tutor_ids.join(
            ", "
          )}`;
      }

      // --------------------------------------------------
      // Inner error
      // --------------------------------------------------

      if (
        data?.inner_error
      ) {
        additionalMessage +=
          `\n\nDetails: ${data.inner_error}`;
      }

      Alert.alert(
        `Request Failed (${response.status})`,
        `${serverMessage}${additionalMessage}`
      );
    } catch (error) {
      console.log(
        "===================================="
      );

      console.log(
        "CREATE REQUEST NETWORK ERROR"
      );

      console.log(error);

      console.log(
        "===================================="
      );

      Alert.alert(
        "Request Failed",
        error?.message ||
          "Unable to connect to the server."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  // ======================================================
  // FLATTEN TUTORS + COMMON SLOTS
  // ======================================================

  const flattenedTutors =
    tutorsData.flatMap(
      (tutor) => {
        const slots =
          Array.isArray(
            tutor?.common_slots
          )
            ? tutor.common_slots
            : [];

        /*
         * If backend returns a tutor without slots,
         * keep one card so the tutor information
         * can still be displayed.
         */
        if (slots.length === 0) {
          return [
            {
              id:
                `tutor-${tutor.tutor_id}`,

              tutor_id:
                tutor.tutor_id,

              tutor_name:
                tutor.tutor_name,

              location:
                tutor.location,

              distance:
                tutor.distance,

              tutor_radius:
                tutor.tutor_radius,

              institute:
                tutor.institute,

              grade:
                tutor.grade,

              hourly_rate:
                tutor.hourly_rate,

              average_rating:
                tutor.average_rating,

              total_reviews:
                tutor.total_reviews,

              day:
                tutor.day || "",

              time:
                tutor.time || "",

              is_available:
                tutor.is_available !== false,

              availability_message:
                tutor.availability_message,
            },
          ];
        }

        return slots.map(
          (slot, index) => ({
            id:
              `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,

            // ------------------------------------------
            // TUTOR
            // ------------------------------------------

            tutor_id:
              tutor.tutor_id,

            tutor_name:
              tutor.tutor_name,

            location:
              tutor.location,

            distance:
              tutor.distance,

            tutor_radius:
              tutor.tutor_radius,

            // ------------------------------------------
            // COURSE
            // ------------------------------------------

            institute:
              tutor.institute,

            grade:
              tutor.grade,

            // ------------------------------------------
            // RATE
            // ------------------------------------------

            hourly_rate:
              tutor.hourly_rate,

            // ------------------------------------------
            // FEEDBACK
            // ------------------------------------------

            average_rating:
              tutor.average_rating,

            total_reviews:
              tutor.total_reviews,

            // ------------------------------------------
            // SLOT
            // ------------------------------------------

            day:
              slot.day,

            time:
              slot.time,

            is_available:
              slot.is_available,

            availability_message:
              slot.availability_message,
          })
        );
      }
    );

  // ======================================================
  // SEARCH ONLY
  //
  // SORTING IS DONE BY BACKEND
  // ======================================================

  const filteredTutors =
    flattenedTutors.filter(
      (item) => {
        const tutorName =
          String(
            item?.tutor_name || ""
          ).toLowerCase();

        const searchText =
          String(
            search || ""
          )
            .trim()
            .toLowerCase();

        return tutorName.includes(
          searchText
        );
      }
    );

  // ======================================================
  // SORT BUTTON
  // ======================================================

  const renderSortButton = (
    option
  ) => {
    const active =
      sortBy === option.key;

    return (
      <TouchableOpacity
        key={option.key}
        activeOpacity={0.8}
        style={[
          styles.sortButton,
          active &&
            styles.sortButtonActive,
        ]}
        onPress={() => {
          if (
            sortBy === option.key
          ) {
            return;
          }

          /*
           * Backend performs sorting.
           */
          setSortBy(
            option.key
          );
        }}
      >
        <Text
          style={[
            styles.sortButtonText,
            active &&
              styles.sortButtonTextActive,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // ======================================================
  // RENDER TUTOR
  // ======================================================

  const renderTutor = ({
    item,
  }) => {
    const unavailable =
      item?.is_available === false;

    const selected =
      isTutorSelected(
        item?.tutor_id
      );

    const rating =
      getRating(item);

    const reviews =
      getReviewCount(item);

    const institute =
      getInstitute(item);

    const grade =
      getGrade(item);

    const hourlyRate =
      getHourlyRate(item);

    return (
      <View
        style={[
          styles.card,
          selected &&
            styles.cardSelected,
        ]}
      >
        {/* ==========================================
            CARD HEADER
        ========================================== */}

        <View
          style={
            styles.cardHeader
          }
        >
          <View
            style={
              styles.avatarContainer
            }
          >
            <Text
              style={
                styles.avatarText
              }
            >
              {item?.tutor_name
                ? item.tutor_name
                    .charAt(0)
                    .toUpperCase()
                : "T"}
            </Text>
          </View>

          <View
            style={
              styles.headerInfo
            }
          >
            <Text
              style={
                styles.tutorName
              }
              numberOfLines={1}
            >
              {item?.tutor_name ||
                "Tutor"}
            </Text>

            <View
              style={
                styles.ratingRow
              }
            >
              <Icon
                name="star"
                size={16}
                color="#F59E0B"
              />

              <Text
                style={
                  styles.ratingVal
                }
              >
                {rating.toFixed(1)}
              </Text>

              <Text
                style={
                  styles.reviewCount
                }
              >
                ({reviews} reviews)
              </Text>
            </View>
          </View>

          {/* ==========================================
              SELECTION CHECKBOX
          ========================================== */}

          <View
            style={[
              styles.checkbox,
              selected &&
                styles.checkboxSelected,
            ]}
          >
            {selected && (
              <Icon
                name="check"
                size={18}
                color="#FFFFFF"
              />
            )}
          </View>
        </View>

        {/* ==========================================
            TUTOR INFORMATION
        ========================================== */}

        <View
          style={
            styles.tutorInfoRow
          }
        >
          <View
            style={
              styles.infoItem
            }
          >
            <Icon
              name="school"
              size={15}
              color="#64748B"
            />

            <Text
              style={
                styles.infoText
              }
              numberOfLines={1}
            >
              {institute}
            </Text>
          </View>

          <View
            style={
              styles.infoItem
            }
          >
            <Icon
              name="grade"
              size={15}
              color="#64748B"
            />

            <Text
              style={
                styles.infoText
              }
            >
              Grade: {grade}
            </Text>
          </View>
        </View>

        {/* ==========================================
            HOURLY FEE
        ========================================== */}

        <View
          style={
            styles.feeRow
          }
        >
          <Icon
            name="payments"
            size={16}
            color={PRIMARY_COLOR}
          />

          <Text
            style={
              styles.feeText
            }
          >
            Rs. {hourlyRate} / hour
          </Text>
        </View>

        {/* ==========================================
            LOCATION
        ========================================== */}

        <View
          style={
            styles.metaContainer
          }
        >
          <View
            style={
              styles.metaRow
            }
          >
            <Icon
              name="place"
              size={16}
              color="#64748B"
            />

            <Text
              style={
                styles.metaText
              }
              numberOfLines={1}
            >
              {item?.location ||
                "Location unavailable"}
            </Text>
          </View>

          <View
            style={
              styles.metaRow
            }
          >
            <Icon
              name="near-me"
              size={16}
              color="#64748B"
            />

            <Text
              style={
                styles.metaText
              }
            >
              {Number(
                item?.distance || 0
              ).toFixed(2)}{" "}
              km away
            </Text>
          </View>
        </View>

        {/* ==========================================
            SLOT
        ========================================== */}

        <View
          style={[
            styles.slotCard,
            unavailable
              ? styles.slotCardUnavailable
              : styles.slotCardAvailable,
          ]}
        >
          <View
            style={
              styles.slotHeaderRow
            }
          >
            <View
              style={[
                styles.statusBadge,
                unavailable
                  ? styles.badgeUnavailable
                  : styles.badgeAvailable,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  unavailable
                    ? styles.dotUnavailable
                    : styles.dotAvailable,
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  unavailable
                    ? styles.textUnavailable
                    : styles.textAvailable,
                ]}
              >
                {unavailable
                  ? "Slot Unavailable"
                  : "Available Slot"}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.slotDetailGrid
            }
          >
            <View
              style={
                styles.slotDetailItem
              }
            >
              <Icon
                name="event"
                size={16}
                color="#475569"
              />

              <Text
                style={
                  styles.slotDetailText
                }
              >
                {item?.day ||
                  "Day"}
              </Text>
            </View>

            <View
              style={
                styles.slotDetailItem
              }
            >
              <Icon
                name="schedule"
                size={16}
                color="#475569"
              />

              <Text
                style={
                  styles.slotDetailText
                }
              >
                {item?.time ||
                  "Time"}
              </Text>
            </View>
          </View>

          {/* ==========================================
              UNAVAILABLE MESSAGE
          ========================================== */}

          {unavailable && (
            <View
              style={
                styles.unavailableNotice
              }
            >
              <Icon
                name="info-outline"
                size={16}
                color="#D97706"
              />

              <View
                style={
                  styles.noticeTextContainer
                }
              >
                <Text
                  style={
                    styles.noticeMessage
                  }
                >
                  {item?.availability_message ||
                    "Tutor unavailable for this slot."}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ==========================================
            SELECT TUTOR BUTTON
        ========================================== */}

        <TouchableOpacity
          style={[
            styles.requestButton,
            selected &&
              styles.requestButtonSelected,
            unavailable &&
              styles.requestButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={unavailable}
          onPress={() =>
            toggleTutorSelection(item)
          }
        >
          <Icon
            name={
              selected
                ? "check-circle"
                : "add-circle-outline"
            }
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.requestButtonText
            }
          >
            {selected
              ? "Tutor Selected"
              : "Select Tutor"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
      />

      {/* ================================================
          TOP BAR
      ================================================ */}

      <View
        style={
          styles.topBar
        }
      >
        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Icon
            name="arrow-back"
            size={22}
            color="#0F172A"
          />
        </TouchableOpacity>

        <View
          style={
            styles.titleContainer
          }
        >
          <Text
            style={
              styles.headerSubtitle
            }
          >
            TUTOR DISCOVERY
          </Text>

          <Text
            style={
              styles.headerTitle
            }
            numberOfLines={1}
          >
            {courseName ||
              "Available Tutors"}
          </Text>
        </View>

        <View
          style={{
            width: 40,
          }}
        />
      </View>

      {/* ================================================
          SEARCH
      ================================================ */}

      <View
        style={
          styles.searchSection
        }
      >
        <View
          style={
            styles.searchInputContainer
          }
        >
          <Icon
            name="search"
            size={20}
            color="#94A3B8"
          />

          <TextInput
            placeholder="Search tutors by name..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={
              setSearch
            }
            style={
              styles.searchInput
            }
            clearButtonMode="while-editing"
          />

          {search.length > 0 &&
            Platform.OS !==
              "ios" && (
              <TouchableOpacity
                onPress={() =>
                  setSearch("")
                }
              >
                <Icon
                  name="close"
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            )}
        </View>
      </View>

      {/* ================================================
          SORT BY
      ================================================ */}

      <View
        style={
          styles.sortSection
        }
      >
        <Text
          style={
            styles.sortLabel
          }
        >
          Sort by:
        </Text>

        <View
          style={
            styles.sortButtonsRow
          }
        >
          {SORT_OPTIONS.map(
            renderSortButton
          )}
        </View>
      </View>

      {/* ================================================
          SELECTED TUTOR SUMMARY
      ================================================ */}

      {selectedTutors.length > 0 && (
        <View
          style={
            styles.selectionBar
          }
        >
          <View
            style={
              styles.selectionInfo
            }
          >
            <View
              style={
                styles.selectionCountCircle
              }
            >
              <Text
                style={
                  styles.selectionCountText
                }
              >
                {
                  selectedTutors.length
                }
              </Text>
            </View>

            <View
              style={
                styles.selectionTextContainer
              }
            >
              <Text
                style={
                  styles.selectionTitle
                }
              >
                Tutor
                {selectedTutors.length ===
                1
                  ? ""
                  : "s"}{" "}
                Selected
              </Text>

              <Text
                style={
                  styles.selectionSubtitle
                }
                numberOfLines={1}
              >
                {selectedRequestDay} •{" "}
                {selectedRequestTime}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.selectionActions
            }
          >
            <TouchableOpacity
              onPress={
                clearSelectedTutors
              }
              style={
                styles.clearButton
              }
            >
              <Icon
                name="clear"
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                openRequestModal
              }
              style={
                styles.continueButton
              }
            >
              <Text
                style={
                  styles.continueButtonText
                }
              >
                Continue
              </Text>

              <Icon
                name="arrow-forward"
                size={17}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================================================
          TUTOR LIST
      ================================================ */}

      {loading ? (
        <View
          style={
            styles.centerContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={
              PRIMARY_COLOR
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Finding tutors nearby...
          </Text>
        </View>
      ) : (
        <FlatList
          data={
            filteredTutors
          }
          keyExtractor={(
            item
          ) =>
            String(item.id)
          }
          renderItem={
            renderTutor
          }
          contentContainerStyle={[
            styles.listContent,
            selectedTutors.length >
              0 &&
              styles.listContentWithSelection,
          ]}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View
              style={
                styles.emptyContainer
              }
            >
              <View
                style={
                  styles.emptyIconCircle
                }
              >
                <Icon
                  name="search-off"
                  size={32}
                  color="#94A3B8"
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No Tutors Available
              </Text>

              <Text
                style={
                  styles.emptySubtext
                }
              >
                We couldn't find
                matches for your
                selection. Try
                changing the
                search or sort
                option.
              </Text>
            </View>
          }
        />
      )}

      {/* ================================================
          BOOKING MODAL
      ================================================ */}

      <Modal
        visible={
          requestModal
        }
        transparent
        animationType="fade"
        onRequestClose={
          closeRequestModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalCard
            }
          >
            {/* ==========================================
                MODAL HEADER
            ========================================== */}

            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderTextContainer
                }
              >
                <Text
                  style={
                    styles.modalHeaderTitle
                  }
                >
                  Class Request
                </Text>

                <Text
                  style={
                    styles.modalHeaderSubtitle
                  }
                >
                  {selectedTutors.length} tutor
                  {selectedTutors.length ===
                  1
                    ? ""
                    : "s"} selected
                </Text>
              </View>

              <TouchableOpacity
                onPress={
                  closeRequestModal
                }
                disabled={
                  requestLoading
                }
                style={
                  styles.modalCloseButton
                }
              >
                <Icon
                  name="close"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.modalBody
              }
            >
              {/* ==========================================
                  SELECTED TUTORS
              ========================================== */}

              <Text
                style={
                  styles.fieldLabel
                }
              >
                Selected Tutors
              </Text>

              <View
                style={
                  styles.selectedTutorsContainer
                }
              >
                {selectedTutors.map(
                  (tutor, index) => (
                    <View
                      key={`${tutor.tutor_id}-${index}`}
                      style={
                        styles.selectedTutorRow
                      }
                    >
                      <View
                        style={
                          styles.selectedTutorAvatar
                        }
                      >
                        <Text
                          style={
                            styles.selectedTutorAvatarText
                          }
                        >
                          {tutor?.tutor_name
                            ? tutor.tutor_name
                                .charAt(0)
                                .toUpperCase()
                            : "T"}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.selectedTutorInfo
                        }
                      >
                        <Text
                          style={
                            styles.selectedTutorName
                          }
                          numberOfLines={1}
                        >
                          {tutor.tutor_name}
                        </Text>

                        <Text
                          style={
                            styles.selectedTutorDetails
                          }
                          numberOfLines={1}
                        >
                          {tutor.institute ||
                            "Institute unavailable"}
                        </Text>
                      </View>

                      <TouchableOpacity
                        disabled={
                          requestLoading
                        }
                        onPress={() => {
                          toggleTutorSelection(
                            tutor
                          );
                        }}
                        style={
                          styles.removeTutorButton
                        }
                      >
                        <Icon
                          name="close"
                          size={18}
                          color="#64748B"
                        />
                      </TouchableOpacity>
                    </View>
                  )
                )}
              </View>

              {/* ==========================================
                  SELECTED SLOT
              ========================================== */}

              <View
                style={
                  styles.summaryCard
                }
              >
                <Text
                  style={
                    styles.summaryTitle
                  }
                >
                  Selected Slot
                </Text>

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Icon
                    name="event"
                    size={16}
                    color={
                      PRIMARY_COLOR
                    }
                  />

                  <Text
                    style={
                      styles.summaryText
                    }
                  >
                    {selectedRequestDay}
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Icon
                    name="schedule"
                    size={16}
                    color={
                      PRIMARY_COLOR
                    }
                  />

                  <Text
                    style={
                      styles.summaryText
                    }
                  >
                    {selectedRequestTime}
                  </Text>
                </View>
              </View>

              {/* ==========================================
                  INFORMATION
              ========================================== */}

              <View
                style={
                  styles.infoNotice
                }
              >
                <Icon
                  name="info-outline"
                  size={18}
                  color={PRIMARY_COLOR}
                />

                <Text
                  style={
                    styles.infoNoticeText
                  }
                >
                  The first selected tutor
                  will receive your request
                  first. If the tutor does not
                  accept within 2 minutes, the
                  request can move to the next
                  selected tutor.
                </Text>
              </View>

              {/* ==========================================
                  LEARNING MODE
              ========================================== */}

              <Text
                style={
                  styles.fieldLabel
                }
              >
                Learning Mode
              </Text>

              <View
                style={
                  styles.segmentedControl
                }
              >
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    learningMode ===
                      "FullTime" &&
                      styles.segmentButtonActive,
                  ]}
                  onPress={() =>
                    setLearningMode(
                      "FullTime"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.segmentText,
                      learningMode ===
                        "FullTime" &&
                        styles.segmentTextActive,
                    ]}
                  >
                    Full Time
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    learningMode ===
                      "SpecificTime" &&
                      styles.segmentButtonActive,
                  ]}
                  onPress={() =>
                    setLearningMode(
                      "SpecificTime"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.segmentText,
                      learningMode ===
                        "SpecificTime" &&
                        styles.segmentTextActive,
                    ]}
                  >
                    Specific Time
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ==========================================
                  DURATION
              ========================================== */}

              {learningMode ===
                "SpecificTime" && (
                <View
                  style={
                    styles.durationSection
                  }
                >
                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    Duration Value
                  </Text>

                  <View
                    style={
                      styles.textInputWrapper
                    }
                  >
                    <Icon
                      name="timer"
                      size={18}
                      color="#94A3B8"
                      style={{
                        marginRight: 8,
                      }}
                    />

                    <TextInput
                      placeholder="e.g. 4"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={
                        learningDuration
                      }
                      onChangeText={
                        setLearningDuration
                      }
                      style={
                        styles.modalTextInput
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        marginTop: 14,
                      },
                    ]}
                  >
                    Duration Unit
                  </Text>

                  <View
                    style={
                      styles.unitChipContainer
                    }
                  >
                    {DURATION_UNITS.map(
                      (unit) => {
                        const isSelected =
                          learningDurationUnit ===
                          unit;

                        return (
                          <TouchableOpacity
                            key={unit}
                            style={[
                              styles.unitChip,
                              isSelected &&
                                styles.unitChipSelected,
                            ]}
                            onPress={() =>
                              setLearningDurationUnit(
                                unit
                              )
                            }
                          >
                            <Text
                              style={[
                                styles.unitChipText,
                                isSelected &&
                                  styles.unitChipTextSelected,
                              ]}
                            >
                              {unit}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                    )}
                  </View>
                </View>
              )}

              {/* ==========================================
                  MODAL ACTIONS
              ========================================== */}

              <View
                style={
                  styles.modalActions
                }
              >
                <TouchableOpacity
                  disabled={
                    requestLoading
                  }
                  style={[
                    styles.submitButton,
                    requestLoading &&
                      styles.disabledButton,
                  ]}
                  onPress={
                    sendRequest
                  }
                >
                  {requestLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Icon
                        name="send"
                        size={17}
                        color="#FFFFFF"
                        style={{
                          marginRight: 7,
                        }}
                      />

                      <Text
                        style={
                          styles.submitButtonText
                        }
                      >
                        Send Request to{" "}
                        {
                          selectedTutors.length
                        }{" "}
                        Tutor
                        {selectedTutors.length ===
                        1
                          ? ""
                          : "s"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={
                    requestLoading
                  }
                  style={
                    styles.cancelButton
                  }
                  onPress={
                    closeRequestModal
                  }
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // ====================================================
  // TOP BAR
  // ====================================================

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  titleContainer: {
    alignItems: "center",
    flex: 1,
  },

  headerSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },

  // ====================================================
  // SEARCH
  // ====================================================

  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#0F172A",
  },

  // ====================================================
  // SORT
  // ====================================================

  sortSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
    backgroundColor: "#F8FAFC",
  },

  sortLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },

  sortButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sortButton: {
    flex: 1,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
  },

  sortButtonActive: {
    backgroundColor:
      PRIMARY_COLOR,
    borderColor:
      PRIMARY_COLOR,
  },

  sortButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  sortButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // ====================================================
  // SELECTION BAR
  // ====================================================

  selectionBar: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectionInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  selectionCountCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      PRIMARY_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },

  selectionCountText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  selectionTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  selectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  selectionSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  selectionActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },

  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    marginRight: 6,
  },

  continueButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor:
      PRIMARY_COLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 5,
  },

  // ====================================================
  // LOADING
  // ====================================================

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },

  // ====================================================
  // LIST
  // ====================================================

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  listContentWithSelection: {
    paddingBottom: 60,
  },

  // ====================================================
  // CARD
  // ====================================================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#0F172A",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.04,

    shadowRadius: 8,

    elevation: 2,
  },

  cardSelected: {
    borderColor:
      PRIMARY_COLOR,
    borderWidth: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },

  headerInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  tutorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  ratingVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 4,
  },

  reviewCount: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 4,
  },

  // ====================================================
  // CHECKBOX
  // ====================================================

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxSelected: {
    backgroundColor:
      PRIMARY_COLOR,
    borderColor:
      PRIMARY_COLOR,
  },

  // ====================================================
  // TUTOR INFORMATION
  // ====================================================

  tutorInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    marginLeft: 5,
  },

  // ====================================================
  // FEE
  // ====================================================

  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  feeText: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginLeft: 6,
  },

  // ====================================================
  // LOCATION
  // ====================================================

  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  metaText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    marginLeft: 6,
  },

  // ====================================================
  // SLOT
  // ====================================================

  slotCard: {
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
  },

  slotCardAvailable: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },

  slotCardUnavailable: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FEF3C7",
  },

  slotHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeAvailable: {
    backgroundColor: "#DCFCE7",
  },

  badgeUnavailable: {
    backgroundColor: "#FEF3C7",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  dotAvailable: {
    backgroundColor: "#16A34A",
  },

  dotUnavailable: {
    backgroundColor: "#D97706",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  textAvailable: {
    color: "#15803D",
  },

  textUnavailable: {
    color: "#B45309",
  },

  slotDetailGrid: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  slotDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },

  slotDetailText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginLeft: 6,
  },

  unavailableNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#FDE68A",
  },

  noticeTextContainer: {
    flex: 1,
    marginLeft: 6,
  },

  noticeMessage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B45309",
    lineHeight: 16,
  },

  // ====================================================
  // REQUEST BUTTON
  // ====================================================

  requestButton: {
    backgroundColor:
      PRIMARY_COLOR,
    borderRadius: 10,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  requestButtonSelected: {
    backgroundColor:
      "#15803D",
  },

  requestButtonDisabled: {
    opacity: 0.5,
  },

  requestButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  // ====================================================
  // EMPTY
  // ====================================================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },

  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  emptySubtext: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },

  // ====================================================
  // MODAL
  // ====================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    maxHeight: "88%",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.15,

    shadowRadius: 20,

    elevation: 10,

    overflow: "hidden",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  modalHeaderTextContainer: {
    flex: 1,
  },

  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  modalHeaderSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  modalCloseButton: {
    padding: 4,
  },

  modalBody: {
    padding: 20,
  },

  // ====================================================
  // SELECTED TUTORS
  // ====================================================

  selectedTutorsContainer: {
    marginBottom: 16,
  },

  selectedTutorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 9,
    marginBottom: 7,
  },

  selectedTutorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedTutorAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },

  selectedTutorInfo: {
    flex: 1,
    marginLeft: 9,
  },

  selectedTutorName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  selectedTutorDetails: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  removeTutorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  // ====================================================
  // SUMMARY
  // ====================================================

  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  summaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 8,
  },

  // ====================================================
  // INFO NOTICE
  // ====================================================

  infoNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    borderRadius: 10,
    padding: 11,
    marginBottom: 16,
  },

  infoNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#115E59",
    marginLeft: 8,
  },

  // ====================================================
  // FORM
  // ====================================================

  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },

  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },

  segmentButtonActive: {
    backgroundColor: "#FFFFFF",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.08,

    shadowRadius: 2,

    elevation: 1,
  },

  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  segmentTextActive: {
    color: PRIMARY_COLOR,
  },

  // ====================================================
  // DURATION
  // ====================================================

  durationSection: {
    marginBottom: 16,
  },

  textInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },

  modalTextInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },

  unitChipContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  unitChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    marginHorizontal: 3,
  },

  unitChipSelected: {
    borderColor:
      PRIMARY_COLOR,
    backgroundColor: "#EFF6FF",
  },

  unitChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  unitChipTextSelected: {
    color: PRIMARY_COLOR,
  },

  // ====================================================
  // MODAL ACTIONS
  // ====================================================

  modalActions: {
    marginTop: 8,
  },

  submitButton: {
    backgroundColor:
      PRIMARY_COLOR,
    borderRadius: 10,
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
  },

  cancelButton: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  cancelButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default StudentFindTutor;

















































// // Hide all Normal accepted classes and student enter learning_mode, learning_duration, learning_duration_unit, class_date
// // Student can request to re and pre-scheduled tutor's
// //Modified by Gemini
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   ScrollView,
//   StatusBar,
//   Platform,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const PRIMARY_COLOR = colors?.primary || "#2563EB";
// const DURATION_UNITS = ["Days", "Weeks", "Months"];

// const StudentFindTutor = ({ navigation, route }) => {
//   const { courseId, courseName, userLat, userLng } = route.params || {};

//   const [tutorsData, setTutorsData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   // Request Modal State
//   const [requestModal, setRequestModal] = useState(false);
//   const [selectedTutor, setSelectedTutor] = useState(null);
//   const [selectedDay, setSelectedDay] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [selectedClassDate, setSelectedClassDate] = useState(null);

//   // Learning Mode State
//   const [learningMode, setLearningMode] = useState("FullTime");
//   const [learningDuration, setLearningDuration] = useState("");
//   const [learningDurationUnit, setLearningDurationUnit] = useState("Weeks");
//   const [requestLoading, setRequestLoading] = useState(false);

//   // ==========================
//   // FETCH TUTORS
//   // ==========================
//   useEffect(() => {
//     fetchTutors();
//   }, []);

//   const fetchTutors = async () => {
//     try {
//       setLoading(true);

//       if (!courseId || userLat == null || userLng == null) {
//         Alert.alert("Error", "Missing required location or course parameters.");
//         navigation.goBack();
//         return;
//       }

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         setTutorsData(Array.isArray(data) ? data : []);
//       } else {
//         setTutorsData([]);
//         Alert.alert("Info", data?.message || "No tutors found in your area.");
//       }
//     } catch (error) {
//       console.log("FETCH TUTORS ERROR:", error);
//       Alert.alert("Error", "Unable to load available tutors.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================
//   // MODAL HANDLERS
//   // ==========================
//   const openRequestModal = (item) => {
//     setSelectedTutor(item.tutor_id);
//     setSelectedDay(item.day);
//     setSelectedTime(item.time);
//     setSelectedClassDate(item.class_date || null);

//     setLearningMode("FullTime");
//     setLearningDuration("");
//     setLearningDurationUnit("Weeks");

//     setRequestModal(true);
//   };

//   const closeRequestModal = () => {
//     if (requestLoading) return;

//     setRequestModal(false);
//     setSelectedTutor(null);
//     setSelectedDay("");
//     setSelectedTime("");
//     setSelectedClassDate(null);

//     setLearningMode("FullTime");
//     setLearningDuration("");
//     setLearningDurationUnit("Weeks");
//   };

//   // ==========================
//   // SEND REQUEST
//   // ==========================
//   const sendRequest = async () => {
//     if (requestLoading) return;

//     try {
//       // =====================================================
//       // VALIDATION
//       // =====================================================

//       if (!selectedTutor) {
//         Alert.alert("Validation Error", "Tutor is not selected.");
//         return;
//       }

//       if (!courseId) {
//         Alert.alert("Validation Error", "Course is not selected.");
//         return;
//       }

//       if (!selectedDay) {
//         Alert.alert("Validation Error", "Please select a day.");
//         return;
//       }

//       if (!selectedTime) {
//         Alert.alert("Validation Error", "Please select a time slot.");
//         return;
//       }

//       if (!learningMode) {
//         Alert.alert("Validation Error", "Learning mode is required.");
//         return;
//       }

//       if (
//         learningMode !== "FullTime" &&
//         learningMode !== "SpecificTime"
//       ) {
//         Alert.alert("Validation Error", "Invalid learning mode.");
//         return;
//       }

//       // =====================================================
//       // SPECIFIC TIME VALIDATION
//       // =====================================================

//       let durationValue = null;
//       let durationUnitValue = null;

//       if (learningMode === "SpecificTime") {
//         const parsedDuration = Number(
//           String(learningDuration).trim()
//         );

//         if (
//           !learningDuration ||
//           !Number.isFinite(parsedDuration) ||
//           parsedDuration <= 0
//         ) {
//           Alert.alert(
//             "Validation Error",
//             "Please enter a valid duration greater than zero."
//           );
//           return;
//         }

//         if (!learningDurationUnit) {
//           Alert.alert(
//             "Validation Error",
//             "Please select a duration unit."
//           );
//           return;
//         }

//         durationValue = parsedDuration;
//         durationUnitValue = learningDurationUnit;
//       }

//       // =====================================================
//       // NORMALIZE DATE
//       // Backend expects DateTime?
//       // Send yyyy-MM-dd instead of JS Date object.
//       // =====================================================

//       let classDateValue = null;

//       if (selectedClassDate) {
//         if (typeof selectedClassDate === "string") {
//           // Already yyyy-MM-dd
//           if (/^\d{4}-\d{2}-\d{2}$/.test(selectedClassDate)) {
//             classDateValue = selectedClassDate;
//           } else {
//             const parsedDate = new Date(selectedClassDate);

//             if (!Number.isNaN(parsedDate.getTime())) {
//               classDateValue = parsedDate
//                 .toISOString()
//                 .split("T")[0];
//             }
//           }
//         } else if (selectedClassDate instanceof Date) {
//           if (!Number.isNaN(selectedClassDate.getTime())) {
//             classDateValue = selectedClassDate
//               .toISOString()
//               .split("T")[0];
//           }
//         }
//       }

//       // If there is no selected class date,
//       // use today's date.
//       if (!classDateValue) {
//         const today = new Date();

//         classDateValue = today
//           .toISOString()
//           .split("T")[0];
//       }

//       // =====================================================
//       // REQUEST BODY
//       // =====================================================

//       const requestBody = {
//         tutor_id: Number(selectedTutor),
//         course_id: Number(courseId),

//         day: String(selectedDay).trim(),

//         time: String(selectedTime).trim(),

//         class_date: classDateValue,

//         learning_mode: learningMode,

//         learning_duration: durationValue,

//         learning_duration_unit: durationUnitValue,
//       };

//       console.log("====================================");
//       console.log("CREATE REQUEST");
//       console.log("URL:", `${BASE_URL}/Student/create-request`);
//       console.log("BODY:", JSON.stringify(requestBody, null, 2));
//       console.log("====================================");

//       // =====================================================
//       // TOKEN
//       // =====================================================

//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert(
//           "Authentication Error",
//           "Your login session has expired. Please login again."
//         );
//         return;
//       }

//       setRequestLoading(true);

//       // =====================================================
//       // API CALL
//       // =====================================================

//       const response = await fetch(
//         `${BASE_URL}/Student/create-request`,
//         {
//           method: "POST",

//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },

//           body: JSON.stringify(requestBody),
//         }
//       );

//       // =====================================================
//       // READ RESPONSE SAFELY
//       // =====================================================

//       const responseText = await response.text();

//       console.log("====================================");
//       console.log("CREATE REQUEST RESPONSE");
//       console.log("STATUS:", response.status);
//       console.log("BODY:", responseText);
//       console.log("====================================");

//       let data = {};

//       try {
//         data = responseText
//           ? JSON.parse(responseText)
//           : {};
//       } catch (parseError) {
//         console.log(
//           "RESPONSE JSON PARSE ERROR:",
//           parseError
//         );

//         data = {
//           message: responseText || "Unknown server response.",
//         };
//       }

//       // =====================================================
//       // SUCCESS
//       // =====================================================

//       if (response.ok) {
//         setRequestModal(false);

//         setSelectedTutor(null);
//         setSelectedDay("");
//         setSelectedTime("");
//         setSelectedClassDate(null);

//         setLearningMode("FullTime");
//         setLearningDuration("");
//         setLearningDurationUnit("Weeks");

//         if (data?.tutor_unavailable === true) {
//           let warningMessage =
//             data?.note ||
//             "This tutor is unavailable for the selected slot.";

//           if (data?.next_available_day) {
//             warningMessage +=
//               `\n\nAvailable next: ${data.next_available_day}`;
//           }

//           Alert.alert(
//             "Request Sent",
//             `${data?.message || "Class request created successfully."}\n\n${warningMessage}`
//           );
//         } else {
//           Alert.alert(
//             "Success",
//             data?.message ||
//               "Class request sent successfully."
//           );
//         }

//         return;
//       }

//       // =====================================================
//       // BACKEND ERROR
//       // =====================================================

//       const serverMessage =
//         data?.message ||
//         data?.error ||
//         data?.title ||
//         data?.detail ||
//         `Server returned HTTP ${response.status}.`;

//       const innerError =
//         data?.inner_error
//           ? `\n\nDetails: ${data.inner_error}`
//           : "";

//       Alert.alert(
//         `Request Failed (${response.status})`,
//         `${serverMessage}${innerError}`
//       );
//     } catch (error) {
//       console.log("====================================");
//       console.log("CREATE REQUEST NETWORK ERROR");
//       console.log(error);
//       console.log("====================================");

//       Alert.alert(
//         "Request Failed",
//         error?.message ||
//           "Unable to connect to the server."
//       );
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   // ==========================
//   // DATA FLATTENING & FILTERING
//   // ==========================
//   const filteredTutors = tutorsData
//     .flatMap((tutor) =>
//       (tutor.common_slots || []).map((slot, index) => ({
//         id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,
//         tutor_id: tutor.tutor_id,
//         tutor_name: tutor.tutor_name,
//         location: tutor.location,
//         distance: tutor.distance,
//         average_rating: tutor.average_rating,
//         total_reviews: tutor.total_reviews,
//         day: slot.day,
//         time: slot.time,
//         is_available: slot.is_available,
//         availability_message: slot.availability_message,
//         request_type: slot.request_type,
//         class_date: slot.class_date,
//       }))
//     )
//     .filter((item) =>
//       item.tutor_name?.toLowerCase().includes(search.toLowerCase())
//     );

//   // ==========================
//   // RENDER TUTOR CARD
//   // ==========================
//   const renderTutor = ({ item }) => {
//     const unavailable = item.is_available === false;

//     return (
//       <View style={styles.card}>
//         {/* Card Header */}
//         <View style={styles.cardHeader}>
//           <View style={styles.avatarContainer}>
//             <Text style={styles.avatarText}>
//               {item.tutor_name ? item.tutor_name.charAt(0).toUpperCase() : "T"}
//             </Text>
//           </View>
//           <View style={styles.headerInfo}>
//             <Text style={styles.tutorName} numberOfLines={1}>
//               {item.tutor_name}
//             </Text>
//             <View style={styles.ratingRow}>
//               <Icon name="star" size={16} color="#F59E0B" />
//               <Text style={styles.ratingVal}>
//                 {Number(item.average_rating || 0).toFixed(1)}
//               </Text>
//               <Text style={styles.reviewCount}>
//                 ({item.total_reviews || 0} reviews)
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Location & Distance Metadata */}
//         <View style={styles.metaContainer}>
//           <View style={styles.metaRow}>
//             <Icon name="place" size={16} color="#64748B" />
//             <Text style={styles.metaText} numberOfLines={1}>
//               {item.location || "Location unavailable"}
//             </Text>
//           </View>
//           <View style={styles.metaRow}>
//             <Icon name="near-me" size={16} color="#64748B" />
//             <Text style={styles.metaText}>
//               {Number(item.distance || 0).toFixed(2)} km away
//             </Text>
//           </View>
//         </View>

//         {/* Slot Info Card */}
//         <View
//           style={[
//             styles.slotCard,
//             unavailable ? styles.slotCardUnavailable : styles.slotCardAvailable,
//           ]}
//         >
//           <View style={styles.slotHeaderRow}>
//             <View
//               style={[
//                 styles.statusBadge,
//                 unavailable ? styles.badgeUnavailable : styles.badgeAvailable,
//               ]}
//             >
//               <View
//                 style={[
//                   styles.statusDot,
//                   unavailable ? styles.dotUnavailable : styles.dotAvailable,
//                 ]}
//               />
//               <Text
//                 style={[
//                   styles.statusText,
//                   unavailable ? styles.textUnavailable : styles.textAvailable,
//                 ]}
//               >
//                 {unavailable ? "Slot Unavailable" : "Available Slot"}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.slotDetailGrid}>
//             <View style={styles.slotDetailItem}>
//               <Icon name="event" size={16} color="#475569" />
//               <Text style={styles.slotDetailText}>{item.day}</Text>
//             </View>
//             <View style={styles.slotDetailItem}>
//               <Icon name="schedule" size={16} color="#475569" />
//               <Text style={styles.slotDetailText}>{item.time}</Text>
//             </View>
//           </View>

//           {unavailable && (
//             <View style={styles.unavailableNotice}>
//               <Icon name="info-outline" size={16} color="#D97706" />
//               <View style={styles.noticeTextContainer}>
//                 <Text style={styles.noticeMessage}>
//                   {item.availability_message || "Tutor unavailable for this slot."}
//                 </Text>
//                 {item.request_type && (
//                   <Text style={styles.noticeReason}>
//                     Reason: {item.request_type}
//                   </Text>
//                 )}
//               </View>
//             </View>
//           )}
//         </View>

//         {/* Action Button */}
//         <TouchableOpacity
//           style={styles.requestButton}
//           activeOpacity={0.8}
//           onPress={() => openRequestModal(item)}
//         >
//           <Text style={styles.requestButtonText}>Book Class Request</Text>
//           <Icon name="arrow-forward" size={18} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

//       {/* Navigation Top Bar */}
//       <View style={styles.topBar}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Icon name="arrow-back" size={22} color="#0F172A" />
//         </TouchableOpacity>
//         <View style={styles.titleContainer}>
//           <Text style={styles.headerSubtitle}>Tutor Discovery</Text>
//           <Text style={styles.headerTitle} numberOfLines={1}>
//             {courseName || "Available Tutors"}
//           </Text>
//         </View>
//         <View style={{ width: 40 }} />
//       </View>

//       {/* Search Field */}
//       <View style={styles.searchSection}>
//         <View style={styles.searchInputContainer}>
//           <Icon name="search" size={20} color="#94A3B8" />
//           <TextInput
//             placeholder="Search tutors by name..."
//             placeholderTextColor="#94A3B8"
//             value={search}
//             onChangeText={setSearch}
//             style={styles.searchInput}
//             clearButtonMode="while-editing"
//           />
//           {search.length > 0 && Platform.OS !== "ios" && (
//             <TouchableOpacity onPress={() => setSearch("")}>
//               <Icon name="close" size={18} color="#94A3B8" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Tutor List / Loader / Empty State */}
//       {loading ? (
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color={PRIMARY_COLOR} />
//           <Text style={styles.loadingText}>Finding tutors nearby...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredTutors}
//           keyExtractor={(item) => item.id}
//           renderItem={renderTutor}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <View style={styles.emptyIconCircle}>
//                 <Icon name="search-off" size={32} color="#94A3B8" />
//               </View>
//               <Text style={styles.emptyTitle}>No Tutors Available</Text>
//               <Text style={styles.emptySubtext}>
//                 We couldn't find matches for your selection. Try adjusting your search term.
//               </Text>
//             </View>
//           }
//         />
//       )}

//       {/* Booking Modal */}
//       <Modal
//         visible={requestModal}
//         transparent
//         animationType="fade"
//         onRequestClose={closeRequestModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             {/* Modal Header */}
//             <View style={styles.modalHeader}>
//               <View>
//                 <Text style={styles.modalHeaderTitle}>Class Request</Text>
//                 <Text style={styles.modalHeaderSubtitle}>
//                   Configure duration and submit request
//                 </Text>
//               </View>
//               <TouchableOpacity
//                 onPress={closeRequestModal}
//                 disabled={requestLoading}
//                 style={styles.modalCloseButton}
//               >
//                 <Icon name="close" size={20} color="#64748B" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.modalBody}
//             >
//               {/* Selected Slot Summary Box */}
//               <View style={styles.summaryCard}>
//                 <Text style={styles.summaryTitle}>Selected Slot</Text>
//                 <View style={styles.summaryRow}>
//                   <Icon name="event" size={16} color={PRIMARY_COLOR} />
//                   <Text style={styles.summaryText}>{selectedDay}</Text>
//                 </View>
//                 <View style={styles.summaryRow}>
//                   <Icon name="schedule" size={16} color={PRIMARY_COLOR} />
//                   <Text style={styles.summaryText}>{selectedTime}</Text>
//                 </View>
//                 {selectedClassDate && (
//                   <View style={styles.summaryRow}>
//                     <Icon name="calendar-today" size={16} color={PRIMARY_COLOR} />
//                     <Text style={styles.summaryText}>{selectedClassDate}</Text>
//                   </View>
//                 )}
//               </View>

//               {/* Mode Selection Segmented Controller */}
//               <Text style={styles.fieldLabel}>Learning Mode</Text>
//               <View style={styles.segmentedControl}>
//                 <TouchableOpacity
//                   style={[
//                     styles.segmentButton,
//                     learningMode === "FullTime" && styles.segmentButtonActive,
//                   ]}
//                   onPress={() => setLearningMode("FullTime")}
//                 >
//                   <Text
//                     style={[
//                       styles.segmentText,
//                       learningMode === "FullTime" && styles.segmentTextActive,
//                     ]}
//                   >
//                     Full Time
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[
//                     styles.segmentButton,
//                     learningMode === "SpecificTime" && styles.segmentButtonActive,
//                   ]}
//                   onPress={() => setLearningMode("SpecificTime")}
//                 >
//                   <Text
//                     style={[
//                       styles.segmentText,
//                       learningMode === "SpecificTime" && styles.segmentTextActive,
//                     ]}
//                   >
//                     Specific Time
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {/* Dynamic Duration Fields */}
//               {learningMode === "SpecificTime" && (
//                 <View style={styles.durationSection}>
//                   <Text style={styles.fieldLabel}>Duration Value</Text>
//                   <View style={styles.textInputWrapper}>
//                     <Icon name="timer" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
//                     <TextInput
//                       placeholder="e.g. 4"
//                       placeholderTextColor="#94A3B8"
//                       keyboardType="numeric"
//                       value={learningDuration}
//                       onChangeText={setLearningDuration}
//                       style={styles.modalTextInput}
//                     />
//                   </View>

//                   <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Duration Unit</Text>
//                   <View style={styles.unitChipContainer}>
//                     {DURATION_UNITS.map((unit) => {
//                       const isSelected = learningDurationUnit === unit;
//                       return (
//                         <TouchableOpacity
//                           key={unit}
//                           style={[
//                             styles.unitChip,
//                             isSelected && styles.unitChipSelected,
//                           ]}
//                           onPress={() => setLearningDurationUnit(unit)}
//                         >
//                           <Text
//                             style={[
//                               styles.unitChipText,
//                               isSelected && styles.unitChipTextSelected,
//                             ]}
//                           >
//                             {unit}
//                           </Text>
//                         </TouchableOpacity>
//                       );
//                     })}
//                   </View>
//                 </View>
//               )}

//               {/* Modal Action Controls */}
//               <View style={styles.modalActions}>
//                 <TouchableOpacity
//                   disabled={requestLoading}
//                   style={[
//                     styles.submitButton,
//                     requestLoading && styles.disabledButton,
//                   ]}
//                   onPress={sendRequest}
//                 >
//                   {requestLoading ? (
//                     <ActivityIndicator size="small" color="#FFFFFF" />
//                   ) : (
//                     <Text style={styles.submitButtonText}>Submit Request</Text>
//                   )}
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   disabled={requestLoading}
//                   style={styles.cancelButton}
//                   onPress={closeRequestModal}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // ======================================================
// // STYLESHEET
// // ======================================================

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },

//   // Top Bar Navigation
//   topBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#FFFFFF",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F5F9",
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#F1F5F9",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   titleContainer: {
//     alignItems: "center",
//     flex: 1,
//   },
//   headerSubtitle: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "#64748B",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   headerTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#0F172A",
//     marginTop: 2,
//   },

//   // Search Section
//   searchSection: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   searchInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     height: 46,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 14,
//     color: "#0F172A",
//   },

//   // Center Content / Loading
//   centerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 24,
//   },
//   loadingText: {
//     marginTop: 12,
//     color: "#64748B",
//     fontSize: 14,
//     fontWeight: "500",
//   },

//   // List Layout
//   listContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 40,
//   },

//   // Tutor Card
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   avatarContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#EFF6FF",
//     borderWidth: 1,
//     borderColor: "#DBEAFE",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   avatarText: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: PRIMARY_COLOR,
//   },
//   headerInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   tutorName: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#0F172A",
//   },
//   ratingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 2,
//   },
//   ratingVal: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#0F172A",
//     marginLeft: 4,
//   },
//   reviewCount: {
//     fontSize: 13,
//     color: "#64748B",
//     marginLeft: 4,
//   },

//   // Metadata Layout
//   metaContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 12,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: "#F1F5F9",
//   },
//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   metaText: {
//     fontSize: 13,
//     color: "#475569",
//     marginLeft: 6,
//   },

//   // Slot Display Card
//   slotCard: {
//     borderRadius: 12,
//     padding: 12,
//     marginTop: 12,
//     borderWidth: 1,
//   },
//   slotCardAvailable: {
//     backgroundColor: "#F0FDF4",
//     borderColor: "#DCFCE7",
//   },
//   slotCardUnavailable: {
//     backgroundColor: "#FFFBEB",
//     borderColor: "#FEF3C7",
//   },
//   slotHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   badgeAvailable: {
//     backgroundColor: "#DCFCE7",
//   },
//   badgeUnavailable: {
//     backgroundColor: "#FEF3C7",
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 6,
//   },
//   dotAvailable: {
//     backgroundColor: "#16A34A",
//   },
//   dotUnavailable: {
//     backgroundColor: "#D97706",
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   textAvailable: {
//     color: "#15803D",
//   },
//   textUnavailable: {
//     color: "#B45309",
//   },

//   slotDetailGrid: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   slotDetailItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   slotDetailText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#334155",
//     marginLeft: 6,
//   },

//   unavailableNotice: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginTop: 10,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: "#FDE68A",
//   },
//   noticeTextContainer: {
//     flex: 1,
//     marginLeft: 6,
//   },
//   noticeMessage: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#B45309",
//     lineHeight: 16,
//   },
//   noticeReason: {
//     fontSize: 11,
//     color: "#D97706",
//     marginTop: 2,
//   },

//   // Request Button
//   requestButton: {
//     backgroundColor: PRIMARY_COLOR,
//     borderRadius: 10,
//     height: 44,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 14,
//   },
//   requestButtonText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "600",
//     marginRight: 6,
//   },

//   // Empty State
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 48,
//     paddingHorizontal: 24,
//   },
//   emptyIconCircle: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "#F1F5F9",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//   },
//   emptyTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#0F172A",
//   },
//   emptySubtext: {
//     fontSize: 13,
//     color: "#64748B",
//     textAlign: "center",
//     marginTop: 4,
//     lineHeight: 18,
//   },

//   // Modal Overlay
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(15, 23, 42, 0.5)",
//     justifyContent: "center",
//     padding: 20,
//   },
//   modalCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 20,
//     maxHeight: "85%",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     overflow: "hidden",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F5F9",
//   },
//   modalHeaderTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#0F172A",
//   },
//   modalHeaderSubtitle: {
//     fontSize: 12,
//     color: "#64748B",
//     marginTop: 2,
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   modalBody: {
//     padding: 20,
//   },

//   // Selected Slot Box
//   summaryCard: {
//     backgroundColor: "#F8FAFC",
//     borderRadius: 12,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     marginBottom: 16,
//   },
//   summaryTitle: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#64748B",
//     textTransform: "uppercase",
//     marginBottom: 8,
//   },
//   summaryRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   summaryText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#0F172A",
//     marginLeft: 8,
//   },

//   // Form Components
//   fieldLabel: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#334155",
//     marginBottom: 8,
//   },
//   segmentedControl: {
//     flexDirection: "row",
//     backgroundColor: "#F1F5F9",
//     borderRadius: 10,
//     padding: 3,
//     marginBottom: 16,
//   },
//   segmentButton: {
//     flex: 1,
//     paddingVertical: 10,
//     alignItems: "center",
//     borderRadius: 8,
//   },
//   segmentButtonActive: {
//     backgroundColor: "#FFFFFF",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   segmentText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#64748B",
//   },
//   segmentTextActive: {
//     color: PRIMARY_COLOR,
//   },

//   // Duration Subfields
//   durationSection: {
//     marginBottom: 16,
//   },
//   textInputWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#CBD5E1",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     height: 44,
//   },
//   modalTextInput: {
//     flex: 1,
//     fontSize: 14,
//     color: "#0F172A",
//   },
//   unitChipContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   unitChip: {
//     flex: 1,
//     paddingVertical: 10,
//     alignItems: "center",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     backgroundColor: "#F8FAFC",
//     marginHorizontal: 3,
//   },
//   unitChipSelected: {
//     borderColor: PRIMARY_COLOR,
//     backgroundColor: "#EFF6FF",
//   },
//   unitChipText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#64748B",
//   },
//   unitChipTextSelected: {
//     color: PRIMARY_COLOR,
//   },

//   // Modal Action Buttons
//   modalActions: {
//     marginTop: 8,
//   },
//   submitButton: {
//     backgroundColor: PRIMARY_COLOR,
//     borderRadius: 10,
//     height: 46,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   submitButtonText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   disabledButton: {
//     opacity: 0.6,
//   },
//   cancelButton: {
//     height: 40,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 6,
//   },
//   cancelButtonText: {
//     color: "#64748B",
//     fontSize: 14,
//     fontWeight: "600",
//   },
// });

// export default StudentFindTutor;
