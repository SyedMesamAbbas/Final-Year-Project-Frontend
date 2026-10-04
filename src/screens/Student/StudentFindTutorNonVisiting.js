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

// ======================================================
// LEARNING DURATION UNITS
// ======================================================

const DURATION_UNITS = [
  "Days",
  "Weeks",
  "Months",
];

// ======================================================
// SORT OPTIONS
//
// Backend accepts:
//
// institute
// feedback
// grade
// fee
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
    label: "Payment",
  },
];

// ======================================================
// COMPONENT
// ======================================================

const StudentFindTutorNonVisiting = ({
  navigation,
  route,
}) => {
  const {
    courseId,
    courseName,
  } = route.params || {};

  // ======================================================
  // TUTOR DATA
  // ======================================================

  const [tutorsData, setTutorsData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Backend default sort = feedback
  const [sortBy, setSortBy] = useState("feedback");

  // ======================================================
  // SELECTED TUTORS
  // ======================================================

  const [selectedTutors, setSelectedTutors] =
    useState([]);

  /*
   * The create-request API sends one common
   * day and one common time for all selected tutors.
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
  // FETCH TUTORS
  // ======================================================

  useEffect(() => {
    fetchTutors(sortBy);
  }, [sortBy]);

  // ======================================================
  // FETCH NON-VISITING TUTORS
  // ======================================================

  const fetchTutors = async (
    selectedSort = "feedback"
  ) => {
    try {
      setLoading(true);

      // ==================================================
      // VALIDATE COURSE
      // ==================================================

      if (!courseId) {
        Alert.alert(
          "Error",
          "Course information is missing."
        );

        navigation.goBack();

        return;
      }

      // ==================================================
      // TOKEN
      // ==================================================

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

      // ==================================================
      // API URL
      //
      // IMPORTANT:
      //
      // Non-Visiting search DOES NOT send:
      //
      // userLat
      // userLng
      // radius
      // distance
      //
      // Backend only requires:
      //
      // courseId
      // sortBy
      // ==================================================

      const url =
        `${BASE_URL}/Student/search-non-visiting-tutors` +
        `?courseId=${encodeURIComponent(courseId)}` +
        `&sortBy=${encodeURIComponent(selectedSort)}`;

      console.log(
        "========================================"
      );

      console.log(
        "SEARCH NON-VISITING TUTORS"
      );

      console.log(
        "COURSE ID:",
        courseId
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
        "========================================"
      );

      // ==================================================
      // API REQUEST
      // ==================================================

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // ==================================================
      // READ RESPONSE
      // ==================================================

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
        "========================================"
      );

      console.log(
        "NON-VISITING SEARCH RESPONSE"
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
        "========================================"
      );

      // ==================================================
      // SUCCESS
      // ==================================================

      if (response.ok) {
        if (
          Array.isArray(
            data?.tutors
          )
        ) {
          setTutorsData(
            data.tutors
          );
        } else {
          setTutorsData([]);
        }

        return;
      }

      // ==================================================
      // ERROR
      // ==================================================

      setTutorsData([]);

      Alert.alert(
        "No Tutors Available",
        data?.message ||
          "No approved Non-Visiting tutors are available."
      );
    } catch (error) {
      console.log(
        "========================================"
      );

      console.log(
        "FETCH NON-VISITING TUTORS ERROR"
      );

      console.log(error);

      console.log(
        "========================================"
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

  const getRoomCapacity = (item) => {
    const value =
      Number(
        item?.lt_room_capacity ?? 0
      );

    return Number.isFinite(value)
      ? value
      : 0;
  };

  const getBookedCount = (item) => {
    const value =
      Number(
        item?.lt_booked_count ?? 0
      );

    return Number.isFinite(value)
      ? value
      : 0;
  };

  const getRemainingCapacity = (item) => {
    const value =
      Number(
        item?.lt_remaining_capacity ?? 0
      );

    return Number.isFinite(value)
      ? value
      : 0;
  };

  // ======================================================
  // CHECK SELECTED TUTOR
  // ======================================================

  const isTutorSelected = (
    tutorId
  ) => {
    return selectedTutors.some(
      (tutor) =>
        Number(
          tutor?.tutor_id
        ) ===
        Number(tutorId)
    );
  };

  // ======================================================
  // SELECT / UNSELECT TUTOR
  // ======================================================

  const toggleTutorSelection = (
    item
  ) => {
    const tutorId =
      Number(
        item?.tutor_id
      );

    if (!tutorId) {
      Alert.alert(
        "Error",
        "Invalid tutor selected."
      );

      return;
    }

    const alreadySelected =
      isTutorSelected(
        tutorId
      );

    // ==================================================
    // REMOVE TUTOR
    // ==================================================

    if (alreadySelected) {
      const updatedTutors =
        selectedTutors.filter(
          (tutor) =>
            Number(
              tutor?.tutor_id
            ) !== tutorId
        );

      setSelectedTutors(
        updatedTutors
      );

      if (
        updatedTutors.length === 0
      ) {
        setSelectedRequestDay("");
        setSelectedRequestTime("");
      }

      return;
    }

    // ==================================================
    // BACKEND ONLY RETURNS AVAILABLE SLOTS
    // ==================================================

    if (
      item?.is_available !== true
    ) {
      Alert.alert(
        "Tutor Unavailable",
        item?.availability_message ||
          "This tutor slot is not available."
      );

      return;
    }

    // ==================================================
    // DAY
    // ==================================================

    const itemDay =
      String(
        item?.day || ""
      ).trim();

    // ==================================================
    // TIME
    // ==================================================

    const itemTime =
      String(
        item?.time || ""
      ).trim();

    if (
      !itemDay ||
      !itemTime
    ) {
      Alert.alert(
        "Invalid Slot",
        "This tutor does not have a valid available day and time."
      );

      return;
    }

    // ==================================================
    // SAME DAY/TIME VALIDATION
    // ==================================================

    if (
      selectedTutors.length > 0 &&
      (
        selectedRequestDay !==
          itemDay ||
        selectedRequestTime !==
          itemTime
      )
    ) {
      Alert.alert(
        "Different Time Slot",
        `Please select tutors with the same day and time.\n\nCurrently selected:\n${selectedRequestDay} • ${selectedRequestTime}\n\nThis tutor:\n${itemDay} • ${itemTime}`
      );

      return;
    }

    // ==================================================
    // ADD TUTOR
    // ==================================================

    const tutorObject = {
      tutor_id:
        tutorId,

      tutor_name:
        item?.tutor_name ||
        "Tutor",

      location:
        item?.location ||
        "",

      qualification:
        item?.qualification ||
        "",

      experience:
        item?.experience ??
        "",

      teaching_mode:
        item?.teaching_mode ||
        "Non-Visiting",

      course_id:
        item?.course_id ??
        Number(courseId),

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

      // ================================================
      // LT ROOM INFORMATION
      // ================================================

      lt_room_id:
        item?.lt_room_id ??
        null,

      lt_room_name:
        item?.lt_room_name ||
        "",

      lt_room_capacity:
        item?.lt_room_capacity ??
        0,

      lt_booked_count:
        item?.lt_booked_count ??
        0,

      lt_remaining_capacity:
        item?.lt_remaining_capacity ??
        0,

      // ================================================
      // SLOT
      // ================================================

      day:
        itemDay,

      time:
        itemTime,

      is_available:
        true,

      availability_message:
        item?.availability_message ||
        "Available",
    };

    setSelectedTutors(
      (previous) => [
        ...previous,
        tutorObject,
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
    if (
      selectedTutors.length === 0
    ) {
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
  // CLEAR SELECTED TUTORS
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
      // LEARNING DURATION
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
                tutor?.tutor_id
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

      // ==================================================
      // REMOVE DUPLICATES
      // ==================================================

      const uniqueTutorIds =
        [
          ...new Set(
            tutorIds
          ),
        ];

      // ==================================================
      // REQUEST BODY
      //
      // Keep the fields expected by the
      // create-request API.
      // ==================================================

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
        "========================================"
      );

      console.log(
        "CREATE NON-VISITING TUTOR REQUEST"
      );

      console.log(
        "URL:",
        `${BASE_URL}/Student/create-request`
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
        "========================================"
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
        "========================================"
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
        "========================================"
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
        const totalTutors =
          data?.total_tutors ??
          uniqueTutorIds.length;

        const currentTutorId =
          data?.current_tutor_id;

        const requestGroupId =
          data?.request_group_id;

        // -----------------------------------------------
        // CLOSE MODAL
        // -----------------------------------------------

        setRequestModal(false);

        // -----------------------------------------------
        // CLEAR SELECTION
        // -----------------------------------------------

        setSelectedTutors([]);

        setSelectedRequestDay("");

        setSelectedRequestTime("");

        // -----------------------------------------------
        // RESET LEARNING MODE
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
            `\n\nRequest started with Tutor #${currentTutorId}.`;
        }

        if (
          data?.response_deadline
        ) {
          successMessage +=
            `\nFirst tutor has 2 minutes to accept.`;
        }

        if (
          requestGroupId
        ) {
          successMessage +=
            `\n\nRequest Group ID: ${requestGroupId}`;
        }

        Alert.alert(
          "Request Sent",
          successMessage
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

      // ==================================================
      // REQUEST GROUP
      // ==================================================

      if (
        data?.request_group_id
      ) {
        additionalMessage +=
          `\n\nRequest Group ID: ${data.request_group_id}`;
      }

      // ==================================================
      // MISSING TUTOR IDS
      // ==================================================

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

      // ==================================================
      // INNER ERROR
      // ==================================================

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
        "========================================"
      );

      console.log(
        "CREATE REQUEST NETWORK ERROR"
      );

      console.log(error);

      console.log(
        "========================================"
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
  // FLATTEN BACKEND RESPONSE
  //
  // Backend response:
  //
  // {
  //   tutor_id,
  //   tutor_name,
  //   location,
  //   qualification,
  //   experience,
  //   teaching_mode,
  //   course_id,
  //   institute,
  //   grade,
  //   hourly_rate,
  //   average_rating,
  //   total_reviews,
  //   common_slots: [
  //     {
  //       day,
  //       time,
  //       is_available,
  //       availability_message,
  //       request_type,
  //       class_date,
  //       lt_room_id,
  //       lt_room_name,
  //       lt_room_capacity,
  //       lt_booked_count,
  //       lt_remaining_capacity
  //     }
  //   ]
  // }
  //
  // IMPORTANT:
  //
  // Backend already does:
  //
  // .Where(x => x.CommonSlots.Any(s => s.is_available))
  //
  // Therefore frontend must NOT create
  // a fake slot when common_slots is empty.
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

        // ==================================================
        // ONLY AVAILABLE SLOTS
        // ==================================================

        return slots
          .filter(
            (slot) =>
              slot?.is_available === true &&
              String(
                slot?.day || ""
              ).trim() !== "" &&
              String(
                slot?.time || ""
              ).trim() !== ""
          )
          .map(
            (
              slot,
              index
            ) => ({
              id:
                `${tutor.tutor_id}-${slot.day}-${slot.time}-${slot.lt_room_id ?? "room"}-${index}`,

              // ============================================
              // TUTOR
              // ============================================

              tutor_id:
                tutor?.tutor_id,

              tutor_name:
                tutor?.tutor_name ||
                "Tutor",

              location:
                tutor?.location ||
                "",

              qualification:
                tutor?.qualification ||
                "",

              experience:
                tutor?.experience ??
                "",

              teaching_mode:
                tutor?.teaching_mode ||
                "Non-Visiting",

              // ============================================
              // COURSE
              // ============================================

              course_id:
                tutor?.course_id ??
                Number(courseId),

              institute:
                tutor?.institute ||
                "",

              grade:
                tutor?.grade ||
                "",

              // ============================================
              // PAYMENT
              // ============================================

              hourly_rate:
                tutor?.hourly_rate ??
                0,

              // ============================================
              // FEEDBACK
              // ============================================

              average_rating:
                tutor?.average_rating ??
                0,

              total_reviews:
                tutor?.total_reviews ??
                0,

              // ============================================
              // SLOT
              // ============================================

              day:
                slot?.day ||
                "",

              time:
                slot?.time ||
                "",

              is_available:
                true,

              availability_message:
                slot?.availability_message ||
                "Available",

              // ============================================
              // LT ROOM
              // ============================================

              lt_room_id:
                slot?.lt_room_id ??
                null,

              lt_room_name:
                slot?.lt_room_name ||
                "LT Room",

              lt_room_capacity:
                slot?.lt_room_capacity ??
                0,

              lt_booked_count:
                slot?.lt_booked_count ??
                0,

              lt_remaining_capacity:
                slot?.lt_remaining_capacity ??
                0,
            })
          );
      }
    );

  // ======================================================
  // SEARCH FILTER
  // ======================================================

  const searchText =
    String(
      search || ""
    )
      .trim()
      .toLowerCase();

  const filteredTutors =
    flattenedTutors.filter(
      (item) => {
        if (!searchText) {
          return true;
        }

        const tutorName =
          String(
            item?.tutor_name ||
              ""
          ).toLowerCase();

        const institute =
          String(
            item?.institute ||
              ""
          ).toLowerCase();

        const qualification =
          String(
            item?.qualification ||
              ""
          ).toLowerCase();

        return (
          tutorName.includes(
            searchText
          ) ||
          institute.includes(
            searchText
          ) ||
          qualification.includes(
            searchText
          )
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
            sortBy ===
            option.key
          ) {
            return;
          }

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

    const roomCapacity =
      getRoomCapacity(item);

    const bookedCount =
      getBookedCount(item);

    const remainingCapacity =
      getRemainingCapacity(item);

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
            INSTITUTE / GRADE
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
            QUALIFICATION / EXPERIENCE
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
              {item?.qualification ||
                "Qualification unavailable"}
            </Text>
          </View>

          <View
            style={
              styles.infoItem
            }
          >
            <Icon
              name="work-history"
              size={15}
              color="#64748B"
            />

            <Text
              style={
                styles.infoText
              }
              numberOfLines={1}
            >
              {item?.experience != null
                ? `${item.experience} years`
                : "Experience N/A"}
            </Text>
          </View>
        </View>

        {/* ==========================================
            PAYMENT
        ========================================== */}

        <View
          style={
            styles.feeRow
          }
        >
          <Icon
            name="payments"
            size={17}
            color={
              PRIMARY_COLOR
            }
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
            styles.locationContainer
          }
        >
          <View
            style={
              styles.metaRow
            }
          >
            <Icon
              name="place"
              size={17}
              color="#64748B"
            />

            <Text
              style={
                styles.metaText
              }
              numberOfLines={2}
            >
              {item?.location ||
                "Tutor location unavailable"}
            </Text>
          </View>

          <View
            style={
              styles.modeBadge
            }
          >
            <Icon
              name="home"
              size={14}
              color={
                PRIMARY_COLOR
              }
            />

            <Text
              style={
                styles.modeBadgeText
              }
            >
              Non-Visiting
            </Text>
          </View>
        </View>

        {/* ==========================================
            LT ROOM
        ========================================== */}

        <View
          style={
            styles.ltRoomCard
          }
        >
          <View
            style={
              styles.ltRoomHeader
            }
          >
            <View
              style={
                styles.ltRoomTitleRow
              }
            >
              <Icon
                name="meeting-room"
                size={18}
                color={
                  PRIMARY_COLOR
                }
              />

              <Text
                style={
                  styles.ltRoomTitle
                }
              >
                {item?.lt_room_name ||
                  "LT Room"}
              </Text>
            </View>

            <View
              style={
                styles.ltAvailableBadge
              }
            >
              <View
                style={
                  styles.ltAvailableDot
                }
              />

              <Text
                style={
                  styles.ltAvailableText
                }
              >
                Available
              </Text>
            </View>
          </View>

          <View
            style={
              styles.ltRoomStats
            }
          >
            <View
              style={
                styles.ltRoomStat
              }
            >
              <Icon
                name="groups"
                size={16}
                color="#64748B"
              />

              <Text
                style={
                  styles.ltRoomStatText
                }
              >
                Capacity:{" "}
                {roomCapacity}
              </Text>
            </View>

            <View
              style={
                styles.ltRoomStat
              }
            >
              <Icon
                name="person"
                size={16}
                color="#64748B"
              />

              <Text
                style={
                  styles.ltRoomStatText
                }
              >
                Booked:{" "}
                {bookedCount}
              </Text>
            </View>

            <View
              style={
                styles.ltRoomStat
              }
            >
              <Icon
                name="event-seat"
                size={16}
                color={
                  PRIMARY_COLOR
                }
              />

              <Text
                style={
                  styles.ltRoomRemainingText
                }
              >
                Remaining:{" "}
                {remainingCapacity}
              </Text>
            </View>
          </View>
        </View>

        {/* ==========================================
            AVAILABLE SLOT
        ========================================== */}

        <View
          style={
            styles.slotCardAvailable
          }
        >
          <View
            style={
              styles.slotHeaderRow
            }
          >
            <View
              style={
                styles.statusBadge
              }
            >
              <View
                style={
                  styles.statusDot
                }
              />

              <Text
                style={
                  styles.statusText
                }
              >
                Available Slot
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
                {item?.day}
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
                {item?.time}
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.availabilityMessage
            }
          >
            {item?.availability_message ||
              "LT room is available for this slot."}
          </Text>
        </View>

        {/* ==========================================
            SELECT BUTTON
        ========================================== */}

        <TouchableOpacity
          style={[
            styles.requestButton,
            selected &&
              styles.requestButtonSelected,
          ]}
          activeOpacity={0.8}
          onPress={() =>
            toggleTutorSelection(
              item
            )
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

      {/* ==================================================
          TOP BAR
      ================================================== */}

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
            NON-VISITING TUTOR
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

      {/* ==================================================
          MODE INFORMATION
      ================================================== */}

      <View
        style={
          styles.modeInformation
        }
      >
        <View
          style={
            styles.modeInformationIcon
          }
        >
          <Icon
            name="home"
            size={18}
            color={
              PRIMARY_COLOR
            }
          />
        </View>

        <View
          style={
            styles.modeInformationTextContainer
          }
        >
          <Text
            style={
              styles.modeInformationTitle
            }
          >
            Non-Visiting Learning
          </Text>

          <Text
            style={
              styles.modeInformationText
            }
          >
            You will attend your class at the tutor's location in an available LT room.
          </Text>
        </View>
      </View>

      {/* ==================================================
          SEARCH
      ================================================== */}

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

      {/* ==================================================
          SORT
      ================================================== */}

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

      {/* ==================================================
          SELECTED TUTOR SUMMARY
      ================================================== */}

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

      {/* ==================================================
          TUTOR LIST
      ================================================== */}

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
            Finding available tutors...
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
                  name="meeting-room"
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
                {search
                  ? "No tutor matches your search."
                  : "No approved Non-Visiting tutors have an available common slot and LT room for this course."}
              </Text>
            </View>
          }
        />
      )}

      {/* ==================================================
          REQUEST MODAL
      ================================================== */}

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
                  (
                    tutor,
                    index
                  ) => (
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

                        <Text
                          style={
                            styles.selectedTutorRoom
                          }
                          numberOfLines={1}
                        >
                          {tutor.lt_room_name ||
                            "LT Room"}{" "}
                          • Remaining:{" "}
                          {
                            tutor.lt_remaining_capacity
                          }
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

                <View
                  style={
                    styles.summaryModeRow
                  }
                >
                  <Icon
                    name="home"
                    size={16}
                    color={
                      PRIMARY_COLOR
                    }
                  />

                  <Text
                    style={
                      styles.summaryModeText
                    }
                  >
                    Student will visit the tutor's location
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryModeRow
                  }
                >
                  <Icon
                    name="meeting-room"
                    size={16}
                    color={
                      PRIMARY_COLOR
                    }
                  />

                  <Text
                    style={
                      styles.summaryModeText
                    }
                  >
                    LT room availability confirmed
                  </Text>
                </View>
              </View>

              {/* ==========================================
                  REQUEST INFORMATION
              ========================================== */}

              <View
                style={
                  styles.infoNotice
                }
              >
                <Icon
                  name="info-outline"
                  size={18}
                  color={
                    PRIMARY_COLOR
                  }
                />

                <Text
                  style={
                    styles.infoNoticeText
                  }
                >
                  The first selected tutor will receive your request first. If the tutor does not accept within 2 minutes, the request can move to the next selected tutor.
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
    fontSize: 10,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },

  // ====================================================
  // MODE INFORMATION
  // ====================================================

  modeInformation: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    flexDirection: "row",
    alignItems: "center",
  },

  modeInformationIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  modeInformationTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  modeInformationTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#115E59",
  },

  modeInformationText: {
    fontSize: 11,
    color: "#0F766E",
    marginTop: 2,
    lineHeight: 16,
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
  // TUTOR INFO
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
    marginTop: 10,
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

  locationContainer: {
    marginTop: 9,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  metaText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    marginLeft: 6,
  },

  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },

  modeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F766E",
    marginLeft: 4,
  },

  // ====================================================
  // LT ROOM
  // ====================================================

  ltRoomCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  ltRoomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ltRoomTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  ltRoomTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 7,
  },

  ltAvailableBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#DCFCE7",
  },

  ltAvailableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 5,
  },

  ltAvailableText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803D",
  },

  ltRoomStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 9,
  },

  ltRoomStat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginTop: 4,
  },

  ltRoomStatText: {
    fontSize: 11,
    color: "#64748B",
    marginLeft: 4,
  },

  ltRoomRemainingText: {
    fontSize: 11,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginLeft: 4,
  },

  // ====================================================
  // SLOT
  // ====================================================

  slotCardAvailable: {
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
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
    backgroundColor: "#DCFCE7",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: "#16A34A",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803D",
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

  availabilityMessage: {
    fontSize: 11,
    color: "#15803D",
    marginTop: 8,
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

  selectedTutorRoom: {
    fontSize: 10,
    fontWeight: "600",
    color: PRIMARY_COLOR,
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

  summaryModeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  summaryModeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#0F766E",
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

export default StudentFindTutorNonVisiting;

















































//By Claude Handle Avaiablility
// import React, { useCallback, useEffect, useRef, useState } from "react";

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
//   RefreshControl,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const PRIMARY_COLOR = colors?.primary || "#249688";

// const DURATION_UNITS = ["Days", "Weeks", "Months"];

// // Backend accepts: institute | feedback | grade | fee
// const SORT_OPTIONS = [
//   { key: "institute", label: "Institute" },
//   { key: "feedback", label: "Feedback" },
//   { key: "grade", label: "Grade" },
//   { key: "fee", label: "Payment" },
// ];

// const DEFAULT_EMPTY_MESSAGE =
//   "No approved Non-Visiting tutors are available for this course.";

// // ======================================================
// // SMALL HELPERS
// // ======================================================

// const toNumber = (value, fallback = 0) => {
//   const n = Number(value);
//   return Number.isFinite(n) ? n : fallback;
// };

// const safeParse = (text) => {
//   try {
//     return text ? JSON.parse(text) : {};
//   } catch (e) {
//     return { message: text || "Invalid server response." };
//   }
// };

// const formatClassDate = (value) => {
//   if (!value) return "";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return String(value);
//   return d.toDateString();
// };

// const StudentFindTutorNonVisiting = ({ navigation, route }) => {
//   const { courseId, courseName } = route.params || {};

//   // ======================================================
//   // STATE
//   // ======================================================

//   const [tutorsData, setTutorsData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [emptyMessage, setEmptyMessage] = useState(DEFAULT_EMPTY_MESSAGE);

//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("feedback");

//   const [selectedTutors, setSelectedTutors] = useState([]);
//   const [selectedRequestDay, setSelectedRequestDay] = useState("");
//   const [selectedRequestTime, setSelectedRequestTime] = useState("");

//   const [requestModal, setRequestModal] = useState(false);
//   const [learningMode, setLearningMode] = useState("FullTime");
//   const [learningDuration, setLearningDuration] = useState("");
//   const [learningDurationUnit, setLearningDurationUnit] = useState("Weeks");
//   const [requestLoading, setRequestLoading] = useState(false);

//   // Prevents an older (slower) response from overwriting a newer one
//   const latestFetchId = useRef(0);

//   // ======================================================
//   // FETCH NON-VISITING TUTORS
//   // GET /Student/search-non-visiting-tutors?courseId=&sortBy=
//   // ======================================================

//   const fetchTutors = useCallback(
//     async (selectedSort = "feedback", isRefresh = false) => {
//       const fetchId = ++latestFetchId.current;

//       try {
//         if (!isRefresh) setLoading(true);

//         if (!courseId) {
//           Alert.alert("Error", "Course information is missing.");
//           navigation.goBack();
//           return;
//         }

//         const token = await AsyncStorage.getItem("token");

//         if (!token) {
//           Alert.alert(
//             "Authentication Error",
//             "Your login session has expired. Please login again."
//           );
//           setTutorsData([]);
//           setEmptyMessage("Please login again to continue.");
//           return;
//         }

//         const url =
//           `${BASE_URL}/Student/search-non-visiting-tutors` +
//           `?courseId=${encodeURIComponent(courseId)}` +
//           `&sortBy=${encodeURIComponent(selectedSort)}`;

//         console.log("SEARCH NON-VISITING TUTORS:", url);

//         const response = await fetch(url, {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const data = safeParse(await response.text());

//         console.log("NON-VISITING RESPONSE STATUS:", response.status);

//         // A newer request has started; ignore this result
//         if (fetchId !== latestFetchId.current) return;

//         // ---------------- SUCCESS ----------------
//         if (response.ok) {
//           const list = Array.isArray(data?.tutors) ? data.tutors : [];
//           setTutorsData(list);
//           setEmptyMessage(DEFAULT_EMPTY_MESSAGE);
//           return;
//         }

//         // ---------------- ERRORS ----------------
//         setTutorsData([]);

//         if (response.status === 401) {
//           setEmptyMessage(data?.message || "Please login again to continue.");
//           Alert.alert(
//             "Authentication Error",
//             data?.message || "Your login session has expired."
//           );
//           return;
//         }

//         /*
//          * 404 is a normal "nothing found" answer from the backend:
//          *  - Course not found
//          *  - Student has no schedules defined
//          *  - No tutors / no LT room capacity
//          * Show the backend message inside the empty state instead of
//          * interrupting the user with an alert.
//          */
//         if (response.status === 404) {
//           setEmptyMessage(data?.message || DEFAULT_EMPTY_MESSAGE);
//           return;
//         }

//         // 500 / anything else
//         setEmptyMessage(
//           data?.message || "Unable to load available tutors right now."
//         );
//         Alert.alert(
//           "Error",
//           data?.message || "Unable to load available tutors."
//         );
//       } catch (error) {
//         console.log("FETCH NON-VISITING TUTORS ERROR:", error);

//         if (fetchId !== latestFetchId.current) return;

//         setTutorsData([]);
//         setEmptyMessage("Unable to connect to the server.");
//         Alert.alert("Error", "Unable to load available tutors.");
//       } finally {
//         if (fetchId === latestFetchId.current) {
//           setLoading(false);
//           setRefreshing(false);
//         }
//       }
//     },
//     [courseId, navigation]
//   );

//   useEffect(() => {
//     fetchTutors(sortBy);
//   }, [sortBy, fetchTutors]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchTutors(sortBy, true);
//   };

//   // ======================================================
//   // DISPLAY HELPERS
//   // ======================================================

//   const getInstitute = (item) => item?.institute || "Institute unavailable";
//   const getGrade = (item) => item?.grade || "N/A";
//   const getHourlyRate = (item) => toNumber(item?.hourly_rate, 0);
//   const getRating = (item) => toNumber(item?.average_rating, 0);
//   const getReviewCount = (item) => toNumber(item?.total_reviews, 0);

//   // ======================================================
//   // SELECTION HELPERS
//   // ======================================================

//   const isTutorSelected = (tutorId) =>
//     selectedTutors.some((t) => Number(t.tutor_id) === Number(tutorId));

//   // A tutor can appear on several cards (one per common slot).
//   // Only the exact slot that was chosen is shown as selected.
//   const isSlotSelected = (item) =>
//     selectedTutors.some(
//       (t) =>
//         Number(t.tutor_id) === Number(item?.tutor_id) &&
//         t.day === String(item?.day || "").trim() &&
//         t.time === String(item?.time || "").trim()
//     );

//   const removeTutor = (tutorId) => {
//     const updated = selectedTutors.filter(
//       (t) => Number(t.tutor_id) !== Number(tutorId)
//     );

//     setSelectedTutors(updated);

//     if (updated.length === 0) {
//       setSelectedRequestDay("");
//       setSelectedRequestTime("");
//       setRequestModal(false);
//     }
//   };

//   const toggleTutorSelection = (item) => {
//     const tutorId = Number(item?.tutor_id);

//     if (!tutorId) {
//       Alert.alert("Error", "Invalid tutor selected.");
//       return;
//     }

//     const itemDay = String(item?.day || "").trim();
//     const itemTime = String(item?.time || "").trim();

//     // ---------------- UNSELECT ----------------
//     if (isSlotSelected(item)) {
//       removeTutor(tutorId);
//       return;
//     }

//     // Same tutor already selected with a different slot
//     if (isTutorSelected(tutorId)) {
//       Alert.alert(
//         "Tutor Already Selected",
//         "This tutor is already selected with another slot. Unselect that slot first."
//       );
//       return;
//     }

//     // ---------------- UNAVAILABLE ----------------
//     if (item?.is_available === false) {
//       Alert.alert(
//         "Slot Unavailable",
//         "This slot already has an accepted class and cannot be requested."
//       );
//       return;
//     }

//     // ---------------- VALID SLOT ----------------
//     if (!itemDay || !itemTime) {
//       Alert.alert(
//         "Invalid Slot",
//         "This tutor does not have a valid day or time slot."
//       );
//       return;
//     }

//     // ---------------- SAME DAY/TIME ----------------
//     if (
//       selectedTutors.length > 0 &&
//       (selectedRequestDay !== itemDay || selectedRequestTime !== itemTime)
//     ) {
//       Alert.alert(
//         "Different Time Slot",
//         `Please select tutors with the same day and time.\n\nSelected:\n${selectedRequestDay}\n${selectedRequestTime}`
//       );
//       return;
//     }

//     // ---------------- ADD ----------------
//     setSelectedTutors((previous) => [
//       ...previous,
//       {
//         tutor_id: tutorId,
//         tutor_name: item?.tutor_name || "Tutor",
//         location: item?.location || "",
//         qualification: item?.qualification || "",
//         experience: item?.experience ?? "",
//         teaching_mode: item?.teaching_mode || "Non-Visiting",
//         institute: item?.institute || "",
//         grade: item?.grade || "",
//         hourly_rate: item?.hourly_rate ?? 0,
//         average_rating: item?.average_rating ?? 0,
//         total_reviews: item?.total_reviews ?? 0,
//         lt_room_name: item?.lt_room_name || "",
//         day: itemDay,
//         time: itemTime,
//       },
//     ]);

//     setSelectedRequestDay(itemDay);
//     setSelectedRequestTime(itemTime);
//   };

//   // ======================================================
//   // MODAL CONTROLS
//   // ======================================================

//   const resetLearningFields = () => {
//     setLearningMode("FullTime");
//     setLearningDuration("");
//     setLearningDurationUnit("Weeks");
//   };

//   const openRequestModal = () => {
//     if (selectedTutors.length === 0) {
//       Alert.alert("Select Tutor", "Please select at least one tutor first.");
//       return;
//     }

//     if (!selectedRequestDay || !selectedRequestTime) {
//       Alert.alert("Missing Slot", "Selected tutor day or time is missing.");
//       return;
//     }

//     resetLearningFields();
//     setRequestModal(true);
//   };

//   const closeRequestModal = () => {
//     if (requestLoading) return;
//     setRequestModal(false);
//     resetLearningFields();
//   };

//   const clearSelectedTutors = () => {
//     if (requestLoading) return;
//     setSelectedTutors([]);
//     setSelectedRequestDay("");
//     setSelectedRequestTime("");
//   };

//   // ======================================================
//   // SEND REQUEST
//   // POST /Student/create-request
//   // ======================================================

//   const sendRequest = async () => {
//     if (requestLoading) return;

//     try {
//       if (!selectedTutors || selectedTutors.length === 0) {
//         Alert.alert("Validation Error", "Please select at least one tutor.");
//         return;
//       }

//       if (!courseId) {
//         Alert.alert("Validation Error", "Course is not selected.");
//         return;
//       }

//       if (!selectedRequestDay) {
//         Alert.alert("Validation Error", "Please select a day.");
//         return;
//       }

//       if (!selectedRequestTime) {
//         Alert.alert("Validation Error", "Please select a time slot.");
//         return;
//       }

//       if (!learningMode) {
//         Alert.alert("Validation Error", "Learning mode is required.");
//         return;
//       }

//       let durationValue = null;
//       let durationUnitValue = null;

//       if (learningMode === "SpecificTime") {
//         const parsedDuration = Number(String(learningDuration).trim());

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

//         durationValue = parsedDuration;
//         durationUnitValue = learningDurationUnit;
//       }

//       const tutorIds = selectedTutors
//         .map((t) => Number(t.tutor_id))
//         .filter((id) => Number.isInteger(id) && id > 0);

//       if (tutorIds.length === 0) {
//         Alert.alert("Validation Error", "No valid tutor was selected.");
//         return;
//       }

//       const uniqueTutorIds = [...new Set(tutorIds)];

//       const requestBody = {
//         tutor_ids: uniqueTutorIds,
//         course_id: Number(courseId),
//         day: String(selectedRequestDay).trim(),
//         time: String(selectedRequestTime).trim(),
//         learning_mode: learningMode,
//         learning_duration: durationValue,
//         learning_duration_unit: durationUnitValue,
//       };

//       console.log("CREATE REQUEST BODY:", JSON.stringify(requestBody, null, 2));

//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert(
//           "Authentication Error",
//           "Your login session has expired. Please login again."
//         );
//         return;
//       }

//       setRequestLoading(true);

//       const response = await fetch(`${BASE_URL}/Student/create-request`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const data = safeParse(await response.text());

//       console.log("CREATE REQUEST STATUS:", response.status);

//       // ---------------- SUCCESS ----------------
//       if (response.ok) {
//         const totalTutors = data?.total_tutors ?? uniqueTutorIds.length;
//         const currentTutorId = data?.current_tutor_id;
//         const requestGroupId = data?.request_group_id;

//         setRequestModal(false);
//         setSelectedTutors([]);
//         setSelectedRequestDay("");
//         setSelectedRequestTime("");
//         resetLearningFields();

//         let successMessage =
//           data?.message || "Tutor request created successfully.";

//         successMessage += `\n\n${totalTutors} tutor${
//           totalTutors === 1 ? "" : "s"
//         } selected.`;

//         if (currentTutorId) {
//           successMessage += `\n\nRequest has started with Tutor #${currentTutorId}.`;
//         }

//         if (data?.response_deadline) {
//           const deadline = new Date(data.response_deadline);
//           if (!Number.isNaN(deadline.getTime())) {
//             successMessage += `\nFirst tutor has 2 minutes to accept.`;
//           }
//         }

//         if (requestGroupId) {
//           successMessage += `\n\nRequest Group ID: ${requestGroupId}`;
//         }

//         Alert.alert("Request Sent", successMessage, [{ text: "OK" }]);

//         // Slots may have changed after a request, reload the list
//         fetchTutors(sortBy, true);

//         return;
//       }

//       // ---------------- BACKEND ERROR ----------------
//       const serverMessage =
//         data?.message ||
//         data?.error ||
//         data?.title ||
//         data?.detail ||
//         `Server returned HTTP ${response.status}.`;

//       let additionalMessage = "";

//       if (data?.request_group_id) {
//         additionalMessage += `\n\nRequest Group ID: ${data.request_group_id}`;
//       }

//       if (
//         Array.isArray(data?.missing_tutor_ids) &&
//         data.missing_tutor_ids.length > 0
//       ) {
//         additionalMessage += `\n\nMissing Tutor IDs: ${data.missing_tutor_ids.join(
//           ", "
//         )}`;
//       }

//       if (data?.inner_error) {
//         additionalMessage += `\n\nDetails: ${data.inner_error}`;
//       }

//       Alert.alert(
//         `Request Failed (${response.status})`,
//         `${serverMessage}${additionalMessage}`
//       );
//     } catch (error) {
//       console.log("CREATE REQUEST NETWORK ERROR:", error);

//       Alert.alert(
//         "Request Failed",
//         error?.message || "Unable to connect to the server."
//       );
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   // ======================================================
//   // FLATTEN TUTORS + COMMON SLOTS
//   //
//   // Backend tutor:
//   // { tutor_id, tutor_name, location, qualification, experience,
//   //   teaching_mode, course_id, institute, grade, hourly_rate,
//   //   average_rating, total_reviews,
//   //   common_slots: [{ day, time, is_available, availability_message,
//   //     request_type, class_date, lt_room_id, lt_room_name,
//   //     lt_room_capacity, lt_booked_count, lt_remaining_capacity }] }
//   // ======================================================

//   const flattenedTutors = tutorsData.flatMap((tutor) => {
//     const slots = Array.isArray(tutor?.common_slots) ? tutor.common_slots : [];

//     const base = {
//       tutor_id: tutor.tutor_id,
//       tutor_name: tutor.tutor_name,
//       location: tutor.location,
//       qualification: tutor.qualification,
//       experience: tutor.experience,
//       teaching_mode: tutor.teaching_mode,
//       course_id: tutor.course_id,
//       institute: tutor.institute,
//       grade: tutor.grade,
//       hourly_rate: tutor.hourly_rate,
//       average_rating: tutor.average_rating,
//       total_reviews: tutor.total_reviews,
//     };

//     // Backend only returns tutors with a slot, but stay safe.
//     if (slots.length === 0) {
//       return [
//         {
//           ...base,
//           id: `tutor-${tutor.tutor_id}`,
//           day: "",
//           time: "",
//           is_available: false,
//           availability_message: "No common slot available.",
//           request_type: "",
//           class_date: null,
//           lt_room_id: null,
//           lt_room_name: "",
//           lt_room_capacity: 0,
//           lt_booked_count: 0,
//           lt_remaining_capacity: 0,
//         },
//       ];
//     }

//     return slots.map((slot, index) => ({
//       ...base,
//       id: `${tutor.tutor_id}-${slot?.day}-${slot?.time}-${index}`,
//       day: slot?.day || "",
//       time: slot?.time || "",
//       is_available: slot?.is_available !== false,
//       availability_message: slot?.availability_message || "",
//       request_type: slot?.request_type || "",
//       class_date: slot?.class_date || null,
//       lt_room_id: slot?.lt_room_id ?? null,
//       lt_room_name: slot?.lt_room_name || "",
//       lt_room_capacity: toNumber(slot?.lt_room_capacity, 0),
//       lt_booked_count: toNumber(slot?.lt_booked_count, 0),
//       lt_remaining_capacity: toNumber(slot?.lt_remaining_capacity, 0),
//     }));
//   });

//   // ======================================================
//   // SEARCH FILTER
//   // ======================================================

//   const searchText = String(search || "").trim().toLowerCase();

//   const filteredTutors = flattenedTutors.filter((item) =>
//     String(item?.tutor_name || "").toLowerCase().includes(searchText)
//   );

//   // ======================================================
//   // SORT BUTTON
//   // ======================================================

//   const renderSortButton = (option) => {
//     const active = sortBy === option.key;

//     return (
//       <TouchableOpacity
//         key={option.key}
//         activeOpacity={0.8}
//         style={[styles.sortButton, active && styles.sortButtonActive]}
//         onPress={() => {
//           if (sortBy === option.key) return;
//           setSortBy(option.key); // backend performs the sorting
//         }}
//       >
//         <Text
//           style={[styles.sortButtonText, active && styles.sortButtonTextActive]}
//         >
//           {option.label}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   // ======================================================
//   // RENDER TUTOR CARD
//   // ======================================================

//   const renderTutor = ({ item }) => {
//     const unavailable = item?.is_available === false;
//     const selected = isSlotSelected(item);

//     const rating = getRating(item);
//     const reviews = getReviewCount(item);
//     const institute = getInstitute(item);
//     const grade = getGrade(item);
//     const hourlyRate = getHourlyRate(item);

//     const hasLtInfo = !!item?.lt_room_name;
//     const classDateText = formatClassDate(item?.class_date);

//     const unavailableText = item?.request_type
//       ? `This slot already has an accepted ${item.request_type} class${
//           classDateText ? ` on ${classDateText}` : ""
//         }.`
//       : "This slot is not available for a new request.";

//     return (
//       <View style={[styles.card, selected && styles.cardSelected]}>
//         {/* HEADER */}
//         <View style={styles.cardHeader}>
//           <View style={styles.avatarContainer}>
//             <Text style={styles.avatarText}>
//               {item?.tutor_name
//                 ? item.tutor_name.charAt(0).toUpperCase()
//                 : "T"}
//             </Text>
//           </View>

//           <View style={styles.headerInfo}>
//             <Text style={styles.tutorName} numberOfLines={1}>
//               {item?.tutor_name || "Tutor"}
//             </Text>

//             <View style={styles.ratingRow}>
//               <Icon name="star" size={16} color="#F59E0B" />
//               <Text style={styles.ratingVal}>{rating.toFixed(1)}</Text>
//               <Text style={styles.reviewCount}>({reviews} reviews)</Text>
//             </View>
//           </View>

//           <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
//             {selected && <Icon name="check" size={18} color="#FFFFFF" />}
//           </View>
//         </View>

//         {/* INSTITUTE / GRADE */}
//         <View style={styles.tutorInfoRow}>
//           <View style={styles.infoItem}>
//             <Icon name="account-balance" size={15} color="#64748B" />
//             <Text style={styles.infoText} numberOfLines={1}>
//               {institute}
//             </Text>
//           </View>

//           <View style={styles.infoItem}>
//             <Icon name="grade" size={15} color="#64748B" />
//             <Text style={styles.infoText}>Grade: {grade}</Text>
//           </View>
//         </View>

//         {/* QUALIFICATION / EXPERIENCE */}
//         <View style={styles.tutorInfoRow}>
//           <View style={styles.infoItem}>
//             <Icon name="school" size={15} color="#64748B" />
//             <Text style={styles.infoText} numberOfLines={1}>
//               {item?.qualification || "Qualification unavailable"}
//             </Text>
//           </View>

//           <View style={styles.infoItem}>
//             <Icon name="work" size={15} color="#64748B" />
//             <Text style={styles.infoText} numberOfLines={1}>
//               {item?.experience != null && item?.experience !== ""
//                 ? `${item.experience} years`
//                 : "Experience N/A"}
//             </Text>
//           </View>
//         </View>

//         {/* PAYMENT */}
//         <View style={styles.feeRow}>
//           <Icon name="attach-money" size={17} color={PRIMARY_COLOR} />
//           <Text style={styles.feeText}>Rs. {hourlyRate} / hour</Text>
//         </View>

//         {/* LOCATION (no distance / radius for Non-Visiting) */}
//         <View style={styles.locationContainer}>
//           <View style={styles.metaRow}>
//             <Icon name="place" size={17} color="#64748B" />
//             <Text style={styles.metaText} numberOfLines={2}>
//               {item?.location || "Tutor location unavailable"}
//             </Text>
//           </View>

//           <View style={styles.modeBadge}>
//             <Icon name="home" size={14} color={PRIMARY_COLOR} />
//             <Text style={styles.modeBadgeText}>Non-Visiting</Text>
//           </View>
//         </View>

//         {/* SLOT */}
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
//               <Text style={styles.slotDetailText}>{item?.day || "Day"}</Text>
//             </View>

//             <View style={styles.slotDetailItem}>
//               <Icon name="schedule" size={16} color="#475569" />
//               <Text style={styles.slotDetailText}>{item?.time || "Time"}</Text>
//             </View>
//           </View>

//           {/* LT ROOM INFO */}
//           {hasLtInfo && (
//             <View style={styles.ltRow}>
//               <Icon name="meeting-room" size={16} color="#475569" />
//               <Text style={styles.ltText} numberOfLines={2}>
//                 {item.lt_room_name}
//                 {item.lt_room_capacity > 0
//                   ? ` • ${item.lt_remaining_capacity} of ${item.lt_room_capacity} places left`
//                   : ""}
//               </Text>
//             </View>
//           )}

//           {/* UNAVAILABLE NOTICE */}
//           {unavailable && (
//             <View style={styles.unavailableNotice}>
//               <Icon name="info-outline" size={16} color="#D97706" />
//               <View style={styles.noticeTextContainer}>
//                 <Text style={styles.noticeMessage}>{unavailableText}</Text>
//               </View>
//             </View>
//           )}
//         </View>

//         {/* SELECT BUTTON */}
//         <TouchableOpacity
//           style={[
//             styles.requestButton,
//             selected && styles.requestButtonSelected,
//             unavailable && styles.requestButtonDisabled,
//           ]}
//           activeOpacity={0.8}
//           disabled={unavailable}
//           onPress={() => toggleTutorSelection(item)}
//         >
//           <Icon
//             name={selected ? "check-circle" : "add-circle-outline"}
//             size={18}
//             color="#FFFFFF"
//           />
//           <Text style={styles.requestButtonText}>
//             {unavailable
//               ? "Not Available"
//               : selected
//               ? "Tutor Selected"
//               : "Select Tutor"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // ======================================================
//   // MAIN UI
//   // ======================================================

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

//       {/* TOP BAR */}
//       <View style={styles.topBar}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Icon name="arrow-back" size={22} color="#0F172A" />
//         </TouchableOpacity>

//         <View style={styles.titleContainer}>
//           <Text style={styles.headerSubtitle}>NON-VISITING TUTOR</Text>
//           <Text style={styles.headerTitle} numberOfLines={1}>
//             {courseName || "Available Tutors"}
//           </Text>
//         </View>

//         <View style={{ width: 40 }} />
//       </View>

//       {/* MODE INFORMATION */}
//       <View style={styles.modeInformation}>
//         <View style={styles.modeInformationIcon}>
//           <Icon name="home" size={18} color={PRIMARY_COLOR} />
//         </View>

//         <View style={styles.modeInformationTextContainer}>
//           <Text style={styles.modeInformationTitle}>Tutor's Location</Text>
//           <Text style={styles.modeInformationText}>
//             You will visit the tutor's location for your classes.
//           </Text>
//         </View>
//       </View>

//       {/* SEARCH */}
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

//       {/* SORT */}
//       <View style={styles.sortSection}>
//         <Text style={styles.sortLabel}>Sort by:</Text>
//         <View style={styles.sortButtonsRow}>
//           {SORT_OPTIONS.map(renderSortButton)}
//         </View>
//       </View>

//       {/* SELECTED SUMMARY */}
//       {selectedTutors.length > 0 && (
//         <View style={styles.selectionBar}>
//           <View style={styles.selectionInfo}>
//             <View style={styles.selectionCountCircle}>
//               <Text style={styles.selectionCountText}>
//                 {selectedTutors.length}
//               </Text>
//             </View>

//             <View style={styles.selectionTextContainer}>
//               <Text style={styles.selectionTitle}>
//                 Tutor{selectedTutors.length === 1 ? "" : "s"} Selected
//               </Text>
//               <Text style={styles.selectionSubtitle} numberOfLines={1}>
//                 {selectedRequestDay} • {selectedRequestTime}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.selectionActions}>
//             <TouchableOpacity
//               onPress={clearSelectedTutors}
//               style={styles.clearButton}
//             >
//               <Icon name="clear" size={18} color="#64748B" />
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={openRequestModal}
//               style={styles.continueButton}
//             >
//               <Text style={styles.continueButtonText}>Continue</Text>
//               <Icon name="arrow-forward" size={17} color="#FFFFFF" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* LIST */}
//       {loading ? (
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color={PRIMARY_COLOR} />
//           <Text style={styles.loadingText}>Finding available tutors...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredTutors}
//           keyExtractor={(item) => String(item.id)}
//           renderItem={renderTutor}
//           contentContainerStyle={[
//             styles.listContent,
//             selectedTutors.length > 0 && styles.listContentWithSelection,
//           ]}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={[PRIMARY_COLOR]}
//               tintColor={PRIMARY_COLOR}
//             />
//           }
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <View style={styles.emptyIconCircle}>
//                 <Icon name="search-off" size={32} color="#94A3B8" />
//               </View>

//               <Text style={styles.emptyTitle}>No Tutors Available</Text>

//               <Text style={styles.emptySubtext}>
//                 {search ? "No tutor matches your search." : emptyMessage}
//               </Text>

//               {!search && (
//                 <TouchableOpacity
//                   style={styles.retryButton}
//                   onPress={() => fetchTutors(sortBy)}
//                 >
//                   <Icon name="refresh" size={16} color={PRIMARY_COLOR} />
//                   <Text style={styles.retryButtonText}>Try again</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           }
//         />
//       )}

//       {/* REQUEST MODAL */}
//       <Modal
//         visible={requestModal}
//         transparent
//         animationType="fade"
//         onRequestClose={closeRequestModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             {/* MODAL HEADER */}
//             <View style={styles.modalHeader}>
//               <View style={styles.modalHeaderTextContainer}>
//                 <Text style={styles.modalHeaderTitle}>Class Request</Text>
//                 <Text style={styles.modalHeaderSubtitle}>
//                   {selectedTutors.length} tutor
//                   {selectedTutors.length === 1 ? "" : "s"} selected
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
//               keyboardShouldPersistTaps="handled"
//             >
//               {/* SELECTED TUTORS */}
//               <Text style={styles.fieldLabel}>Selected Tutors</Text>

//               <View style={styles.selectedTutorsContainer}>
//                 {selectedTutors.map((tutor, index) => (
//                   <View
//                     key={`${tutor.tutor_id}-${index}`}
//                     style={styles.selectedTutorRow}
//                   >
//                     <View style={styles.selectedTutorAvatar}>
//                       <Text style={styles.selectedTutorAvatarText}>
//                         {tutor?.tutor_name
//                           ? tutor.tutor_name.charAt(0).toUpperCase()
//                           : "T"}
//                       </Text>
//                     </View>

//                     <View style={styles.selectedTutorInfo}>
//                       <Text style={styles.selectedTutorName} numberOfLines={1}>
//                         {tutor.tutor_name}
//                       </Text>

//                       <Text
//                         style={styles.selectedTutorDetails}
//                         numberOfLines={1}
//                       >
//                         {tutor.institute || "Institute unavailable"}
//                       </Text>
//                     </View>

//                     <TouchableOpacity
//                       disabled={requestLoading}
//                       onPress={() => removeTutor(tutor.tutor_id)}
//                       style={styles.removeTutorButton}
//                     >
//                       <Icon name="close" size={18} color="#64748B" />
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//               </View>

//               {/* SELECTED SLOT */}
//               <View style={styles.summaryCard}>
//                 <Text style={styles.summaryTitle}>Selected Slot</Text>

//                 <View style={styles.summaryRow}>
//                   <Icon name="event" size={16} color={PRIMARY_COLOR} />
//                   <Text style={styles.summaryText}>{selectedRequestDay}</Text>
//                 </View>

//                 <View style={styles.summaryRow}>
//                   <Icon name="schedule" size={16} color={PRIMARY_COLOR} />
//                   <Text style={styles.summaryText}>{selectedRequestTime}</Text>
//                 </View>

//                 <View style={styles.summaryModeRow}>
//                   <Icon name="home" size={16} color={PRIMARY_COLOR} />
//                   <Text style={styles.summaryModeText}>
//                     Student will visit tutor
//                   </Text>
//                 </View>
//               </View>

//               {/* INFORMATION */}
//               <View style={styles.infoNotice}>
//                 <Icon name="info-outline" size={18} color={PRIMARY_COLOR} />
//                 <Text style={styles.infoNoticeText}>
//                   The first selected tutor will receive your request first. If
//                   the tutor does not accept within 2 minutes, the request can
//                   move to the next selected tutor.
//                 </Text>
//               </View>

//               {/* LEARNING MODE */}
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
//                     learningMode === "SpecificTime" &&
//                       styles.segmentButtonActive,
//                   ]}
//                   onPress={() => setLearningMode("SpecificTime")}
//                 >
//                   <Text
//                     style={[
//                       styles.segmentText,
//                       learningMode === "SpecificTime" &&
//                         styles.segmentTextActive,
//                     ]}
//                   >
//                     Specific Time
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {/* DURATION */}
//               {learningMode === "SpecificTime" && (
//                 <View style={styles.durationSection}>
//                   <Text style={styles.fieldLabel}>Duration Value</Text>

//                   <View style={styles.textInputWrapper}>
//                     <Icon
//                       name="timer"
//                       size={18}
//                       color="#94A3B8"
//                       style={{ marginRight: 8 }}
//                     />

//                     <TextInput
//                       placeholder="e.g. 4"
//                       placeholderTextColor="#94A3B8"
//                       keyboardType="numeric"
//                       value={learningDuration}
//                       onChangeText={setLearningDuration}
//                       style={styles.modalTextInput}
//                     />
//                   </View>

//                   <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
//                     Duration Unit
//                   </Text>

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

//               {/* ACTIONS */}
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
//                     <>
//                       <Icon
//                         name="send"
//                         size={17}
//                         color="#FFFFFF"
//                         style={{ marginRight: 7 }}
//                       />
//                       <Text style={styles.submitButtonText}>
//                         Send Request to {selectedTutors.length} Tutor
//                         {selectedTutors.length === 1 ? "" : "s"}
//                       </Text>
//                     </>
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
// // STYLES
// // ======================================================

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },

//   // TOP BAR
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
//     fontSize: 10,
//     fontWeight: "700",
//     color: PRIMARY_COLOR,
//     textTransform: "uppercase",
//     letterSpacing: 0.6,
//   },
//   headerTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#0F172A",
//     marginTop: 2,
//   },

//   // MODE INFORMATION
//   modeInformation: {
//     marginHorizontal: 16,
//     marginTop: 12,
//     padding: 11,
//     borderRadius: 12,
//     backgroundColor: "#F0FDFA",
//     borderWidth: 1,
//     borderColor: "#CCFBF1",
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   modeInformationIcon: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "#FFFFFF",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   modeInformationTextContainer: {
//     flex: 1,
//     marginLeft: 9,
//   },
//   modeInformationTitle: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#115E59",
//   },
//   modeInformationText: {
//     fontSize: 11,
//     color: "#0F766E",
//     marginTop: 2,
//     lineHeight: 16,
//   },

//   // SEARCH
//   searchSection: {
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: 8,
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

//   // SORT
//   sortSection: {
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     paddingTop: 4,
//     backgroundColor: "#F8FAFC",
//   },
//   sortLabel: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#334155",
//     marginBottom: 8,
//   },
//   sortButtonsRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   sortButton: {
//     flex: 1,
//     height: 38,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "#CBD5E1",
//     backgroundColor: "#F1F5F9",
//     alignItems: "center",
//     justifyContent: "center",
//     marginHorizontal: 3,
//   },
//   sortButtonActive: {
//     backgroundColor: PRIMARY_COLOR,
//     borderColor: PRIMARY_COLOR,
//   },
//   sortButtonText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#475569",
//   },
//   sortButtonTextActive: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//   },

//   // SELECTION BAR
//   selectionBar: {
//     marginHorizontal: 16,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#D1FAE5",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   selectionInfo: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   selectionCountCircle: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: PRIMARY_COLOR,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   selectionCountText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "700",
//   },
//   selectionTextContainer: {
//     flex: 1,
//     marginLeft: 9,
//   },
//   selectionTitle: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#0F172A",
//   },
//   selectionSubtitle: {
//     fontSize: 11,
//     color: "#64748B",
//     marginTop: 2,
//   },
//   selectionActions: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginLeft: 8,
//   },
//   clearButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#F1F5F9",
//     marginRight: 6,
//   },
//   continueButton: {
//     height: 36,
//     paddingHorizontal: 12,
//     borderRadius: 9,
//     backgroundColor: PRIMARY_COLOR,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   continueButtonText: {
//     color: "#FFFFFF",
//     fontSize: 12,
//     fontWeight: "700",
//     marginRight: 5,
//   },

//   // LOADING
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

//   // LIST
//   listContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 40,
//     flexGrow: 1,
//   },
//   listContentWithSelection: {
//     paddingBottom: 60,
//   },

//   // CARD
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
//   cardSelected: {
//     borderColor: PRIMARY_COLOR,
//     borderWidth: 2,
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
//     marginRight: 8,
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

//   // CHECKBOX
//   checkbox: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     borderWidth: 2,
//     borderColor: "#CBD5E1",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   checkboxSelected: {
//     backgroundColor: PRIMARY_COLOR,
//     borderColor: PRIMARY_COLOR,
//   },

//   // TUTOR INFORMATION
//   tutorInfoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 12,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: "#F1F5F9",
//   },
//   infoItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     marginRight: 8,
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 12,
//     color: "#475569",
//     marginLeft: 5,
//   },

//   // FEE
//   feeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   feeText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: PRIMARY_COLOR,
//     marginLeft: 6,
//   },

//   // LOCATION
//   locationContainer: {
//     marginTop: 9,
//     paddingTop: 9,
//     borderTopWidth: 1,
//     borderTopColor: "#F1F5F9",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     marginRight: 8,
//   },
//   metaText: {
//     flex: 1,
//     fontSize: 12,
//     color: "#475569",
//     marginLeft: 6,
//   },
//   modeBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//     borderRadius: 8,
//     backgroundColor: "#F0FDFA",
//     borderWidth: 1,
//     borderColor: "#CCFBF1",
//   },
//   modeBadgeText: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: "#0F766E",
//     marginLeft: 4,
//   },

//   // SLOT
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
//   ltRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   ltText: {
//     flex: 1,
//     fontSize: 12,
//     color: "#475569",
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

//   // REQUEST BUTTON
//   requestButton: {
//     backgroundColor: PRIMARY_COLOR,
//     borderRadius: 10,
//     height: 44,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 14,
//   },
//   requestButtonSelected: {
//     backgroundColor: "#15803D",
//   },
//   requestButtonDisabled: {
//     opacity: 0.5,
//   },
//   requestButtonText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "600",
//     marginLeft: 6,
//   },

//   // EMPTY
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
//   retryButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 16,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: PRIMARY_COLOR,
//   },
//   retryButtonText: {
//     color: PRIMARY_COLOR,
//     fontSize: 13,
//     fontWeight: "600",
//     marginLeft: 6,
//   },

//   // MODAL
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(15, 23, 42, 0.5)",
//     justifyContent: "center",
//     padding: 20,
//   },
//   modalCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 20,
//     maxHeight: "88%",
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
//   modalHeaderTextContainer: {
//     flex: 1,
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

//   // SELECTED TUTORS
//   selectedTutorsContainer: {
//     marginBottom: 16,
//   },
//   selectedTutorRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8FAFC",
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     borderRadius: 10,
//     padding: 9,
//     marginBottom: 7,
//   },
//   selectedTutorAvatar: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "#EFF6FF",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   selectedTutorAvatarText: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: PRIMARY_COLOR,
//   },
//   selectedTutorInfo: {
//     flex: 1,
//     marginLeft: 9,
//   },
//   selectedTutorName: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#0F172A",
//   },
//   selectedTutorDetails: {
//     fontSize: 11,
//     color: "#64748B",
//     marginTop: 2,
//   },
//   removeTutorButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: "#E2E8F0",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   // SUMMARY
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
//   summaryModeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 6,
//     paddingTop: 7,
//     borderTopWidth: 1,
//     borderTopColor: "#E2E8F0",
//   },
//   summaryModeText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#0F766E",
//     marginLeft: 8,
//   },

//   // INFO NOTICE
//   infoNotice: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     backgroundColor: "#F0FDFA",
//     borderWidth: 1,
//     borderColor: "#CCFBF1",
//     borderRadius: 10,
//     padding: 11,
//     marginBottom: 16,
//   },
//   infoNoticeText: {
//     flex: 1,
//     fontSize: 12,
//     lineHeight: 17,
//     color: "#115E59",
//     marginLeft: 8,
//   },

//   // FORM
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

//   // DURATION
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

//   // MODAL ACTIONS
//   modalActions: {
//     marginTop: 8,
//   },
//   submitButton: {
//     backgroundColor: PRIMARY_COLOR,
//     borderRadius: 10,
//     minHeight: 46,
//     paddingHorizontal: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   submitButtonText: {
//     color: "#FFFFFF",
//     fontSize: 14,
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

// export default StudentFindTutorNonVisiting;















































// //Not handle LT's avaiablity
// // import React, { useEffect, useState } from "react";

// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   TextInput,
// //   FlatList,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Alert,
// //   Modal,
// //   ScrollView,
// //   StatusBar,
// //   Platform,
// // } from "react-native";

// // import Icon from "react-native-vector-icons/MaterialIcons";
// // import AsyncStorage from "@react-native-async-storage/async-storage";

// // import colors from "../utils/colors";
// // import { BASE_URL } from "../../config/api";

// // const PRIMARY_COLOR = colors?.primary || "#249688";

// // const DURATION_UNITS = [
// //   "Days",
// //   "Weeks",
// //   "Months",
// // ];

// // // ======================================================
// // // SORT OPTIONS
// // //
// // // Backend accepts:
// // // institute
// // // feedback
// // // grade
// // // fee
// // // ======================================================

// // const SORT_OPTIONS = [
// //   {
// //     key: "institute",
// //     label: "Institute",
// //   },
// //   {
// //     key: "feedback",
// //     label: "Feedback",
// //   },
// //   {
// //     key: "grade",
// //     label: "Grade",
// //   },
// //   {
// //     key: "fee",
// //     label: "Payment",
// //   },
// // ];

// // const StudentFindTutorNonVisiting = ({
// //   navigation,
// //   route,
// // }) => {
// //   const {
// //     courseId,
// //     courseName,
// //   } = route.params || {};

// //   // ======================================================
// //   // STATE
// //   // ======================================================

// //   const [tutorsData, setTutorsData] = useState([]);

// //   const [loading, setLoading] = useState(true);

// //   const [search, setSearch] = useState("");

// //   // Backend default sort = feedback
// //   const [sortBy, setSortBy] = useState("feedback");

// //   // ======================================================
// //   // MULTIPLE TUTOR SELECTION
// //   // ======================================================

// //   const [selectedTutors, setSelectedTutors] =
// //     useState([]);

// //   /*
// //    * All selected tutors must have the same
// //    * day and time.
// //    *
// //    * The create-request API accepts one
// //    * day and one time for the complete group.
// //    */
// //   const [selectedRequestDay, setSelectedRequestDay] =
// //     useState("");

// //   const [selectedRequestTime, setSelectedRequestTime] =
// //     useState("");

// //   // ======================================================
// //   // REQUEST MODAL
// //   // ======================================================

// //   const [requestModal, setRequestModal] =
// //     useState(false);

// //   // ======================================================
// //   // LEARNING MODE
// //   // ======================================================

// //   const [learningMode, setLearningMode] =
// //     useState("FullTime");

// //   const [learningDuration, setLearningDuration] =
// //     useState("");

// //   const [learningDurationUnit, setLearningDurationUnit] =
// //     useState("Weeks");

// //   const [requestLoading, setRequestLoading] =
// //     useState(false);

// //   // ======================================================
// //   // FETCH TUTORS WHEN SORT CHANGES
// //   // ======================================================

// //   useEffect(() => {
// //     fetchTutors(sortBy);
// //   }, [sortBy]);

// //   // ======================================================
// //   // FETCH NON-VISITING TUTORS
// //   // ======================================================

// //   const fetchTutors = async (
// //     selectedSort = "feedback"
// //   ) => {
// //     try {
// //       setLoading(true);

// //       // ==================================================
// //       // VALIDATE COURSE
// //       // ==================================================

// //       /*
// //        * IMPORTANT:
// //        *
// //        * Non-Visiting search DOES NOT require:
// //        *
// //        * userLat
// //        * userLng
// //        * distance
// //        * radius
// //        *
// //        * Student will visit tutor's location.
// //        */

// //       if (!courseId) {
// //         Alert.alert(
// //           "Error",
// //           "Course information is missing."
// //         );

// //         navigation.goBack();

// //         return;
// //       }

// //       // ==================================================
// //       // TOKEN
// //       // ==================================================

// //       const token =
// //         await AsyncStorage.getItem("token");

// //       if (!token) {
// //         Alert.alert(
// //           "Authentication Error",
// //           "Your login session has expired. Please login again."
// //         );

// //         setTutorsData([]);

// //         return;
// //       }

// //       // ==================================================
// //       // API URL
// //       // ==================================================

// //       /*
// //        * NEW NON-VISITING API:
// //        *
// //        * GET /Student/search-non-visiting-tutors
// //        *
// //        * Parameters:
// //        *
// //        * courseId
// //        * sortBy
// //        *
// //        * NO latitude
// //        * NO longitude
// //        */

// //       const url =
// //         `${BASE_URL}/Student/search-non-visiting-tutors` +
// //         `?courseId=${encodeURIComponent(courseId)}` +
// //         `&sortBy=${encodeURIComponent(selectedSort)}`;

// //       console.log(
// //         "===================================="
// //       );

// //       console.log(
// //         "SEARCH NON-VISITING TUTORS API"
// //       );

// //       console.log(
// //         "SORT BY:",
// //         selectedSort
// //       );

// //       console.log(
// //         "COURSE ID:",
// //         courseId
// //       );

// //       console.log(
// //         "URL:",
// //         url
// //       );

// //       console.log(
// //         "===================================="
// //       );

// //       // ==================================================
// //       // API CALL
// //       // ==================================================

// //       const response = await fetch(url, {
// //         method: "GET",

// //         headers: {
// //           Accept: "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //       });

// //       // ==================================================
// //       // READ RESPONSE
// //       // ==================================================

// //       const responseText =
// //         await response.text();

// //       let data = {};

// //       try {
// //         data = responseText
// //           ? JSON.parse(responseText)
// //           : {};
// //       } catch (error) {
// //         console.log(
// //           "JSON PARSE ERROR:",
// //           error
// //         );

// //         data = {
// //           message:
// //             responseText ||
// //             "Invalid server response.",
// //         };
// //       }

// //       console.log(
// //         "===================================="
// //       );

// //       console.log(
// //         "NON-VISITING TUTORS RESPONSE"
// //       );

// //       console.log(
// //         "STATUS:",
// //         response.status
// //       );

// //       console.log(
// //         "DATA:",
// //         JSON.stringify(
// //           data,
// //           null,
// //           2
// //         )
// //       );

// //       console.log(
// //         "===================================="
// //       );

// //       // ==================================================
// //       // SUCCESS
// //       // ==================================================

// //       if (response.ok) {
// //         if (
// //           Array.isArray(
// //             data?.tutors
// //           )
// //         ) {
// //           setTutorsData(
// //             data.tutors
// //           );
// //         } else {
// //           setTutorsData([]);
// //         }

// //         return;
// //       }

// //       // ==================================================
// //       // ERROR
// //       // ==================================================

// //       setTutorsData([]);

// //       Alert.alert(
// //         "Info",
// //         data?.message ||
// //           "No Non-Visiting tutors found for this course."
// //       );
// //     } catch (error) {
// //       console.log(
// //         "===================================="
// //       );

// //       console.log(
// //         "FETCH NON-VISITING TUTORS ERROR:"
// //       );

// //       console.log(error);

// //       console.log(
// //         "===================================="
// //       );

// //       setTutorsData([]);

// //       Alert.alert(
// //         "Error",
// //         "Unable to load available tutors."
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ======================================================
// //   // HELPER FUNCTIONS
// //   // ======================================================

// //   const getInstitute = (item) => {
// //     return (
// //       item?.institute ||
// //       "Institute unavailable"
// //     );
// //   };

// //   const getGrade = (item) => {
// //     return (
// //       item?.grade ||
// //       "N/A"
// //     );
// //   };

// //   // ======================================================
// //   // HOURLY RATE / PAYMENT
// //   // ======================================================

// //   const getHourlyRate = (item) => {
// //     const value =
// //       item?.hourly_rate ?? 0;

// //     const numberValue =
// //       Number(value);

// //     return Number.isFinite(
// //       numberValue
// //     )
// //       ? numberValue
// //       : 0;
// //   };

// //   // ======================================================
// //   // RATING
// //   // ======================================================

// //   const getRating = (item) => {
// //     const value =
// //       item?.average_rating ?? 0;

// //     const numberValue =
// //       Number(value);

// //     return Number.isFinite(
// //       numberValue
// //     )
// //       ? numberValue
// //       : 0;
// //   };

// //   // ======================================================
// //   // REVIEW COUNT
// //   // ======================================================

// //   const getReviewCount = (item) => {
// //     const value =
// //       item?.total_reviews ?? 0;

// //     const numberValue =
// //       Number(value);

// //     return Number.isFinite(
// //       numberValue
// //     )
// //       ? numberValue
// //       : 0;
// //   };

// //   // ======================================================
// //   // CHECK IF TUTOR IS SELECTED
// //   // ======================================================

// //   const isTutorSelected = (
// //     tutorId
// //   ) => {
// //     return selectedTutors.some(
// //       (tutor) =>
// //         Number(
// //           tutor.tutor_id
// //         ) ===
// //         Number(tutorId)
// //     );
// //   };

// //   // ======================================================
// //   // SELECT / UNSELECT TUTOR
// //   // ======================================================

// //   const toggleTutorSelection = (
// //     item
// //   ) => {
// //     const tutorId =
// //       Number(item?.tutor_id);

// //     if (!tutorId) {
// //       Alert.alert(
// //         "Error",
// //         "Invalid tutor selected."
// //       );

// //       return;
// //     }

// //     const alreadySelected =
// //       isTutorSelected(tutorId);

// //     // ==================================================
// //     // REMOVE TUTOR
// //     // ==================================================

// //     if (alreadySelected) {
// //       const updatedTutors =
// //         selectedTutors.filter(
// //           (tutor) =>
// //             Number(
// //               tutor.tutor_id
// //             ) !== tutorId
// //         );

// //       setSelectedTutors(
// //         updatedTutors
// //       );

// //       // If no tutors remain,
// //       // clear day/time.
// //       if (
// //         updatedTutors.length === 0
// //       ) {
// //         setSelectedRequestDay("");
// //         setSelectedRequestTime("");
// //       }

// //       return;
// //     }

// //     // ==================================================
// //     // CHECK SLOT AVAILABILITY
// //     // ==================================================

// //     if (
// //       item?.is_available === false
// //     ) {
// //       Alert.alert(
// //         "Tutor Unavailable",
// //         item?.availability_message ||
// //           "This tutor is unavailable for this slot."
// //       );

// //       return;
// //     }

// //     // ==================================================
// //     // CHECK DAY
// //     // ==================================================

// //     const itemDay =
// //       String(
// //         item?.day || ""
// //       ).trim();

// //     // ==================================================
// //     // CHECK TIME
// //     // ==================================================

// //     const itemTime =
// //       String(
// //         item?.time || ""
// //       ).trim();

// //     if (
// //       !itemDay ||
// //       !itemTime
// //     ) {
// //       Alert.alert(
// //         "Invalid Slot",
// //         "This tutor does not have a valid day or time slot."
// //       );

// //       return;
// //     }

// //     // ==================================================
// //     // SAME DAY/TIME CHECK
// //     // ==================================================

// //     /*
// //      * All selected tutors must have
// //      * the same day and time.
// //      */

// //     if (
// //       selectedTutors.length > 0 &&
// //       (
// //         selectedRequestDay !==
// //           itemDay ||
// //         selectedRequestTime !==
// //           itemTime
// //       )
// //     ) {
// //       Alert.alert(
// //         "Different Time Slot",
// //         `Please select tutors with the same day and time.\n\nSelected:\n${selectedRequestDay}\n${selectedRequestTime}`
// //       );

// //       return;
// //     }

// //     // ==================================================
// //     // ADD TUTOR
// //     // ==================================================

// //     setSelectedTutors(
// //       (previous) => [
// //         ...previous,

// //         {
// //           tutor_id:
// //             tutorId,

// //           tutor_name:
// //             item?.tutor_name ||
// //             "Tutor",

// //           location:
// //             item?.location ||
// //             "",

// //           qualification:
// //             item?.qualification ||
// //             "",

// //           experience:
// //             item?.experience ??
// //             "",

// //           teaching_mode:
// //             item?.teaching_mode ||
// //             "Non-Visiting",

// //           institute:
// //             item?.institute ||
// //             "",

// //           grade:
// //             item?.grade ||
// //             "",

// //           hourly_rate:
// //             item?.hourly_rate ??
// //             0,

// //           average_rating:
// //             item?.average_rating ??
// //             0,

// //           total_reviews:
// //             item?.total_reviews ??
// //             0,

// //           day:
// //             itemDay,

// //           time:
// //             itemTime,
// //         },
// //       ]
// //     );

// //     setSelectedRequestDay(
// //       itemDay
// //     );

// //     setSelectedRequestTime(
// //       itemTime
// //     );
// //   };

// //   // ======================================================
// //   // OPEN REQUEST MODAL
// //   // ======================================================

// //   const openRequestModal = () => {
// //     if (
// //       selectedTutors.length === 0
// //     ) {
// //       Alert.alert(
// //         "Select Tutor",
// //         "Please select at least one tutor first."
// //       );

// //       return;
// //     }

// //     if (!selectedRequestDay) {
// //       Alert.alert(
// //         "Missing Day",
// //         "Selected tutor day is missing."
// //       );

// //       return;
// //     }

// //     if (!selectedRequestTime) {
// //       Alert.alert(
// //         "Missing Time",
// //         "Selected tutor time is missing."
// //       );

// //       return;
// //     }

// //     setLearningMode(
// //       "FullTime"
// //     );

// //     setLearningDuration("");

// //     setLearningDurationUnit(
// //       "Weeks"
// //     );

// //     setRequestModal(true);
// //   };

// //   // ======================================================
// //   // CLOSE REQUEST MODAL
// //   // ======================================================

// //   const closeRequestModal = () => {
// //     if (requestLoading) {
// //       return;
// //     }

// //     setRequestModal(false);

// //     setLearningMode(
// //       "FullTime"
// //     );

// //     setLearningDuration("");

// //     setLearningDurationUnit(
// //       "Weeks"
// //     );
// //   };

// //   // ======================================================
// //   // CLEAR ALL SELECTED TUTORS
// //   // ======================================================

// //   const clearSelectedTutors = () => {
// //     if (requestLoading) {
// //       return;
// //     }

// //     setSelectedTutors([]);

// //     setSelectedRequestDay("");

// //     setSelectedRequestTime("");
// //   };

// //   // ======================================================
// //   // SEND REQUEST
// //   // ======================================================

// //   const sendRequest = async () => {
// //     if (requestLoading) {
// //       return;
// //     }

// //     try {
// //       // ==================================================
// //       // VALIDATION
// //       // ==================================================

// //       if (
// //         !selectedTutors ||
// //         selectedTutors.length === 0
// //       ) {
// //         Alert.alert(
// //           "Validation Error",
// //           "Please select at least one tutor."
// //         );

// //         return;
// //       }

// //       if (!courseId) {
// //         Alert.alert(
// //           "Validation Error",
// //           "Course is not selected."
// //         );

// //         return;
// //       }

// //       if (!selectedRequestDay) {
// //         Alert.alert(
// //           "Validation Error",
// //           "Please select a day."
// //         );

// //         return;
// //       }

// //       if (!selectedRequestTime) {
// //         Alert.alert(
// //           "Validation Error",
// //           "Please select a time slot."
// //         );

// //         return;
// //       }

// //       if (!learningMode) {
// //         Alert.alert(
// //           "Validation Error",
// //           "Learning mode is required."
// //         );

// //         return;
// //       }

// //       // ==================================================
// //       // DURATION
// //       // ==================================================

// //       let durationValue = null;

// //       let durationUnitValue = null;

// //       if (
// //         learningMode ===
// //         "SpecificTime"
// //       ) {
// //         const parsedDuration =
// //           Number(
// //             String(
// //               learningDuration
// //             ).trim()
// //           );

// //         if (
// //           !learningDuration ||
// //           !Number.isFinite(
// //             parsedDuration
// //           ) ||
// //           parsedDuration <= 0
// //         ) {
// //           Alert.alert(
// //             "Validation Error",
// //             "Please enter a valid duration greater than zero."
// //           );

// //           return;
// //         }

// //         durationValue =
// //           parsedDuration;

// //         durationUnitValue =
// //           learningDurationUnit;
// //       }

// //       // ==================================================
// //       // TUTOR IDS
// //       // ==================================================

// //       const tutorIds =
// //         selectedTutors
// //           .map(
// //             (tutor) =>
// //               Number(
// //                 tutor.tutor_id
// //               )
// //           )
// //           .filter(
// //             (id) =>
// //               Number.isInteger(id) &&
// //               id > 0
// //           );

// //       if (
// //         tutorIds.length === 0
// //       ) {
// //         Alert.alert(
// //           "Validation Error",
// //           "No valid tutor was selected."
// //         );

// //         return;
// //       }

// //       // ==================================================
// //       // REMOVE DUPLICATE TUTOR IDS
// //       // ==================================================

// //       const uniqueTutorIds =
// //         [
// //           ...new Set(
// //             tutorIds
// //           ),
// //         ];

// //       // ==================================================
// //       // REQUEST BODY
// //       // ==================================================

// //       /*
// //        * IMPORTANT:
// //        *
// //        * create-request expects:
// //        *
// //        * tutor_ids
// //        * course_id
// //        * day
// //        * time
// //        * learning_mode
// //        * learning_duration
// //        * learning_duration_unit
// //        *
// //        * No class_date
// //        * No request_type
// //        * No single tutor_id
// //        */

// //       const requestBody = {
// //         tutor_ids:
// //           uniqueTutorIds,

// //         course_id:
// //           Number(courseId),

// //         day:
// //           String(
// //             selectedRequestDay
// //           ).trim(),

// //         time:
// //           String(
// //             selectedRequestTime
// //           ).trim(),

// //         learning_mode:
// //           learningMode,

// //         learning_duration:
// //           durationValue,

// //         learning_duration_unit:
// //           durationUnitValue,
// //       };

// //       console.log(
// //         "===================================="
// //       );

// //       console.log(
// //         "CREATE NON-VISITING TUTOR REQUEST"
// //       );

// //       console.log(
// //         "URL:",
// //         `${BASE_URL}/Student/create-request`
// //       );

// //       console.log(
// //         "SELECTED TUTORS:",
// //         JSON.stringify(
// //           selectedTutors,
// //           null,
// //           2
// //         )
// //       );

// //       console.log(
// //         "BODY:",
// //         JSON.stringify(
// //           requestBody,
// //           null,
// //           2
// //         )
// //       );

// //       console.log(
// //         "===================================="
// //       );

// //       // ==================================================
// //       // TOKEN
// //       // ==================================================

// //       const token =
// //         await AsyncStorage.getItem(
// //           "token"
// //         );

// //       if (!token) {
// //         Alert.alert(
// //           "Authentication Error",
// //           "Your login session has expired. Please login again."
// //         );

// //         return;
// //       }

// //       setRequestLoading(true);

// //       // ==================================================
// //       // API CALL
// //       // ==================================================

// //       const response =
// //         await fetch(
// //           `${BASE_URL}/Student/create-request`,
// //           {
// //             method: "POST",

// //             headers: {
// //               Accept:
// //                 "application/json",

// //               "Content-Type":
// //                 "application/json",

// //               Authorization:
// //                 `Bearer ${token}`,
// //             },

// //             body:
// //               JSON.stringify(
// //                 requestBody
// //               ),
// //           }
// //         );

// //       // ==================================================
// //       // READ RESPONSE
// //       // ==================================================

// //       const responseText =
// //         await response.text();

// //       console.log(
// //         "===================================="
// //       );

// //       console.log(
// //         "CREATE REQUEST RESPONSE"
// //       );

// //       console.log(
// //         "STATUS:",
// //         response.status
// //       );

// //       console.log(
// //         "BODY:",
// //         responseText
// //       );

// //       console.log(
// //         "===================================="
// //       );

// //       let data = {};

// //       try {
// //         data =
// //           responseText
// //             ? JSON.parse(
// //                 responseText
// //               )
// //             : {};
// //       } catch (parseError) {
// //         console.log(
// //           "RESPONSE JSON PARSE ERROR:",
// //           parseError
// //         );

// //         data = {
// //           message:
// //             responseText ||
// //             "Unknown server response.",
// //         };
// //       }

// //       // ==================================================
// //       // SUCCESS
// //       // ==================================================

// //       if (response.ok) {
// //         // -----------------------------------------------
// //         // Save information before clearing selection
// //         // -----------------------------------------------

// //         const totalTutors =
// //           data?.total_tutors ??
// //           uniqueTutorIds.length;

// //         const currentTutorId =
// //           data?.current_tutor_id;

// //         const requestGroupId =
// //           data?.request_group_id;

// //         // -----------------------------------------------
// //         // Close modal
// //         // -----------------------------------------------

// //         setRequestModal(false);

// //         // -----------------------------------------------
// //         // Clear selected tutors
// //         // -----------------------------------------------

// //         setSelectedTutors([]);

// //         setSelectedRequestDay("");

// //         setSelectedRequestTime("");

// //         // -----------------------------------------------
// //         // Reset learning fields
// //         // -----------------------------------------------

// //         setLearningMode(
// //           "FullTime"
// //         );

// //         setLearningDuration("");

// //         setLearningDurationUnit(
// //           "Weeks"
// //         );

// //         // -----------------------------------------------
// //         // SUCCESS MESSAGE
// //         // -----------------------------------------------

// //         let successMessage =
// //           data?.message ||
// //           "Tutor request created successfully.";

// //         successMessage +=
// //           `\n\n${totalTutors} tutor${
// //             totalTutors === 1
// //               ? ""
// //               : "s"
// //           } selected.`;

// //         if (
// //           currentTutorId
// //         ) {
// //           successMessage +=
// //             `\n\nRequest has started with Tutor #${currentTutorId}.`;
// //         }

// //         if (
// //           data?.response_deadline
// //         ) {
// //           const deadline =
// //             new Date(
// //               data.response_deadline
// //             );

// //           if (
// //             !Number.isNaN(
// //               deadline.getTime()
// //             )
// //           ) {
// //             successMessage +=
// //               `\nFirst tutor has 2 minutes to accept.`;
// //           }
// //         }

// //         if (
// //           requestGroupId
// //         ) {
// //           successMessage +=
// //             `\n\nRequest Group ID: ${requestGroupId}`;
// //         }

// //         Alert.alert(
// //           "Request Sent",
// //           successMessage,
// //           [
// //             {
// //               text: "OK",
// //             },
// //           ]
// //         );

// //         return;
// //       }

// //       // ==================================================
// //       // BACKEND ERROR
// //       // ==================================================

// //       const serverMessage =
// //         data?.message ||
// //         data?.error ||
// //         data?.title ||
// //         data?.detail ||
// //         `Server returned HTTP ${response.status}.`;

// //       let additionalMessage =
// //         "";

// //       // ==================================================
// //       // EXISTING ACTIVE REQUEST
// //       // ==================================================

// //       if (
// //         data?.request_group_id
// //       ) {
// //         additionalMessage =
// //           `\n\nRequest Group ID: ${data.request_group_id}`;
// //       }

// //       // ==================================================
// //       // MISSING TUTOR IDS
// //       // ==================================================

// //       if (
// //         Array.isArray(
// //           data?.missing_tutor_ids
// //         ) &&
// //         data.missing_tutor_ids.length >
// //           0
// //       ) {
// //         additionalMessage +=
// //           `\n\nMissing Tutor IDs: ${data.missing_tutor_ids.join(
// //             ", "
// //           )}`;
// //       }

// //       // ==================================================
// //       // INNER ERROR
// //       // ==================================================

// //       if (
// //         data?.inner_error
// //       ) {
// //         additionalMessage +=
// //           `\n\nDetails: ${data.inner_error}`;
// //       }

// //       Alert.alert(
// //         `Request Failed (${response.status})`,
// //         `${serverMessage}${additionalMessage}`
// //       );
// //     } catch (error) {
// //       console.log(
// //         "===================================="
// //       );

// //       console.log(
// //         "CREATE REQUEST NETWORK ERROR"
// //       );

// //       console.log(error);

// //       console.log(
// //         "===================================="
// //       );

// //       Alert.alert(
// //         "Request Failed",
// //         error?.message ||
// //           "Unable to connect to the server."
// //       );
// //     } finally {
// //       setRequestLoading(false);
// //     }
// //   };

// //   // ======================================================
// //   // FLATTEN TUTORS + COMMON SLOTS
// //   // ======================================================

// //   /*
// //    * Backend response:
// //    *
// //    * tutors: [
// //    *   {
// //    *     tutor_id,
// //    *     tutor_name,
// //    *     location,
// //    *     qualification,
// //    *     experience,
// //    *     teaching_mode,
// //    *     course_id,
// //    *     institute,
// //    *     grade,
// //    *     hourly_rate,
// //    *     average_rating,
// //    *     total_reviews,
// //    *     common_slots: [
// //    *       {
// //    *         day,
// //    *         time,
// //    *         is_available,
// //    *         availability_message,
// //    *         request_type,
// //    *         class_date
// //    *       }
// //    *     ]
// //    *   }
// //    * ]
// //    */

// //   const flattenedTutors =
// //     tutorsData.flatMap(
// //       (tutor) => {
// //         const slots =
// //           Array.isArray(
// //             tutor?.common_slots
// //           )
// //             ? tutor.common_slots
// //             : [];

// //         // ==================================================
// //         // NO SLOTS
// //         // ==================================================

// //         if (
// //           slots.length === 0
// //         ) {
// //           return [
// //             {
// //               id:
// //                 `tutor-${tutor.tutor_id}`,

// //               tutor_id:
// //                 tutor.tutor_id,

// //               tutor_name:
// //                 tutor.tutor_name,

// //               location:
// //                 tutor.location,

// //               qualification:
// //                 tutor.qualification,

// //               experience:
// //                 tutor.experience,

// //               teaching_mode:
// //                 tutor.teaching_mode,

// //               institute:
// //                 tutor.institute,

// //               grade:
// //                 tutor.grade,

// //               hourly_rate:
// //                 tutor.hourly_rate,

// //               average_rating:
// //                 tutor.average_rating,

// //               total_reviews:
// //                 tutor.total_reviews,

// //               day: "",

// //               time: "",

// //               is_available:
// //                 true,

// //               availability_message:
// //                 "Available",
// //             },
// //           ];
// //         }

// //         // ==================================================
// //         // CREATE CARD FOR EVERY COMMON SLOT
// //         // ==================================================

// //         return slots.map(
// //           (
// //             slot,
// //             index
// //           ) => ({
// //             id:
// //               `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,

// //             // --------------------------------------------
// //             // TUTOR
// //             // --------------------------------------------

// //             tutor_id:
// //               tutor.tutor_id,

// //             tutor_name:
// //               tutor.tutor_name,

// //             location:
// //               tutor.location,

// //             qualification:
// //               tutor.qualification,

// //             experience:
// //               tutor.experience,

// //             teaching_mode:
// //               tutor.teaching_mode,

// //             // --------------------------------------------
// //             // COURSE
// //             // --------------------------------------------

// //             course_id:
// //               tutor.course_id,

// //             institute:
// //               tutor.institute,

// //             grade:
// //               tutor.grade,

// //             // --------------------------------------------
// //             // RATE
// //             // --------------------------------------------

// //             hourly_rate:
// //               tutor.hourly_rate,

// //             // --------------------------------------------
// //             // FEEDBACK
// //             // --------------------------------------------

// //             average_rating:
// //               tutor.average_rating,

// //             total_reviews:
// //               tutor.total_reviews,

// //             // --------------------------------------------
// //             // SLOT
// //             // --------------------------------------------

// //             day:
// //               slot?.day ||
// //               "",

// //             time:
// //               slot?.time ||
// //               "",

// //             is_available:
// //               slot?.is_available !==
// //               false,

// //             availability_message:
// //               slot?.availability_message ||
// //               "Available",

// //             request_type:
// //               slot?.request_type ||
// //               "",

// //             class_date:
// //               slot?.class_date ||
// //               null,
// //           })
// //         );
// //       }
// //     );

// //   // ======================================================
// //   // SEARCH FILTER
// //   // ======================================================

// //   const filteredTutors =
// //     flattenedTutors.filter(
// //       (item) => {
// //         const tutorName =
// //           String(
// //             item?.tutor_name ||
// //               ""
// //           ).toLowerCase();

// //         const searchText =
// //           String(
// //             search || ""
// //           )
// //             .trim()
// //             .toLowerCase();

// //         return tutorName.includes(
// //           searchText
// //         );
// //       }
// //     );

// //   // ======================================================
// //   // SORT BUTTON
// //   // ======================================================

// //   const renderSortButton = (
// //     option
// //   ) => {
// //     const active =
// //       sortBy === option.key;

// //     return (
// //       <TouchableOpacity
// //         key={option.key}
// //         activeOpacity={0.8}
// //         style={[
// //           styles.sortButton,
// //           active &&
// //             styles.sortButtonActive,
// //         ]}
// //         onPress={() => {
// //           if (
// //             sortBy ===
// //             option.key
// //           ) {
// //             return;
// //           }

// //           /*
// //            * Backend performs
// //            * the actual sorting.
// //            */
// //           setSortBy(
// //             option.key
// //           );
// //         }}
// //       >
// //         <Text
// //           style={[
// //             styles.sortButtonText,
// //             active &&
// //               styles.sortButtonTextActive,
// //           ]}
// //         >
// //           {option.label}
// //         </Text>
// //       </TouchableOpacity>
// //     );
// //   };

// //   // ======================================================
// //   // RENDER TUTOR
// //   // ======================================================

// //   const renderTutor = ({
// //     item,
// //   }) => {
// //     const unavailable =
// //       item?.is_available ===
// //       false;

// //     const selected =
// //       isTutorSelected(
// //         item?.tutor_id
// //       );

// //     const rating =
// //       getRating(item);

// //     const reviews =
// //       getReviewCount(item);

// //     const institute =
// //       getInstitute(item);

// //     const grade =
// //       getGrade(item);

// //     const hourlyRate =
// //       getHourlyRate(item);

// //     return (
// //       <View
// //         style={[
// //           styles.card,
// //           selected &&
// //             styles.cardSelected,
// //         ]}
// //       >
// //         {/* ==========================================
// //             CARD HEADER
// //         ========================================== */}

// //         <View
// //           style={
// //             styles.cardHeader
// //           }
// //         >
// //           <View
// //             style={
// //               styles.avatarContainer
// //             }
// //           >
// //             <Text
// //               style={
// //                 styles.avatarText
// //               }
// //             >
// //               {item?.tutor_name
// //                 ? item.tutor_name
// //                     .charAt(0)
// //                     .toUpperCase()
// //                 : "T"}
// //             </Text>
// //           </View>

// //           <View
// //             style={
// //               styles.headerInfo
// //             }
// //           >
// //             <Text
// //               style={
// //                 styles.tutorName
// //               }
// //               numberOfLines={1}
// //             >
// //               {item?.tutor_name ||
// //                 "Tutor"}
// //             </Text>

// //             <View
// //               style={
// //                 styles.ratingRow
// //               }
// //             >
// //               <Icon
// //                 name="star"
// //                 size={16}
// //                 color="#F59E0B"
// //               />

// //               <Text
// //                 style={
// //                   styles.ratingVal
// //                 }
// //               >
// //                 {rating.toFixed(1)}
// //               </Text>

// //               <Text
// //                 style={
// //                   styles.reviewCount
// //                 }
// //               >
// //                 ({reviews} reviews)
// //               </Text>
// //             </View>
// //           </View>

// //           {/* ==========================================
// //               CHECKBOX
// //           ========================================== */}

// //           <View
// //             style={[
// //               styles.checkbox,
// //               selected &&
// //                 styles.checkboxSelected,
// //             ]}
// //           >
// //             {selected && (
// //               <Icon
// //                 name="check"
// //                 size={18}
// //                 color="#FFFFFF"
// //               />
// //             )}
// //           </View>
// //         </View>

// //         {/* ==========================================
// //             TUTOR INFORMATION
// //         ========================================== */}

// //         <View
// //           style={
// //             styles.tutorInfoRow
// //           }
// //         >
// //           {/* INSTITUTE */}

// //           <View
// //             style={
// //               styles.infoItem
// //             }
// //           >
// //             <Icon
// //               name="school"
// //               size={15}
// //               color="#64748B"
// //             />

// //             <Text
// //               style={
// //                 styles.infoText
// //               }
// //               numberOfLines={1}
// //             >
// //               {institute}
// //             </Text>
// //           </View>

// //           {/* GRADE */}

// //           <View
// //             style={
// //               styles.infoItem
// //             }
// //           >
// //             <Icon
// //               name="grade"
// //               size={15}
// //               color="#64748B"
// //             />

// //             <Text
// //               style={
// //                 styles.infoText
// //               }
// //             >
// //               Grade: {grade}
// //             </Text>
// //           </View>
// //         </View>

// //         {/* ==========================================
// //             QUALIFICATION / EXPERIENCE
// //         ========================================== */}

// //         <View
// //           style={
// //             styles.tutorInfoRow
// //           }
// //         >
// //           <View
// //             style={
// //               styles.infoItem
// //             }
// //           >
// //             <Icon
// //               name="school"
// //               size={15}
// //               color="#64748B"
// //             />

// //             <Text
// //               style={
// //                 styles.infoText
// //               }
// //               numberOfLines={1}
// //             >
// //               {item?.qualification ||
// //                 "Qualification unavailable"}
// //             </Text>
// //           </View>

// //           <View
// //             style={
// //               styles.infoItem
// //             }
// //           >
// //             <Icon
// //               name="work-history"
// //               size={15}
// //               color="#64748B"
// //             />

// //             <Text
// //               style={
// //                 styles.infoText
// //               }
// //               numberOfLines={1}
// //             >
// //               {item?.experience != null
// //                 ? `${item.experience} years`
// //                 : "Experience N/A"}
// //             </Text>
// //           </View>
// //         </View>

// //         {/* ==========================================
// //             PAYMENT
// //         ========================================== */}

// //         <View
// //           style={
// //             styles.feeRow
// //           }
// //         >
// //           <Icon
// //             name="payments"
// //             size={17}
// //             color={
// //               PRIMARY_COLOR
// //             }
// //           />

// //           <Text
// //             style={
// //               styles.feeText
// //             }
// //           >
// //             Rs. {hourlyRate} / hour
// //           </Text>
// //         </View>

// //         {/* ==========================================
// //             LOCATION
// //             IMPORTANT:
// //             NO DISTANCE
// //             NO RADIUS
// //         ========================================== */}

// //         <View
// //           style={
// //             styles.locationContainer
// //           }
// //         >
// //           <View
// //             style={
// //               styles.metaRow
// //             }
// //           >
// //             <Icon
// //               name="place"
// //               size={17}
// //               color="#64748B"
// //             />

// //             <Text
// //               style={
// //                 styles.metaText
// //               }
// //               numberOfLines={2}
// //             >
// //               {item?.location ||
// //                 "Tutor location unavailable"}
// //             </Text>
// //           </View>

// //           <View
// //             style={
// //               styles.modeBadge
// //             }
// //           >
// //             <Icon
// //               name="home"
// //               size={14}
// //               color={
// //                 PRIMARY_COLOR
// //               }
// //             />

// //             <Text
// //               style={
// //                 styles.modeBadgeText
// //               }
// //             >
// //               Non-Visiting
// //             </Text>
// //           </View>
// //         </View>

// //         {/* ==========================================
// //             SLOT
// //         ========================================== */}

// //         <View
// //           style={[
// //             styles.slotCard,
// //             unavailable
// //               ? styles.slotCardUnavailable
// //               : styles.slotCardAvailable,
// //           ]}
// //         >
// //           <View
// //             style={
// //               styles.slotHeaderRow
// //             }
// //           >
// //             <View
// //               style={[
// //                 styles.statusBadge,
// //                 unavailable
// //                   ? styles.badgeUnavailable
// //                   : styles.badgeAvailable,
// //               ]}
// //             >
// //               <View
// //                 style={[
// //                   styles.statusDot,
// //                   unavailable
// //                     ? styles.dotUnavailable
// //                     : styles.dotAvailable,
// //                 ]}
// //               />

// //               <Text
// //                 style={[
// //                   styles.statusText,
// //                   unavailable
// //                     ? styles.textUnavailable
// //                     : styles.textAvailable,
// //                 ]}
// //               >
// //                 {unavailable
// //                   ? "Slot Unavailable"
// //                   : "Available Slot"}
// //               </Text>
// //             </View>
// //           </View>

// //           <View
// //             style={
// //               styles.slotDetailGrid
// //             }
// //           >
// //             {/* DAY */}

// //             <View
// //               style={
// //                 styles.slotDetailItem
// //               }
// //             >
// //               <Icon
// //                 name="event"
// //                 size={16}
// //                 color="#475569"
// //               />

// //               <Text
// //                 style={
// //                   styles.slotDetailText
// //                 }
// //               >
// //                 {item?.day ||
// //                   "Day"}
// //               </Text>
// //             </View>

// //             {/* TIME */}

// //             <View
// //               style={
// //                 styles.slotDetailItem
// //               }
// //             >
// //               <Icon
// //                 name="schedule"
// //                 size={16}
// //                 color="#475569"
// //               />

// //               <Text
// //                 style={
// //                   styles.slotDetailText
// //                 }
// //               >
// //                 {item?.time ||
// //                   "Time"}
// //               </Text>
// //             </View>
// //           </View>

// //           {/* ==========================================
// //               UNAVAILABLE MESSAGE
// //           ========================================== */}

// //           {unavailable && (
// //             <View
// //               style={
// //                 styles.unavailableNotice
// //               }
// //             >
// //               <Icon
// //                 name="info-outline"
// //                 size={16}
// //                 color="#D97706"
// //               />

// //               <View
// //                 style={
// //                   styles.noticeTextContainer
// //                 }
// //               >
// //                 <Text
// //                   style={
// //                     styles.noticeMessage
// //                   }
// //                 >
// //                   {item?.availability_message ||
// //                     "Tutor unavailable for this slot."}
// //                 </Text>
// //               </View>
// //             </View>
// //           )}
// //         </View>

// //         {/* ==========================================
// //             SELECT TUTOR BUTTON
// //         ========================================== */}

// //         <TouchableOpacity
// //           style={[
// //             styles.requestButton,
// //             selected &&
// //               styles.requestButtonSelected,
// //             unavailable &&
// //               styles.requestButtonDisabled,
// //           ]}
// //           activeOpacity={0.8}
// //           disabled={
// //             unavailable
// //           }
// //           onPress={() =>
// //             toggleTutorSelection(
// //               item
// //             )
// //           }
// //         >
// //           <Icon
// //             name={
// //               selected
// //                 ? "check-circle"
// //                 : "add-circle-outline"
// //             }
// //             size={18}
// //             color="#FFFFFF"
// //           />

// //           <Text
// //             style={
// //               styles.requestButtonText
// //             }
// //           >
// //             {selected
// //               ? "Tutor Selected"
// //               : "Select Tutor"}
// //           </Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   };

// //   // ======================================================
// //   // MAIN UI
// //   // ======================================================

// //   return (
// //     <SafeAreaView
// //       style={
// //         styles.container
// //       }
// //     >
// //       <StatusBar
// //         barStyle="dark-content"
// //         backgroundColor="#F8FAFC"
// //       />

// //       {/* ================================================
// //           TOP BAR
// //       ================================================ */}

// //       <View
// //         style={
// //           styles.topBar
// //         }
// //       >
// //         <TouchableOpacity
// //           style={
// //             styles.backButton
// //           }
// //           onPress={() =>
// //             navigation.goBack()
// //           }
// //           hitSlop={{
// //             top: 10,
// //             bottom: 10,
// //             left: 10,
// //             right: 10,
// //           }}
// //         >
// //           <Icon
// //             name="arrow-back"
// //             size={22}
// //             color="#0F172A"
// //           />
// //         </TouchableOpacity>

// //         <View
// //           style={
// //             styles.titleContainer
// //           }
// //         >
// //           <Text
// //             style={
// //               styles.headerSubtitle
// //             }
// //           >
// //             NON-VISITING TUTOR
// //           </Text>

// //           <Text
// //             style={
// //               styles.headerTitle
// //             }
// //             numberOfLines={1}
// //           >
// //             {courseName ||
// //               "Available Tutors"}
// //           </Text>
// //         </View>

// //         <View
// //           style={{
// //             width: 40,
// //           }}
// //         />
// //       </View>

// //       {/* ================================================
// //           NON-VISITING INFORMATION
// //       ================================================ */}

// //       <View
// //         style={
// //           styles.modeInformation
// //         }
// //       >
// //         <View
// //           style={
// //             styles.modeInformationIcon
// //           }
// //         >
// //           <Icon
// //             name="home"
// //             size={18}
// //             color={
// //               PRIMARY_COLOR
// //             }
// //           />
// //         </View>

// //         <View
// //           style={
// //             styles.modeInformationTextContainer
// //           }
// //         >
// //           <Text
// //             style={
// //               styles.modeInformationTitle
// //             }
// //           >
// //             Tutor's Location
// //           </Text>

// //           <Text
// //             style={
// //               styles.modeInformationText
// //             }
// //           >
// //             You will visit the tutor's location for your classes.
// //           </Text>
// //         </View>
// //       </View>

// //       {/* ================================================
// //           SEARCH
// //       ================================================ */}

// //       <View
// //         style={
// //           styles.searchSection
// //         }
// //       >
// //         <View
// //           style={
// //             styles.searchInputContainer
// //           }
// //         >
// //           <Icon
// //             name="search"
// //             size={20}
// //             color="#94A3B8"
// //           />

// //           <TextInput
// //             placeholder="Search tutors by name..."
// //             placeholderTextColor="#94A3B8"
// //             value={search}
// //             onChangeText={
// //               setSearch
// //             }
// //             style={
// //               styles.searchInput
// //             }
// //             clearButtonMode="while-editing"
// //           />

// //           {search.length > 0 &&
// //             Platform.OS !==
// //               "ios" && (
// //               <TouchableOpacity
// //                 onPress={() =>
// //                   setSearch("")
// //                 }
// //               >
// //                 <Icon
// //                   name="close"
// //                   size={18}
// //                   color="#94A3B8"
// //                 />
// //               </TouchableOpacity>
// //             )}
// //         </View>
// //       </View>

// //       {/* ================================================
// //           SORT BY
// //       ================================================ */}

// //       <View
// //         style={
// //           styles.sortSection
// //         }
// //       >
// //         <Text
// //           style={
// //             styles.sortLabel
// //           }
// //         >
// //           Sort by:
// //         </Text>

// //         <View
// //           style={
// //             styles.sortButtonsRow
// //           }
// //         >
// //           {SORT_OPTIONS.map(
// //             renderSortButton
// //           )}
// //         </View>
// //       </View>

// //       {/* ================================================
// //           SELECTED TUTOR SUMMARY
// //       ================================================ */}

// //       {selectedTutors.length > 0 && (
// //         <View
// //           style={
// //             styles.selectionBar
// //           }
// //         >
// //           <View
// //             style={
// //               styles.selectionInfo
// //             }
// //           >
// //             <View
// //               style={
// //                 styles.selectionCountCircle
// //               }
// //             >
// //               <Text
// //                 style={
// //                   styles.selectionCountText
// //                 }
// //               >
// //                 {
// //                   selectedTutors.length
// //                 }
// //               </Text>
// //             </View>

// //             <View
// //               style={
// //                 styles.selectionTextContainer
// //               }
// //             >
// //               <Text
// //                 style={
// //                   styles.selectionTitle
// //                 }
// //               >
// //                 Tutor
// //                 {selectedTutors.length ===
// //                 1
// //                   ? ""
// //                   : "s"}{" "}
// //                 Selected
// //               </Text>

// //               <Text
// //                 style={
// //                   styles.selectionSubtitle
// //                 }
// //                 numberOfLines={1}
// //               >
// //                 {selectedRequestDay} •{" "}
// //                 {selectedRequestTime}
// //               </Text>
// //             </View>
// //           </View>

// //           <View
// //             style={
// //               styles.selectionActions
// //             }
// //           >
// //             <TouchableOpacity
// //               onPress={
// //                 clearSelectedTutors
// //               }
// //               style={
// //                 styles.clearButton
// //               }
// //             >
// //               <Icon
// //                 name="clear"
// //                 size={18}
// //                 color="#64748B"
// //               />
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               onPress={
// //                 openRequestModal
// //               }
// //               style={
// //                 styles.continueButton
// //               }
// //             >
// //               <Text
// //                 style={
// //                   styles.continueButtonText
// //                 }
// //               >
// //                 Continue
// //               </Text>

// //               <Icon
// //                 name="arrow-forward"
// //                 size={17}
// //                 color="#FFFFFF"
// //               />
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       )}

// //       {/* ================================================
// //           TUTOR LIST
// //       ================================================ */}

// //       {loading ? (
// //         <View
// //           style={
// //             styles.centerContainer
// //           }
// //         >
// //           <ActivityIndicator
// //             size="large"
// //             color={
// //               PRIMARY_COLOR
// //             }
// //           />

// //           <Text
// //             style={
// //               styles.loadingText
// //             }
// //           >
// //             Finding available tutors...
// //           </Text>
// //         </View>
// //       ) : (
// //         <FlatList
// //           data={
// //             filteredTutors
// //           }
// //           keyExtractor={(
// //             item
// //           ) =>
// //             String(item.id)
// //           }
// //           renderItem={
// //             renderTutor
// //           }
// //           contentContainerStyle={[
// //             styles.listContent,
// //             selectedTutors.length >
// //               0 &&
// //               styles.listContentWithSelection,
// //           ]}
// //           showsVerticalScrollIndicator={
// //             false
// //           }
// //           keyboardShouldPersistTaps="handled"
// //           ListEmptyComponent={
// //             <View
// //               style={
// //                 styles.emptyContainer
// //               }
// //             >
// //               <View
// //                 style={
// //                   styles.emptyIconCircle
// //                 }
// //               >
// //                 <Icon
// //                   name="search-off"
// //                   size={32}
// //                   color="#94A3B8"
// //                 />
// //               </View>

// //               <Text
// //                 style={
// //                   styles.emptyTitle
// //                 }
// //               >
// //                 No Tutors Available
// //               </Text>

// //               <Text
// //                 style={
// //                   styles.emptySubtext
// //                 }
// //               >
// //                 {search
// //                   ? "No tutor matches your search."
// //                   : "No approved Non-Visiting tutors are available for this course."}
// //               </Text>
// //             </View>
// //           }
// //         />
// //       )}

// //       {/* ================================================
// //           REQUEST MODAL
// //       ================================================ */}

// //       <Modal
// //         visible={
// //           requestModal
// //         }
// //         transparent
// //         animationType="fade"
// //         onRequestClose={
// //           closeRequestModal
// //         }
// //       >
// //         <View
// //           style={
// //             styles.modalOverlay
// //           }
// //         >
// //           <View
// //             style={
// //               styles.modalCard
// //             }
// //           >
// //             {/* ==========================================
// //                 MODAL HEADER
// //             ========================================== */}

// //             <View
// //               style={
// //                 styles.modalHeader
// //               }
// //             >
// //               <View
// //                 style={
// //                   styles.modalHeaderTextContainer
// //                 }
// //               >
// //                 <Text
// //                   style={
// //                     styles.modalHeaderTitle
// //                   }
// //                 >
// //                   Class Request
// //                 </Text>

// //                 <Text
// //                   style={
// //                     styles.modalHeaderSubtitle
// //                   }
// //                 >
// //                   {selectedTutors.length} tutor
// //                   {selectedTutors.length ===
// //                   1
// //                     ? ""
// //                     : "s"} selected
// //                 </Text>
// //               </View>

// //               <TouchableOpacity
// //                 onPress={
// //                   closeRequestModal
// //                 }
// //                 disabled={
// //                   requestLoading
// //                 }
// //                 style={
// //                   styles.modalCloseButton
// //                 }
// //               >
// //                 <Icon
// //                   name="close"
// //                   size={20}
// //                   color="#64748B"
// //                 />
// //               </TouchableOpacity>
// //             </View>

// //             <ScrollView
// //               showsVerticalScrollIndicator={
// //                 false
// //               }
// //               contentContainerStyle={
// //                 styles.modalBody
// //               }
// //             >
// //               {/* ==========================================
// //                   SELECTED TUTORS
// //               ========================================== */}

// //               <Text
// //                 style={
// //                   styles.fieldLabel
// //                 }
// //               >
// //                 Selected Tutors
// //               </Text>

// //               <View
// //                 style={
// //                   styles.selectedTutorsContainer
// //                 }
// //               >
// //                 {selectedTutors.map(
// //                   (
// //                     tutor,
// //                     index
// //                   ) => (
// //                     <View
// //                       key={`${tutor.tutor_id}-${index}`}
// //                       style={
// //                         styles.selectedTutorRow
// //                       }
// //                     >
// //                       <View
// //                         style={
// //                           styles.selectedTutorAvatar
// //                         }
// //                       >
// //                         <Text
// //                           style={
// //                             styles.selectedTutorAvatarText
// //                           }
// //                         >
// //                           {tutor?.tutor_name
// //                             ? tutor.tutor_name
// //                                 .charAt(0)
// //                                 .toUpperCase()
// //                             : "T"}
// //                         </Text>
// //                       </View>

// //                       <View
// //                         style={
// //                           styles.selectedTutorInfo
// //                         }
// //                       >
// //                         <Text
// //                           style={
// //                             styles.selectedTutorName
// //                           }
// //                           numberOfLines={1}
// //                         >
// //                           {tutor.tutor_name}
// //                         </Text>

// //                         <Text
// //                           style={
// //                             styles.selectedTutorDetails
// //                           }
// //                           numberOfLines={1}
// //                         >
// //                           {tutor.institute ||
// //                             "Institute unavailable"}
// //                         </Text>
// //                       </View>

// //                       <TouchableOpacity
// //                         disabled={
// //                           requestLoading
// //                         }
// //                         onPress={() => {
// //                           toggleTutorSelection(
// //                             tutor
// //                           );
// //                         }}
// //                         style={
// //                           styles.removeTutorButton
// //                         }
// //                       >
// //                         <Icon
// //                           name="close"
// //                           size={18}
// //                           color="#64748B"
// //                         />
// //                       </TouchableOpacity>
// //                     </View>
// //                   )
// //                 )}
// //               </View>

// //               {/* ==========================================
// //                   SELECTED SLOT
// //               ========================================== */}

// //               <View
// //                 style={
// //                   styles.summaryCard
// //                 }
// //               >
// //                 <Text
// //                   style={
// //                     styles.summaryTitle
// //                   }
// //                 >
// //                   Selected Slot
// //                 </Text>

// //                 <View
// //                   style={
// //                     styles.summaryRow
// //                   }
// //                 >
// //                   <Icon
// //                     name="event"
// //                     size={16}
// //                     color={
// //                       PRIMARY_COLOR
// //                     }
// //                   />

// //                   <Text
// //                     style={
// //                       styles.summaryText
// //                     }
// //                   >
// //                     {selectedRequestDay}
// //                   </Text>
// //                 </View>

// //                 <View
// //                   style={
// //                     styles.summaryRow
// //                   }
// //                 >
// //                   <Icon
// //                     name="schedule"
// //                     size={16}
// //                     color={
// //                       PRIMARY_COLOR
// //                     }
// //                   />

// //                   <Text
// //                     style={
// //                       styles.summaryText
// //                     }
// //                   >
// //                     {selectedRequestTime}
// //                   </Text>
// //                 </View>

// //                 {/* NON-VISITING INFO */}

// //                 <View
// //                   style={
// //                     styles.summaryModeRow
// //                   }
// //                 >
// //                   <Icon
// //                     name="home"
// //                     size={16}
// //                     color={
// //                       PRIMARY_COLOR
// //                   }

// //                   />

// //                   <Text
// //                     style={
// //                       styles.summaryModeText
// //                     }
// //                   >
// //                     Student will visit tutor
// //                   </Text>
// //                 </View>
// //               </View>

// //               {/* ==========================================
// //                   INFORMATION
// //               ========================================== */}

// //               <View
// //                 style={
// //                   styles.infoNotice
// //                 }
// //               >
// //                 <Icon
// //                   name="info-outline"
// //                   size={18}
// //                   color={
// //                     PRIMARY_COLOR
// //                   }
// //                 />

// //                 <Text
// //                   style={
// //                     styles.infoNoticeText
// //                   }
// //                 >
// //                   The first selected tutor
// //                   will receive your request
// //                   first. If the tutor does not
// //                   accept within 2 minutes, the
// //                   request can move to the next
// //                   selected tutor.
// //                 </Text>
// //               </View>

// //               {/* ==========================================
// //                   LEARNING MODE
// //               ========================================== */}

// //               <Text
// //                 style={
// //                   styles.fieldLabel
// //                 }
// //               >
// //                 Learning Mode
// //               </Text>

// //               <View
// //                 style={
// //                   styles.segmentedControl
// //                 }
// //               >
// //                 <TouchableOpacity
// //                   style={[
// //                     styles.segmentButton,
// //                     learningMode ===
// //                       "FullTime" &&
// //                       styles.segmentButtonActive,
// //                   ]}
// //                   onPress={() =>
// //                     setLearningMode(
// //                       "FullTime"
// //                     )
// //                   }
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.segmentText,
// //                       learningMode ===
// //                         "FullTime" &&
// //                         styles.segmentTextActive,
// //                     ]}
// //                   >
// //                     Full Time
// //                   </Text>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity
// //                   style={[
// //                     styles.segmentButton,
// //                     learningMode ===
// //                       "SpecificTime" &&
// //                       styles.segmentButtonActive,
// //                   ]}
// //                   onPress={() =>
// //                     setLearningMode(
// //                       "SpecificTime"
// //                     )
// //                   }
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.segmentText,
// //                       learningMode ===
// //                         "SpecificTime" &&
// //                         styles.segmentTextActive,
// //                     ]}
// //                   >
// //                     Specific Time
// //                   </Text>
// //                 </TouchableOpacity>
// //               </View>

// //               {/* ==========================================
// //                   DURATION
// //               ========================================== */}

// //               {learningMode ===
// //                 "SpecificTime" && (
// //                 <View
// //                   style={
// //                     styles.durationSection
// //                   }
// //                 >
// //                   <Text
// //                     style={
// //                       styles.fieldLabel
// //                     }
// //                   >
// //                     Duration Value
// //                   </Text>

// //                   <View
// //                     style={
// //                       styles.textInputWrapper
// //                     }
// //                   >
// //                     <Icon
// //                       name="timer"
// //                       size={18}
// //                       color="#94A3B8"
// //                       style={{
// //                         marginRight: 8,
// //                       }}
// //                     />

// //                     <TextInput
// //                       placeholder="e.g. 4"
// //                       placeholderTextColor="#94A3B8"
// //                       keyboardType="numeric"
// //                       value={
// //                         learningDuration
// //                       }
// //                       onChangeText={
// //                         setLearningDuration
// //                       }
// //                       style={
// //                         styles.modalTextInput
// //                       }
// //                     />
// //                   </View>

// //                   <Text
// //                     style={[
// //                       styles.fieldLabel,
// //                       {
// //                         marginTop: 14,
// //                       },
// //                     ]}
// //                   >
// //                     Duration Unit
// //                   </Text>

// //                   <View
// //                     style={
// //                       styles.unitChipContainer
// //                     }
// //                   >
// //                     {DURATION_UNITS.map(
// //                       (unit) => {
// //                         const isSelected =
// //                           learningDurationUnit ===
// //                           unit;

// //                         return (
// //                           <TouchableOpacity
// //                             key={unit}
// //                             style={[
// //                               styles.unitChip,
// //                               isSelected &&
// //                                 styles.unitChipSelected,
// //                             ]}
// //                             onPress={() =>
// //                               setLearningDurationUnit(
// //                                 unit
// //                               )
// //                             }
// //                           >
// //                             <Text
// //                               style={[
// //                                 styles.unitChipText,
// //                                 isSelected &&
// //                                   styles.unitChipTextSelected,
// //                               ]}
// //                             >
// //                               {unit}
// //                             </Text>
// //                           </TouchableOpacity>
// //                         );
// //                       }
// //                     )}
// //                   </View>
// //                 </View>
// //               )}

// //               {/* ==========================================
// //                   MODAL ACTIONS
// //               ========================================== */}

// //               <View
// //                 style={
// //                   styles.modalActions
// //                 }
// //               >
// //                 <TouchableOpacity
// //                   disabled={
// //                     requestLoading
// //                   }
// //                   style={[
// //                     styles.submitButton,
// //                     requestLoading &&
// //                       styles.disabledButton,
// //                   ]}
// //                   onPress={
// //                     sendRequest
// //                   }
// //                 >
// //                   {requestLoading ? (
// //                     <ActivityIndicator
// //                       size="small"
// //                       color="#FFFFFF"
// //                     />
// //                   ) : (
// //                     <>
// //                       <Icon
// //                         name="send"
// //                         size={17}
// //                         color="#FFFFFF"
// //                         style={{
// //                           marginRight: 7,
// //                         }}
// //                       />

// //                       <Text
// //                         style={
// //                           styles.submitButtonText
// //                         }
// //                       >
// //                         Send Request to{" "}
// //                         {
// //                           selectedTutors.length
// //                         }{" "}
// //                         Tutor
// //                         {selectedTutors.length ===
// //                         1
// //                           ? ""
// //                           : "s"}
// //                       </Text>
// //                     </>
// //                   )}
// //                 </TouchableOpacity>

// //                 <TouchableOpacity
// //                   disabled={
// //                     requestLoading
// //                   }
// //                   style={
// //                     styles.cancelButton
// //                   }
// //                   onPress={
// //                     closeRequestModal
// //                   }
// //                 >
// //                   <Text
// //                     style={
// //                       styles.cancelButtonText
// //                     }
// //                   >
// //                     Cancel
// //                   </Text>
// //                 </TouchableOpacity>
// //               </View>
// //             </ScrollView>
// //           </View>
// //         </View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // };

// // // ======================================================
// // // STYLES
// // // ======================================================

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#F8FAFC",
// //   },

// //   // ====================================================
// //   // TOP BAR
// //   // ====================================================

// //   topBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //     backgroundColor: "#FFFFFF",
// //     borderBottomWidth: 1,
// //     borderBottomColor: "#F1F5F9",
// //   },

// //   backButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     backgroundColor: "#F1F5F9",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   titleContainer: {
// //     alignItems: "center",
// //     flex: 1,
// //   },

// //   headerSubtitle: {
// //     fontSize: 10,
// //     fontWeight: "700",
// //     color: PRIMARY_COLOR,
// //     textTransform: "uppercase",
// //     letterSpacing: 0.6,
// //   },

// //   headerTitle: {
// //     fontSize: 16,
// //     fontWeight: "700",
// //     color: "#0F172A",
// //     marginTop: 2,
// //   },

// //   // ====================================================
// //   // MODE INFORMATION
// //   // ====================================================

// //   modeInformation: {
// //     marginHorizontal: 16,
// //     marginTop: 12,
// //     padding: 11,
// //     borderRadius: 12,
// //     backgroundColor: "#F0FDFA",
// //     borderWidth: 1,
// //     borderColor: "#CCFBF1",
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },

// //   modeInformationIcon: {
// //     width: 34,
// //     height: 34,
// //     borderRadius: 17,
// //     backgroundColor: "#FFFFFF",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   modeInformationTextContainer: {
// //     flex: 1,
// //     marginLeft: 9,
// //   },

// //   modeInformationTitle: {
// //     fontSize: 12,
// //     fontWeight: "700",
// //     color: "#115E59",
// //   },

// //   modeInformationText: {
// //     fontSize: 11,
// //     color: "#0F766E",
// //     marginTop: 2,
// //     lineHeight: 16,
// //   },

// //   // ====================================================
// //   // SEARCH
// //   // ====================================================

// //   searchSection: {
// //     paddingHorizontal: 16,
// //     paddingTop: 12,
// //     paddingBottom: 8,
// //   },

// //   searchInputContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: 12,
// //     paddingHorizontal: 14,
// //     height: 46,
// //     borderWidth: 1,
// //     borderColor: "#E2E8F0",
// //   },

// //   searchInput: {
// //     flex: 1,
// //     marginLeft: 10,
// //     fontSize: 14,
// //     color: "#0F172A",
// //   },

// //   // ====================================================
// //   // SORT
// //   // ====================================================

// //   sortSection: {
// //     paddingHorizontal: 16,
// //     paddingBottom: 12,
// //     paddingTop: 4,
// //     backgroundColor: "#F8FAFC",
// //   },

// //   sortLabel: {
// //     fontSize: 13,
// //     fontWeight: "700",
// //     color: "#334155",
// //     marginBottom: 8,
// //   },

// //   sortButtonsRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //   },

// //   sortButton: {
// //     flex: 1,
// //     height: 38,
// //     borderRadius: 20,
// //     borderWidth: 1,
// //     borderColor: "#CBD5E1",
// //     backgroundColor: "#F1F5F9",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginHorizontal: 3,
// //   },

// //   sortButtonActive: {
// //     backgroundColor:
// //       PRIMARY_COLOR,
// //     borderColor:
// //       PRIMARY_COLOR,
// //   },

// //   sortButtonText: {
// //     fontSize: 12,
// //     fontWeight: "600",
// //     color: "#475569",
// //   },

// //   sortButtonTextActive: {
// //     color: "#FFFFFF",
// //     fontWeight: "700",
// //   },

// //   // ====================================================
// //   // SELECTION BAR
// //   // ====================================================

// //   selectionBar: {
// //     marginHorizontal: 16,
// //     marginBottom: 10,
// //     paddingHorizontal: 10,
// //     paddingVertical: 10,
// //     borderRadius: 12,
// //     backgroundColor: "#FFFFFF",
// //     borderWidth: 1,
// //     borderColor: "#D1FAE5",
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //   },

// //   selectionInfo: {
// //     flex: 1,
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },

// //   selectionCountCircle: {
// //     width: 34,
// //     height: 34,
// //     borderRadius: 17,
// //     backgroundColor:
// //       PRIMARY_COLOR,
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   selectionCountText: {
// //     color: "#FFFFFF",
// //     fontSize: 14,
// //     fontWeight: "700",
// //   },

// //   selectionTextContainer: {
// //     flex: 1,
// //     marginLeft: 9,
// //   },

// //   selectionTitle: {
// //     fontSize: 13,
// //     fontWeight: "700",
// //     color: "#0F172A",
// //   },

// //   selectionSubtitle: {
// //     fontSize: 11,
// //     color: "#64748B",
// //     marginTop: 2,
// //   },

// //   selectionActions: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginLeft: 8,
// //   },

// //   clearButton: {
// //     width: 36,
// //     height: 36,
// //     borderRadius: 18,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     backgroundColor: "#F1F5F9",
// //     marginRight: 6,
// //   },

// //   continueButton: {
// //     height: 36,
// //     paddingHorizontal: 12,
// //     borderRadius: 9,
// //     backgroundColor:
// //       PRIMARY_COLOR,
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   continueButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: 12,
// //     fontWeight: "700",
// //     marginRight: 5,
// //   },

// //   // ====================================================
// //   // LOADING
// //   // ====================================================

// //   centerContainer: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     padding: 24,
// //   },

// //   loadingText: {
// //     marginTop: 12,
// //     color: "#64748B",
// //     fontSize: 14,
// //     fontWeight: "500",
// //   },

// //   // ====================================================
// //   // LIST
// //   // ====================================================

// //   listContent: {
// //     paddingHorizontal: 16,
// //     paddingBottom: 40,
// //   },

// //   listContentWithSelection: {
// //     paddingBottom: 60,
// //   },

// //   // ====================================================
// //   // CARD
// //   // ====================================================

// //   card: {
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: 16,
// //     padding: 16,
// //     marginBottom: 16,
// //     borderWidth: 1,
// //     borderColor: "#E2E8F0",

// //     shadowColor: "#0F172A",

// //     shadowOffset: {
// //       width: 0,
// //       height: 2,
// //     },

// //     shadowOpacity: 0.04,

// //     shadowRadius: 8,

// //     elevation: 2,
// //   },

// //   cardSelected: {
// //     borderColor:
// //       PRIMARY_COLOR,
// //     borderWidth: 2,
// //   },

// //   cardHeader: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },

// //   avatarContainer: {
// //     width: 44,
// //     height: 44,
// //     borderRadius: 22,
// //     backgroundColor: "#EFF6FF",
// //     borderWidth: 1,
// //     borderColor: "#DBEAFE",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   avatarText: {
// //     fontSize: 18,
// //     fontWeight: "700",
// //     color: PRIMARY_COLOR,
// //   },

// //   headerInfo: {
// //     flex: 1,
// //     marginLeft: 12,
// //     marginRight: 8,
// //   },

// //   tutorName: {
// //     fontSize: 16,
// //     fontWeight: "700",
// //     color: "#0F172A",
// //   },

// //   ratingRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginTop: 2,
// //   },

// //   ratingVal: {
// //     fontSize: 13,
// //     fontWeight: "700",
// //     color: "#0F172A",
// //     marginLeft: 4,
// //   },

// //   reviewCount: {
// //     fontSize: 13,
// //     color: "#64748B",
// //     marginLeft: 4,
// //   },

// //   // ====================================================
// //   // CHECKBOX
// //   // ====================================================

// //   checkbox: {
// //     width: 26,
// //     height: 26,
// //     borderRadius: 13,
// //     borderWidth: 2,
// //     borderColor: "#CBD5E1",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   checkboxSelected: {
// //     backgroundColor:
// //       PRIMARY_COLOR,
// //     borderColor:
// //       PRIMARY_COLOR,
// //   },

// //   // ====================================================
// //   // TUTOR INFORMATION
// //   // ====================================================

// //   tutorInfoRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginTop: 12,
// //     paddingTop: 10,
// //     borderTopWidth: 1,
// //     borderTopColor: "#F1F5F9",
// //   },

// //   infoItem: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     flex: 1,
// //     marginRight: 8,
// //   },

// //   infoText: {
// //     flex: 1,
// //     fontSize: 12,
// //     color: "#475569",
// //     marginLeft: 5,
// //   },

// //   // ====================================================
// //   // FEE
// //   // ====================================================

// //   feeRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginTop: 10,
// //   },

// //   feeText: {
// //     fontSize: 13,
// //     fontWeight: "700",
// //     color: PRIMARY_COLOR,
// //     marginLeft: 6,
// //   },

// //   // ====================================================
// //   // LOCATION
// //   // ====================================================

// //   locationContainer: {
// //     marginTop: 9,
// //     paddingTop: 9,
// //     borderTopWidth: 1,
// //     borderTopColor: "#F1F5F9",
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //   },

// //   metaRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     flex: 1,
// //     marginRight: 8,
// //   },

// //   metaText: {
// //     flex: 1,
// //     fontSize: 12,
// //     color: "#475569",
// //     marginLeft: 6,
// //   },

// //   modeBadge: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 8,
// //     paddingVertical: 5,
// //     borderRadius: 8,
// //     backgroundColor: "#F0FDFA",
// //     borderWidth: 1,
// //     borderColor: "#CCFBF1",
// //   },

// //   modeBadgeText: {
// //     fontSize: 10,
// //     fontWeight: "700",
// //     color: "#0F766E",
// //     marginLeft: 4,
// //   },

// //   // ====================================================
// //   // SLOT
// //   // ====================================================

// //   slotCard: {
// //     borderRadius: 12,
// //     padding: 12,
// //     marginTop: 12,
// //     borderWidth: 1,
// //   },

// //   slotCardAvailable: {
// //     backgroundColor: "#F0FDF4",
// //     borderColor: "#DCFCE7",
// //   },

// //   slotCardUnavailable: {
// //     backgroundColor: "#FFFBEB",
// //     borderColor: "#FEF3C7",
// //   },

// //   slotHeaderRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },

// //   statusBadge: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 6,
// //   },

// //   badgeAvailable: {
// //     backgroundColor: "#DCFCE7",
// //   },

// //   badgeUnavailable: {
// //     backgroundColor: "#FEF3C7",
// //   },

// //   statusDot: {
// //     width: 6,
// //     height: 6,
// //     borderRadius: 3,
// //     marginRight: 6,
// //   },

// //   dotAvailable: {
// //     backgroundColor: "#16A34A",
// //   },

// //   dotUnavailable: {
// //     backgroundColor: "#D97706",
// //   },

// //   statusText: {
// //     fontSize: 12,
// //     fontWeight: "600",
// //   },

// //   textAvailable: {
// //     color: "#15803D",
// //   },

// //   textUnavailable: {
// //     color: "#B45309",
// //   },

// //   slotDetailGrid: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginTop: 8,
// //   },

// //   slotDetailItem: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginRight: 16,
// //   },

// //   slotDetailText: {
// //     fontSize: 13,
// //     fontWeight: "600",
// //     color: "#334155",
// //     marginLeft: 6,
// //   },

// //   unavailableNotice: {
// //     flexDirection: "row",
// //     alignItems: "flex-start",
// //     marginTop: 10,
// //     paddingTop: 8,
// //     borderTopWidth: 1,
// //     borderTopColor: "#FDE68A",
// //   },

// //   noticeTextContainer: {
// //     flex: 1,
// //     marginLeft: 6,
// //   },

// //   noticeMessage: {
// //     fontSize: 12,
// //     fontWeight: "600",
// //     color: "#B45309",
// //     lineHeight: 16,
// //   },

// //   // ====================================================
// //   // REQUEST BUTTON
// //   // ====================================================

// //   requestButton: {
// //     backgroundColor:
// //       PRIMARY_COLOR,
// //     borderRadius: 10,
// //     height: 44,
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginTop: 14,
// //   },

// //   requestButtonSelected: {
// //     backgroundColor:
// //       "#15803D",
// //   },

// //   requestButtonDisabled: {
// //     opacity: 0.5,
// //   },

// //   requestButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: 14,
// //     fontWeight: "600",
// //     marginLeft: 6,
// //   },

// //   // ====================================================
// //   // EMPTY
// //   // ====================================================

// //   emptyContainer: {
// //     alignItems: "center",
// //     justifyContent: "center",
// //     paddingVertical: 48,
// //     paddingHorizontal: 24,
// //   },

// //   emptyIconCircle: {
// //     width: 64,
// //     height: 64,
// //     borderRadius: 32,
// //     backgroundColor: "#F1F5F9",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginBottom: 12,
// //   },

// //   emptyTitle: {
// //     fontSize: 16,
// //     fontWeight: "700",
// //     color: "#0F172A",
// //   },

// //   emptySubtext: {
// //     fontSize: 13,
// //     color: "#64748B",
// //     textAlign: "center",
// //     marginTop: 4,
// //     lineHeight: 18,
// //   },

// //   // ====================================================
// //   // MODAL
// //   // ====================================================

// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor:
// //       "rgba(15, 23, 42, 0.5)",
// //     justifyContent: "center",
// //     padding: 20,
// //   },

// //   modalCard: {
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: 20,
// //     maxHeight: "88%",

// //     shadowColor: "#000",

// //     shadowOffset: {
// //       width: 0,
// //       height: 10,
// //     },

// //     shadowOpacity: 0.15,

// //     shadowRadius: 20,

// //     elevation: 10,

// //     overflow: "hidden",
// //   },

// //   modalHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     paddingHorizontal: 20,
// //     paddingVertical: 16,
// //     borderBottomWidth: 1,
// //     borderBottomColor: "#F1F5F9",
// //   },

// //   modalHeaderTextContainer: {
// //     flex: 1,
// //   },

// //   modalHeaderTitle: {
// //     fontSize: 18,
// //     fontWeight: "700",
// //     color: "#0F172A",
// //   },

// //   modalHeaderSubtitle: {
// //     fontSize: 12,
// //     color: "#64748B",
// //     marginTop: 2,
// //   },

// //   modalCloseButton: {
// //     padding: 4,
// //   },

// //   modalBody: {
// //     padding: 20,
// //   },

// //   // ====================================================
// //   // SELECTED TUTORS
// //   // ====================================================

// //   selectedTutorsContainer: {
// //     marginBottom: 16,
// //   },

// //   selectedTutorRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#F8FAFC",
// //     borderWidth: 1,
// //     borderColor: "#E2E8F0",
// //     borderRadius: 10,
// //     padding: 9,
// //     marginBottom: 7,
// //   },

// //   selectedTutorAvatar: {
// //     width: 34,
// //     height: 34,
// //     borderRadius: 17,
// //     backgroundColor: "#EFF6FF",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   selectedTutorAvatarText: {
// //     fontSize: 14,
// //     fontWeight: "700",
// //     color: PRIMARY_COLOR,
// //   },

// //   selectedTutorInfo: {
// //     flex: 1,
// //     marginLeft: 9,
// //   },

// //   selectedTutorName: {
// //     fontSize: 13,
// //     fontWeight: "700",
// //     color: "#0F172A",
// //   },

// //   selectedTutorDetails: {
// //     fontSize: 11,
// //     color: "#64748B",
// //     marginTop: 2,
// //   },

// //   removeTutorButton: {
// //     width: 32,
// //     height: 32,
// //     borderRadius: 16,
// //     backgroundColor: "#E2E8F0",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   // ====================================================
// //   // SUMMARY
// //   // ====================================================

// //   summaryCard: {
// //     backgroundColor: "#F8FAFC",
// //     borderRadius: 12,
// //     padding: 12,
// //     borderWidth: 1,
// //     borderColor: "#E2E8F0",
// //     marginBottom: 16,
// //   },

// //   summaryTitle: {
// //     fontSize: 12,
// //     fontWeight: "700",
// //     color: "#64748B",
// //     textTransform: "uppercase",
// //     marginBottom: 8,
// //   },

// //   summaryRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginBottom: 4,
// //   },

// //   summaryText: {
// //     fontSize: 13,
// //     fontWeight: "600",
// //     color: "#0F172A",
// //     marginLeft: 8,
// //   },

// //   summaryModeRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginTop: 6,
// //     paddingTop: 7,
// //     borderTopWidth: 1,
// //     borderTopColor: "#E2E8F0",
// //   },

// //   summaryModeText: {
// //     fontSize: 12,
// //     fontWeight: "600",
// //     color: "#0F766E",
// //     marginLeft: 8,
// //   },

// //   // ====================================================
// //   // INFO NOTICE
// //   // ====================================================

// //   infoNotice: {
// //     flexDirection: "row",
// //     alignItems: "flex-start",
// //     backgroundColor: "#F0FDFA",
// //     borderWidth: 1,
// //     borderColor: "#CCFBF1",
// //     borderRadius: 10,
// //     padding: 11,
// //     marginBottom: 16,
// //   },

// //   infoNoticeText: {
// //     flex: 1,
// //     fontSize: 12,
// //     lineHeight: 17,
// //     color: "#115E59",
// //     marginLeft: 8,
// //   },

// //   // ====================================================
// //   // FORM
// //   // ====================================================

// //   fieldLabel: {
// //     fontSize: 13,
// //     fontWeight: "600",
// //     color: "#334155",
// //     marginBottom: 8,
// //   },

// //   segmentedControl: {
// //     flexDirection: "row",
// //     backgroundColor: "#F1F5F9",
// //     borderRadius: 10,
// //     padding: 3,
// //     marginBottom: 16,
// //   },

// //   segmentButton: {
// //     flex: 1,
// //     paddingVertical: 10,
// //     alignItems: "center",
// //     borderRadius: 8,
// //   },

// //   segmentButtonActive: {
// //     backgroundColor: "#FFFFFF",

// //     shadowColor: "#000",

// //     shadowOffset: {
// //       width: 0,
// //       height: 1,
// //     },

// //     shadowOpacity: 0.08,

// //     shadowRadius: 2,

// //     elevation: 1,
// //   },

// //   segmentText: {
// //     fontSize: 13,
// //     fontWeight: "600",
// //     color: "#64748B",
// //   },

// //   segmentTextActive: {
// //     color: PRIMARY_COLOR,
// //   },

// //   // ====================================================
// //   // DURATION
// //   // ====================================================

// //   durationSection: {
// //     marginBottom: 16,
// //   },

// //   textInputWrapper: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     borderWidth: 1,
// //     borderColor: "#CBD5E1",
// //     borderRadius: 10,
// //     paddingHorizontal: 12,
// //     height: 44,
// //   },

// //   modalTextInput: {
// //     flex: 1,
// //     fontSize: 14,
// //     color: "#0F172A",
// //   },

// //   unitChipContainer: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //   },

// //   unitChip: {
// //     flex: 1,
// //     paddingVertical: 10,
// //     alignItems: "center",
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: "#E2E8F0",
// //     backgroundColor: "#F8FAFC",
// //     marginHorizontal: 3,
// //   },

// //   unitChipSelected: {
// //     borderColor:
// //       PRIMARY_COLOR,
// //     backgroundColor: "#EFF6FF",
// //   },

// //   unitChipText: {
// //     fontSize: 12,
// //     fontWeight: "600",
// //     color: "#64748B",
// //   },

// //   unitChipTextSelected: {
// //     color: PRIMARY_COLOR,
// //   },

// //   // ====================================================
// //   // MODAL ACTIONS
// //   // ====================================================

// //   modalActions: {
// //     marginTop: 8,
// //   },

// //   submitButton: {
// //     backgroundColor:
// //       PRIMARY_COLOR,
// //     borderRadius: 10,
// //     minHeight: 46,
// //     paddingHorizontal: 12,
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   submitButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: 14,
// //     fontWeight: "600",
// //   },

// //   disabledButton: {
// //     opacity: 0.6,
// //   },

// //   cancelButton: {
// //     height: 40,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginTop: 6,
// //   },

// //   cancelButtonText: {
// //     color: "#64748B",
// //     fontSize: 14,
// //     fontWeight: "600",
// //   },
// // });
// // export default StudentFindTutorNonVisiting;