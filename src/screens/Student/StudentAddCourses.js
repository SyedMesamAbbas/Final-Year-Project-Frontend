import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReactNativeBlobUtil from "react-native-blob-util";

import {
  pick,
  types,
  keepLocalCopy,
  isErrorWithCode,
  errorCodes,
} from "@react-native-documents/picker";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const StudentAddCourses = ({ navigation }) => {
  // =====================================================
  // COURSES
  // =====================================================

  const [myCourses, setMyCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  const [showCourses, setShowCourses] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  // =====================================================
  // UPLOAD CONTENT
  // =====================================================

  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [contentTitle, setContentTitle] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadingContent, setUploadingContent] = useState(false);

  // =====================================================
  // FETCH CONTENT
  // =====================================================

  const [showCourseContentModal, setShowCourseContentModal] =
    useState(false);

  const [courseContent, setCourseContent] = useState([]);
  const [selectedContentCourse, setSelectedContentCourse] = useState(null);
  const [loadingCourseContent, setLoadingCourseContent] = useState(false);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // =====================================================
  // GET MY COURSES
  // =====================================================

  const fetchMyCourses = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your login session has expired."
        );
        return;
      }

      const res = await fetch(`${BASE_URL}/Student/my-courses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      console.log("MY COURSES:", data);

      if (res.ok) {
        const courses =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : [];

        setMyCourses(courses);
      } else {
        console.log("My Courses Error:", data);
      }
    } catch (error) {
      console.log("Fetch My Courses Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET ALL COURSES
  // =====================================================

  const fetchAllCourses = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Student/all-courses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      console.log("ALL COURSES:", data);

      if (res.ok) {
        setAvailableCourses(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : []
        );

        setShowCourses(true);
      } else {
        Alert.alert(
          "Error",
          data?.message || "Unable to load courses."
        );
      }
    } catch (error) {
      console.log("Fetch All Courses Error:", error);

      Alert.alert(
        "Error",
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // =====================================================
  // FETCH COURSE CONTENT
  // =====================================================
  // GET:
  // /Student/my-course-content/{courseId}
  // =====================================================
  // =====================================================

  const fetchCourseContent = async (course) => {
    if (!course?.course_id) {
      Alert.alert(
        "Error",
        "Course information is missing."
      );
      return;
    }

    setSelectedContentCourse(course);
    setCourseContent([]);
    setShowCourseContentModal(true);
    setLoadingCourseContent(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your login session has expired."
        );

        setShowCourseContentModal(false);
        return;
      }

      const url =
        `${BASE_URL}/Student/my-course-content/${course.course_id}`;

      console.log("=================================");
      console.log("FETCH COURSE CONTENT");
      console.log("COURSE ID:", course.course_id);
      console.log("URL:", url);
      console.log("=================================");

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      console.log("COURSE CONTENT RESPONSE:", data);

      if (res.ok) {
        const content =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : [];

        setCourseContent(content);
      } else {
        setCourseContent([]);

        Alert.alert(
          "Error",
          data?.message ||
            "Unable to fetch course content."
        );
      }
    } catch (error) {
      console.log(
        "FETCH COURSE CONTENT ERROR:",
        error
      );

      setCourseContent([]);

      Alert.alert(
        "Network Error",
        "Unable to connect to server while fetching course content."
      );
    } finally {
      setLoadingCourseContent(false);
    }
  };

  // =====================================================
  // GET FILE URL
  // =====================================================

  const getFileUrl = (filePath) => {
    if (!filePath) {
      return null;
    }

    // Already complete URL
    if (
      filePath.startsWith("http://") ||
      filePath.startsWith("https://")
    ) {
      return filePath;
    }

    let cleanPath = filePath;

    // Remove leading slash
    cleanPath = cleanPath.replace(/^\/+/, "");

    // If path is like uploads/course-content/file.pdf
    // create URL from server root instead of /api
    let serverRoot = BASE_URL;

    serverRoot = serverRoot.replace(/\/api\/?$/i, "");

    return `${serverRoot}/${cleanPath}`;
  };

  // =====================================================
  // OPEN COURSE CONTENT FILE
  // =====================================================

  const openCourseContentFile = async (content) => {
    try {
      const filePath = content?.file_path;

      if (!filePath) {
        Alert.alert(
          "File Not Found",
          "File path is not available."
        );
        return;
      }

      const fileUrl = getFileUrl(filePath);

      console.log("=================================");
      console.log("OPEN COURSE CONTENT FILE");
      console.log("FILE PATH:", filePath);
      console.log("FILE URL:", fileUrl);
      console.log("=================================");

      if (!fileUrl) {
        Alert.alert(
          "File Error",
          "Unable to create file URL."
        );
        return;
      }

      const supported = await Linking.canOpenURL(fileUrl);

      if (!supported) {
        Alert.alert(
          "Unable to Open",
          "This file cannot be opened on your device."
        );
        return;
      }

      await Linking.openURL(fileUrl);
    } catch (error) {
      console.log(
        "OPEN FILE ERROR:",
        error
      );

      Alert.alert(
        "File Error",
        "Unable to open course content file."
      );
    }
  };

  // =====================================================
  // CLOSE FETCH CONTENT MODAL
  // =====================================================

  const closeCourseContentModal = () => {
    if (loadingCourseContent) {
      return;
    }

    setShowCourseContentModal(false);
    setSelectedContentCourse(null);
    setCourseContent([]);
  };

  // =====================================================
  // ADD COURSE
  // =====================================================

  const addCourse = async (course) => {
    if (!course?.course_id) {
      Alert.alert(
        "Error",
        "Invalid course information."
      );
      return;
    }

    setAddingId(course.course_id);

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/Student/add-courses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            courseIds: [course.course_id],
          }),
        }
      );

      const data = await res.json();

      console.log(
        "Add Course Response:",
        data
      );

      if (res.ok) {
        setSelectedCourse(course);

        setContentTitle("");
        setContentDescription("");
        setSelectedFile(null);

        setShowCourses(false);
        setAvailableCourses([]);
        setSearchQuery("");

        setShowContentModal(true);

        await fetchMyCourses();
      } else {
        Alert.alert(
          "Error",
          data?.message ||
            "Unable to add course."
        );
      }
    } catch (error) {
      console.log(
        "Add Course Error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to connect to server."
      );
    } finally {
      setAddingId(null);
    }
  };

  // =====================================================
  // MIME TYPE
  // =====================================================

  const getMimeTypeFromFileName = (fileName) => {
    if (!fileName) {
      return "application/octet-stream";
    }

    const extension =
      fileName
        .split(".")
        .pop()
        ?.toLowerCase();

    switch (extension) {
      case "pdf":
        return "application/pdf";

      case "doc":
        return "application/msword";

      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      case "jpg":
      case "jpeg":
        return "image/jpeg";

      case "png":
        return "image/png";

      default:
        return "application/octet-stream";
    }
  };

  // =====================================================
  // PICK COURSE CONTENT
  // =====================================================

  const pickCourseContent = async () => {
    try {
      const results = await pick({
        type: [
          types.pdf,
          types.doc,
          types.docx,
          types.images,
        ],
        allowMultiSelection: false,
        allowVirtualFiles: false,
      });

      if (!results || results.length === 0) {
        return;
      }

      const file = results[0];

      console.log(
        "================================="
      );
      console.log(
        "SELECTED FILE"
      );
      console.log(
        "NAME:",
        file.name
      );
      console.log(
        "URI:",
        file.uri
      );
      console.log(
        "TYPE:",
        file.type
      );
      console.log(
        "SIZE:",
        file.size
      );
      console.log(
        "================================="
      );

      if (!file.uri) {
        Alert.alert(
          "File Error",
          "Selected file does not have a valid URI."
        );
        return;
      }

      const copyResults =
        await keepLocalCopy({
          files: [
            {
              uri: file.uri,
              fileName:
                file.name ||
                `course_content_${Date.now()}`,
            },
          ],
          destination:
            "cachesDirectory",
        });

      console.log(
        "COPY RESULT:",
        JSON.stringify(
          copyResults,
          null,
          2
        )
      );

      const copyResult =
        copyResults?.[0];

      if (!copyResult) {
        Alert.alert(
          "File Error",
          "Unable to prepare selected file."
        );
        return;
      }

      if (
        copyResult.status !==
        "success"
      ) {
        Alert.alert(
          "File Error",
          copyResult.copyError ||
            "Unable to prepare selected file."
        );
        return;
      }

      const localUri =
        copyResult.localUri;

      if (!localUri) {
        Alert.alert(
          "File Error",
          "Local file URI is missing."
        );
        return;
      }

      const fileName =
        file.name ||
        `course_content_${Date.now()}.jpg`;

      const mimeType =
        file.type ||
        getMimeTypeFromFileName(
          fileName
        );

      const preparedFile = {
        uri: localUri,
        name: fileName,
        type: mimeType,
        size: file.size || 0,
      };

      console.log(
        "PREPARED FILE:",
        JSON.stringify(
          preparedFile,
          null,
          2
        )
      );

      setSelectedFile(
        preparedFile
      );

      Alert.alert(
        "File Selected",
        fileName
      );
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code ===
          errorCodes.OPERATION_CANCELED
      ) {
        console.log(
          "File picker cancelled."
        );
        return;
      }

      console.log(
        "FILE PICKER ERROR:",
        error
      );

      Alert.alert(
        "File Error",
        error?.message ||
          "Unable to select file."
      );
    }
  };

  // =====================================================
  // UPLOAD COURSE CONTENT
  // =====================================================

  const uploadCourseContent = async () => {
    if (!selectedCourse?.course_id) {
      Alert.alert(
        "Error",
        "Course information is missing."
      );
      return;
    }

    if (!contentTitle.trim()) {
      Alert.alert(
        "Required",
        "Please enter Course Content title."
      );
      return;
    }

    if (!selectedFile?.uri) {
      Alert.alert(
        "Required",
        "Please select Course Content / Async Lesson Plan."
      );
      return;
    }

    const token =
      await AsyncStorage.getItem(
        "token"
      );

    if (!token) {
      Alert.alert(
        "Login Required",
        "Your login session has expired. Please login again."
      );
      return;
    }

    setUploadingContent(true);

    try {
      const uploadUrl =
        `${BASE_URL}/Student/upload-course-content`;

      console.log(
        "================================="
      );
      console.log(
        "STARTING BLOB COURSE CONTENT UPLOAD"
      );
      console.log(
        "URL:",
        uploadUrl
      );
      console.log(
        "COURSE ID:",
        selectedCourse.course_id
      );
      console.log(
        "TITLE:",
        contentTitle.trim()
      );
      console.log(
        "DESCRIPTION:",
        contentDescription.trim()
      );
      console.log(
        "FILE URI:",
        selectedFile.uri
      );
      console.log(
        "FILE NAME:",
        selectedFile.name
      );
      console.log(
        "FILE TYPE:",
        selectedFile.type
      );
      console.log(
        "================================="
      );

      const filePath =
        selectedFile.uri.startsWith(
          "file://"
        )
          ? selectedFile.uri.replace(
              "file://",
              ""
            )
          : selectedFile.uri;

      const response =
        await ReactNativeBlobUtil.fetch(
          "POST",
          uploadUrl,
          {
            Authorization:
              `Bearer ${token}`,
            Accept:
              "application/json",
            "Content-Type":
              "multipart/form-data",
          },
          [
            {
              name: "course_id",
              data: String(
                selectedCourse.course_id
              ),
            },
            {
              name: "title",
              data:
                contentTitle.trim(),
            },
            {
              name: "description",
              data:
                contentDescription.trim(),
            },
            {
              name: "file",
              filename:
                selectedFile.name ||
                "course_content.jpg",
              type:
                selectedFile.type ||
                "image/jpeg",
              data:
                ReactNativeBlobUtil.wrap(
                  filePath
                ),
            },
          ]
        );

      const status =
        response.info().status;

      console.log(
        "UPLOAD STATUS:",
        status
      );

      console.log(
        "UPLOAD RESPONSE:",
        response.data
      );

      let data = {};

      try {
        data = response.data
          ? JSON.parse(
              response.data
            )
          : {};
      } catch (error) {
        console.log(
          "JSON PARSE ERROR:",
          error
        );
      }

      if (
        status >= 200 &&
        status < 300
      ) {
        Alert.alert(
          "Success",
          data?.message ||
            "Course content uploaded successfully.",
          [
            {
              text: "OK",
              onPress:
                async () => {
                  setShowContentModal(
                    false
                  );

                  setSelectedCourse(
                    null
                  );

                  setContentTitle(
                    ""
                  );

                  setContentDescription(
                    ""
                  );

                  setSelectedFile(
                    null
                  );

                  await fetchMyCourses();
                },
            },
          ]
        );
      } else {
        Alert.alert(
          "Upload Failed",
          data?.message ||
            data?.title ||
            data?.error ||
            response.data ||
            `Upload failed. HTTP ${status}`
        );
      }
    } catch (error) {
      console.log(
        "================================="
      );
      console.log(
        "BLOB UPLOAD ERROR"
      );
      console.log(
        "MESSAGE:",
        error?.message
      );
      console.log(
        "STACK:",
        error?.stack
      );
      console.log(
        "================================="
      );

      Alert.alert(
        "Upload Error",
        error?.message ||
          "Unable to upload course content."
      );
    } finally {
      setUploadingContent(false);
    }
  };

  // =====================================================
  // CLOSE UPLOAD MODAL
  // =====================================================

  const closeContentModal = () => {
    if (uploadingContent) {
      return;
    }

    Alert.alert(
      "Course Content Required",
      "Course Content is required for this course. Are you sure you want to close?",
      [
        {
          text: "Continue Uploading",
          style: "cancel",
        },
        {
          text: "Close",
          style: "destructive",
          onPress: () => {
            setShowContentModal(
              false
            );

            setSelectedCourse(
              null
            );

            setContentTitle("");

            setContentDescription(
              ""
            );

            setSelectedFile(null);
          },
        },
      ]
    );
  };

  // =====================================================
  // FILTER COURSES
  // =====================================================

  const filteredAvailableCourses =
    availableCourses.filter(
      (course) =>
        course?.course_name
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
    );

  // =====================================================
  // FILE NAME
  // =====================================================

  const getFileName = () => {
    if (!selectedFile) {
      return "No file selected";
    }

    return (
      selectedFile.name ||
      "Selected file"
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Date not available";
    }

    try {
      const date =
        new Date(dateValue);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return String(
          dateValue
        );
      }

      return date.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return String(
        dateValue
      );
    }
  };

  // =====================================================
  // GET ICON FOR FILE
  // =====================================================

  const getFileIcon = (fileName) => {
    const name =
      String(
        fileName || ""
      ).toLowerCase();

    if (name.endsWith(".pdf")) {
      return "picture-as-pdf";
    }

    if (
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".png")
    ) {
      return "image";
    }

    if (
      name.endsWith(".doc") ||
      name.endsWith(".docx")
    ) {
      return "description";
    }

    return "insert-drive-file";
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              "StudentDrawer"
            )
          }
        >
          <Icon
            name="menu"
            size={24}
            color="#1E293B"
          />
        </TouchableOpacity>

        <View
          style={styles.headerCenter}
        >
          <Image
            source={require(
              "../../../assets/images/logo.png"
            )}
            style={
              styles.logoImage
            }
          />

          <Text
            style={styles.logoText}
          >
            House of Tutor
          </Text>
        </View>

        <View
          style={{ width: 40 }}
        />
      </View>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <View
        style={styles.content}
      >
        {!showCourses ? (
          <>
            {/* =================================================
                MY COURSES
            ================================================= */}

            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.pageTitle
                  }
                >
                  My Courses
                </Text>

                <Text
                  style={
                    styles.pageSubtitle
                  }
                >
                  {myCourses.length}{" "}
                  {myCourses.length ===
                  1
                    ? "course"
                    : "courses"}{" "}
                  currently enrolled
                </Text>
              </View>
            </View>

            {loading ? (
              <View
                style={
                  styles.loadingState
                }
              >
                <ActivityIndicator
                  size="large"
                  color={
                    colors.primary ||
                    "#4F46E5"
                  }
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Loading your courses...
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.scrollContent
                }
              >
                {myCourses.length >
                0 ? (
                  myCourses.map(
                    (
                      course,
                      index
                    ) => (
                      <TouchableOpacity
                        key={
                          course.course_id ||
                          index
                        }
                        style={
                          styles.courseCard
                        }
                        activeOpacity={
                          0.75
                        }
                        onPress={() =>
                          fetchCourseContent(
                            course
                          )
                        }
                      >
                        <View
                          style={
                            styles.courseIconBox
                          }
                        >
                          <Icon
                            name="class"
                            size={22}
                            color={
                              colors.primary ||
                              "#4F46E5"
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.courseInfo
                          }
                        >
                          <Text
                            style={
                              styles.courseTitle
                            }
                          >
                            {
                              course.course_name
                            }
                          </Text>

                          <View
                            style={
                              styles.activeTag
                            }
                          >
                            <View
                              style={
                                styles.activeDot
                              }
                            />

                            <Text
                              style={
                                styles.activeTagText
                              }
                            >
                              Enrolled
                            </Text>
                          </View>

                          <Text
                            style={
                              styles.tapContentText
                            }
                          >
                            Tap to view course content
                          </Text>
                        </View>

                        <Icon
                          name="chevron-right"
                          size={24}
                          color="#94A3B8"
                        />
                      </TouchableOpacity>
                    )
                  )
                ) : (
                  <View
                    style={
                      styles.emptyCard
                    }
                  >
                    <View
                      style={
                        styles.emptyIconCircle
                      }
                    >
                      <Icon
                        name="menu-book"
                        size={36}
                        color="#94A3B8"
                      />
                    </View>

                    <Text
                      style={
                        styles.emptyTitle
                      }
                    >
                      No Courses Added Yet
                    </Text>

                    <Text
                      style={
                        styles.emptySubtitle
                      }
                    >
                      Tap the button below to
                      browse available catalog
                      courses and start learning.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* =================================================
                ADD COURSE
            ================================================= */}

            <TouchableOpacity
              style={
                styles.floatingBtn
              }
              activeOpacity={0.85}
              onPress={
                fetchAllCourses
              }
            >
              <Icon
                name="add"
                size={28}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.floatingBtnText
                }
              >
                Add Course
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          /* =====================================================
             COURSE CATALOG
          ===================================================== */

          <View
            style={
              styles.catalogContainer
            }
          >
            <View
              style={
                styles.catalogHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.pageTitle
                  }
                >
                  Course Catalog
                </Text>

                <Text
                  style={
                    styles.pageSubtitle
                  }
                >
                  Select a course to add
                  to your study plan
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.closeButton
                }
                activeOpacity={0.7}
                onPress={() => {
                  setShowCourses(
                    false
                  );
                  setSearchQuery(
                    ""
                  );
                }}
              >
                <Icon
                  name="close"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.searchBox
              }
            >
              <Icon
                name="search"
                size={20}
                color="#94A3B8"
                style={
                  styles.searchIcon
                }
              />

              <TextInput
                style={
                  styles.searchInput
                }
                placeholder="Search courses..."
                placeholderTextColor="#94A3B8"
                value={
                  searchQuery
                }
                onChangeText={
                  setSearchQuery
                }
              />

              {searchQuery.length >
                0 && (
                <TouchableOpacity
                  onPress={() =>
                    setSearchQuery(
                      ""
                    )
                  }
                >
                  <Icon
                    name="cancel"
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View
                style={
                  styles.loadingState
                }
              >
                <ActivityIndicator
                  size="large"
                  color={
                    colors.primary ||
                    "#4F46E5"
                  }
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Fetching available catalog...
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.scrollContent
                }
              >
                {filteredAvailableCourses.length >
                0 ? (
                  filteredAvailableCourses.map(
                    (
                      course,
                      index
                    ) => (
                      <View
                        key={
                          course.course_id ||
                          index
                        }
                        style={
                          styles.availableCard
                        }
                      >
                        <View
                          style={
                            styles.availableIconBox
                          }
                        >
                          <Icon
                            name="school"
                            size={22}
                            color="#0EA5E9"
                          />
                        </View>

                        <View
                          style={
                            styles.courseInfo
                          }
                        >
                          <Text
                            style={
                              styles.courseTitle
                            }
                          >
                            {
                              course.course_name
                            }
                          </Text>

                          <Text
                            style={
                              styles.availableSubtext
                            }
                          >
                            Course Content required
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={
                            styles.addBtn
                          }
                          activeOpacity={
                            0.8
                          }
                          disabled={
                            addingId ===
                            course.course_id
                          }
                          onPress={() =>
                            addCourse(
                              course
                            )
                          }
                        >
                          {addingId ===
                          course.course_id ? (
                            <ActivityIndicator
                              size="small"
                              color="#FFFFFF"
                            />
                          ) : (
                            <>
                              <Icon
                                name="add"
                                size={16}
                                color="#FFFFFF"
                              />

                              <Text
                                style={
                                  styles.addBtnText
                                }
                              >
                                Add
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )
                  )
                ) : (
                  <View
                    style={
                      styles.emptyCard
                    }
                  >
                    <View
                      style={
                        styles.emptyIconCircle
                      }
                    >
                      <Icon
                        name="search-off"
                        size={36}
                        color="#94A3B8"
                      />
                    </View>

                    <Text
                      style={
                        styles.emptyTitle
                      }
                    >
                      No Courses Found
                    </Text>

                    <Text
                      style={
                        styles.emptySubtitle
                      }
                    >
                      {searchQuery
                        ? `No subjects matching "${searchQuery}"`
                        : "There are no additional courses available at this time."}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* =====================================================
          UPLOAD CONTENT MODAL
      ===================================================== */}

      <Modal
        visible={
          showContentModal
        }
        animationType="slide"
        transparent={true}
        onRequestClose={
          closeContentModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalContainer
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalTitleArea
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Course Content
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Upload async lesson plan
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.modalCloseButton
                }
                disabled={
                  uploadingContent
                }
                onPress={
                  closeContentModal
                }
              >
                <Icon
                  name="close"
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.modalScrollContent
              }
            >
              <View
                style={
                  styles.selectedCourseBox
                }
              >
                <View
                  style={
                    styles.selectedCourseIcon
                  }
                >
                  <Icon
                    name="school"
                    size={22}
                    color={
                      colors.primary ||
                      "#4F46E5"
                    }
                  />
                </View>

                <View
                  style={
                    styles.selectedCourseInfo
                  }
                >
                  <Text
                    style={
                      styles.selectedCourseLabel
                    }
                  >
                    Selected Course
                  </Text>

                  <Text
                    style={
                      styles.selectedCourseName
                    }
                  >
                    {
                      selectedCourse?.course_name
                    }
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.requiredMessage
                }
              >
                <Icon
                  name="info-outline"
                  size={20}
                  color="#0284C7"
                />

                <Text
                  style={
                    styles.requiredMessageText
                  }
                >
                  Course Content / Async Lesson
                  Plan is required for this
                  course.
                </Text>
              </View>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Content Title *
              </Text>

              <TextInput
                style={
                  styles.textInput
                }
                placeholder="e.g. Mathematics Lesson Plan"
                placeholderTextColor="#94A3B8"
                value={
                  contentTitle
                }
                onChangeText={
                  setContentTitle
                }
              />

              <Text
                style={
                  styles.inputLabel
                }
              >
                Description
              </Text>

              <TextInput
                style={[
                  styles.textInput,
                  styles.descriptionInput,
                ]}
                placeholder="Enter a short description..."
                placeholderTextColor="#94A3B8"
                value={
                  contentDescription
                }
                onChangeText={
                  setContentDescription
                }
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text
                style={
                  styles.inputLabel
                }
              >
                Course Content File *
              </Text>

              <TouchableOpacity
                style={
                  styles.filePickerButton
                }
                activeOpacity={0.8}
                onPress={
                  pickCourseContent
                }
                disabled={
                  uploadingContent
                }
              >
                <View
                  style={
                    styles.fileIconBox
                  }
                >
                  <Icon
                    name="cloud-upload"
                    size={24}
                    color={
                      colors.primary ||
                      "#4F46E5"
                    }
                  />
                </View>

                <View
                  style={
                    styles.filePickerInfo
                  }
                >
                  <Text
                    style={
                      styles.filePickerTitle
                    }
                  >
                    {selectedFile
                      ? "File Selected"
                      : "Select Course Content"}
                  </Text>

                  <Text
                    style={
                      styles.filePickerSubtitle
                    }
                    numberOfLines={
                      2
                    }
                  >
                    {getFileName()}
                  </Text>
                </View>

                <Icon
                  name="attach-file"
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>

              <Text
                style={
                  styles.allowedFilesText
                }
              >
                Allowed: PDF, DOC, DOCX,
                JPG, JPEG, PNG
              </Text>

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  uploadingContent &&
                    styles.disabledButton,
                ]}
                activeOpacity={
                  0.85
                }
                disabled={
                  uploadingContent
                }
                onPress={
                  uploadCourseContent
                }
              >
                {uploadingContent ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.uploadButtonText
                      }
                    >
                      Uploading...
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon
                      name="cloud-upload"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.uploadButtonText
                      }
                    >
                      Upload Course Content
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                disabled={
                  uploadingContent
                }
                onPress={
                  closeContentModal
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          FETCHED COURSE CONTENT MODAL
      ===================================================== */}

      <Modal
        visible={
          showCourseContentModal
        }
        animationType="slide"
        transparent={true}
        onRequestClose={
          closeCourseContentModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.contentModalContainer
            }
          >
            {/* HEADER */}

            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalTitleArea
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Course Content
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedContentCourse?.course_name
                  }
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.modalCloseButton
                }
                onPress={
                  closeCourseContentModal
                }
              >
                <Icon
                  name="close"
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* BODY */}

            {loadingCourseContent ? (
              <View
                style={
                  styles.contentLoading
                }
              >
                <ActivityIndicator
                  size="large"
                  color={
                    colors.primary ||
                    "#4F46E5"
                  }
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Loading course content...
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.contentList
                }
              >
                {courseContent.length >
                0 ? (
                  <>
                    <View
                      style={
                        styles.contentCountBox
                      }
                    >
                      <Icon
                        name="library-books"
                        size={20}
                        color={
                          colors.primary ||
                          "#4F46E5"
                        }
                      />

                      <Text
                        style={
                          styles.contentCountText
                        }
                      >
                        {courseContent.length}{" "}
                        {courseContent.length ===
                        1
                          ? "content"
                          : "contents"}{" "}
                        uploaded
                      </Text>
                    </View>

                    {courseContent.map(
                      (
                        item,
                        index
                      ) => (
                        <View
                          key={
                            item.content_id ||
                            index
                          }
                          style={
                            styles.contentCard
                          }
                        >
                          {/* FILE ICON */}

                          <View
                            style={
                              styles.contentFileIcon
                            }
                          >
                            <Icon
                              name={getFileIcon(
                                item.file_name
                              )}
                              size={26}
                              color={
                                colors.primary ||
                                "#4F46E5"
                              }
                            />
                          </View>

                          {/* CONTENT INFO */}

                          <View
                            style={
                              styles.contentInfo
                            }
                          >
                            <Text
                              style={
                                styles.contentTitle
                              }
                            >
                              {
                                item.title
                              }
                            </Text>

                            {item.description ? (
                              <Text
                                style={
                                  styles.contentDescription
                                }
                              >
                                {
                                  item.description
                                }
                              </Text>
                            ) : null}

                            <View
                              style={
                                styles.fileNameRow
                              }
                            >
                              <Icon
                                name="attach-file"
                                size={14}
                                color="#64748B"
                              />

                              <Text
                                style={
                                  styles.contentFileName
                                }
                                numberOfLines={
                                  2
                                }
                              >
                                {
                                  item.file_name ||
                                  "Course content file"
                                }
                              </Text>
                            </View>

                            <View
                              style={
                                styles.dateRow
                              }
                            >
                              <Icon
                                name="calendar-today"
                                size={13}
                                color="#94A3B8"
                              />

                              <Text
                                style={
                                  styles.contentDate
                                }
                              >
                                Uploaded:{" "}
                                {formatDate(
                                  item.uploaded_date
                                )}
                              </Text>
                            </View>
                          </View>

                          {/* OPEN BUTTON */}

                          <TouchableOpacity
                            style={
                              styles.openFileButton
                            }
                            activeOpacity={
                              0.8
                            }
                            onPress={() =>
                              openCourseContentFile(
                                item
                              )
                            }
                          >
                            <Icon
                              name="open-in-new"
                              size={18}
                              color="#FFFFFF"
                            />

                            <Text
                              style={
                                styles.openFileText
                              }
                            >
                              Open
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )
                    )}
                  </>
                ) : (
                  <View
                    style={
                      styles.noContentBox
                    }
                  >
                    <View
                      style={
                        styles.noContentIcon
                      }
                    >
                      <Icon
                        name="folder-open"
                        size={40}
                        color="#94A3B8"
                      />
                    </View>

                    <Text
                      style={
                        styles.noContentTitle
                      }
                    >
                      No Course Content
                    </Text>

                    <Text
                      style={
                        styles.noContentText
                      }
                    >
                      No course content or async
                      lesson plan has been uploaded
                      for this course yet.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* CLOSE BUTTON */}

            <TouchableOpacity
              style={
                styles.contentCloseButton
              }
              onPress={
                closeCourseContentModal
              }
            >
              <Text
                style={
                  styles.contentCloseButtonText
                }
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}

      <View
        style={styles.bottomNav}
      >
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              "StudentHome"
            )
          }
        >
          <Icon
            name="calendar-today"
            size={22}
            color="#94A3B8"
          />

          <Text
            style={styles.navText}
          >
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <View
            style={
              styles.activeNavIndicator
            }
          >
            <Icon
              name="library-add"
              size={22}
              color={
                colors.primary ||
                "#4F46E5"
              }
            />

            <Text
              style={
                styles.navTextActive
              }
            >
              Add Courses
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              "StudentCourses"
            )
          }
        >
          <Icon
            name="menu-book"
            size={22}
            color="#94A3B8"
          />

          <Text
            style={styles.navText}
          >
            Courses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              "StudentAllClasses"
            )
          }
        >
          <Icon
            name="school"
            size={22}
            color="#94A3B8"
          />

          <Text
            style={styles.navText}
          >
            Classes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StudentAddCourses;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    height: 60,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoImage: {
    width: 26,
    height: 26,
    resizeMode: "contain",
    marginRight: 8,
  },

  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color:
      colors.primary || "#4F46E5",
    letterSpacing: -0.3,
  },

  // =====================================================
  // CONTENT
  // =====================================================

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  pageSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  // =====================================================
  // COURSE CARD
  // =====================================================

  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",

    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },

      android: {
        elevation: 2,
      },
    }),
  },

  courseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  courseInfo: {
    flex: 1,
  },

  courseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },

  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },

  activeTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },

  tapContentText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 5,
  },

  // =====================================================
  // CATALOG
  // =====================================================

  catalogContainer: {
    flex: 1,
  },

  catalogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },

  availableCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  availableIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  availableSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      colors.primary || "#4F46E5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    justifyContent: "center",
  },

  addBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 2,
  },

  // =====================================================
  // EMPTY
  // =====================================================

  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
  },

  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  // =====================================================
  // FLOATING BUTTON
  // =====================================================

  floatingBtn: {
    position: "absolute",
    right: 20,
    bottom: 80,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      colors.primary || "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,

    ...Platform.select({
      ios: {
        shadowColor:
          colors.primary || "#4F46E5",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },

      android: {
        elevation: 8,
      },
    }),
  },

  floatingBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 6,
  },

  // =====================================================
  // UPLOAD MODAL
  // =====================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingTop: 8,
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

  modalTitleArea: {
    flex: 1,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  selectedCourseBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },

  selectedCourseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  selectedCourseInfo: {
    flex: 1,
  },

  selectedCourseLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 3,
  },

  selectedCourseName: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "800",
  },

  requiredMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },

  requiredMessageText: {
    flex: 1,
    fontSize: 12,
    color: "#0369A1",
    marginLeft: 8,
    lineHeight: 18,
    fontWeight: "500",
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 7,
    marginTop: 4,
  },

  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },

  descriptionInput: {
    height: 100,
    paddingTop: 12,
  },

  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 12,
    minHeight: 70,
  },

  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  filePickerInfo: {
    flex: 1,
  },

  filePickerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },

  filePickerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },

  allowedFilesText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 7,
    marginBottom: 20,
  },

  uploadButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor:
      colors.primary || "#4F46E5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  cancelButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },

  // =====================================================
  // FETCH CONTENT MODAL
  // =====================================================

  contentModalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    minHeight: "55%",
  },

  contentLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },

  contentList: {
    padding: 20,
    paddingBottom: 100,
  },

  contentCountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 14,
  },

  contentCountText: {
    fontSize: 13,
    fontWeight: "700",
    color:
      colors.primary || "#4F46E5",
    marginLeft: 8,
  },

  // =====================================================
  // CONTENT CARD
  // =====================================================

  contentCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  contentFileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  contentInfo: {
    width: "100%",
  },

  contentTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  contentDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
    marginBottom: 9,
  },

  fileNameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 3,
  },

  contentFileName: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    marginLeft: 5,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  contentDate: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: 5,
  },

  openFileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.primary || "#4F46E5",
    borderRadius: 10,
    paddingVertical: 11,
    marginTop: 12,
  },

  openFileText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },

  // =====================================================
  // NO CONTENT
  // =====================================================

  noContentBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 55,
  },

  noContentIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  noContentTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },

  noContentText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 7,
  },

  contentCloseButton: {
    position: "absolute",
    bottom: 15,
    left: 20,
    right: 20,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  contentCloseButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475569",
  },

  // =====================================================
  // BOTTOM NAV
  // =====================================================

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 64,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  activeNavIndicator: {
    alignItems: "center",
  },

  navText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 3,
  },

  navTextActive: {
    fontSize: 11,
    color:
      colors.primary || "#4F46E5",
    fontWeight: "700",
    marginTop: 3,
  },
});

















































// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Alert,
//   TextInput,
//   StatusBar,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const StudentAddCourses = ({ navigation }) => {
//   const [myCourses, setMyCourses] = useState([]);
//   const [availableCourses, setAvailableCourses] = useState([]);
//   const [showCourses, setShowCourses] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [addingId, setAddingId] = useState(null);

//   useEffect(() => {
//     fetchMyCourses();
//   }, []);

//   // =====================================================
//   // API INTEGRATIONS (UNTOUCHED LOGIC)
//   // =====================================================

//   const fetchMyCourses = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Student/my-courses`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMyCourses(data);
//       } else {
//         console.log("My Courses Error:", data);
//       }
//     } catch (e) {
//       console.log("Fetch My Courses Error:", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAllCourses = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Student/all-courses`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setAvailableCourses(data);
//         setShowCourses(true);
//       } else {
//         console.log("All Courses Error:", data);
//       }
//     } catch (e) {
//       console.log("Fetch All Courses Error:", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addCourse = async (course) => {
//     setAddingId(course.course_id);
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Student/add-courses`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           courseIds: [course.course_id],
//         }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         Alert.alert("Success", "Course added successfully");

//         await fetchMyCourses();

//         setShowCourses(false);
//         setAvailableCourses([]);
//         setSearchQuery("");
//       } else {
//         Alert.alert("Error", data.message || "Unable to add course");
//       }
//     } catch (e) {
//       console.log("Add Course Error:", e);
//     } finally {
//       setAddingId(null);
//     }
//   };

//   // Filter available courses based on client search input
//   const filteredAvailableCourses = availableCourses.filter((course) =>
//     course.course_name?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.iconButton}
//           activeOpacity={0.7}
//           onPress={() => navigation.navigate("StudentDrawer")}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Icon name="menu" size={24} color="#1E293B" />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImage}
//           />
//           <Text style={styles.logoText}>House of Tutor</Text>
//         </View>

//         <View style={{ width: 40 }} />
//       </View>

//       {/* CONTENT AREA */}
//       <View style={styles.content}>
//         {!showCourses ? (
//           // =====================================================
//           // MY ENROLLED COURSES VIEW
//           // =====================================================
//           <>
//             <View style={styles.sectionHeader}>
//               <View>
//                 <Text style={styles.pageTitle}>My Courses</Text>
//                 <Text style={styles.pageSubtitle}>
//                   {myCourses.length}{" "}
//                   {myCourses.length === 1 ? "course" : "courses"} currently
//                   enrolled
//                 </Text>
//               </View>
//             </View>

//             {loading ? (
//               <View style={styles.loadingState}>
//                 <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
//                 <Text style={styles.loadingText}>Loading your courses...</Text>
//               </View>
//             ) : (
//               <ScrollView
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.scrollContent}
//               >
//                 {myCourses.length > 0 ? (
//                   myCourses.map((course, index) => (
//                     <View key={index} style={styles.courseCard}>
//                       <View style={styles.courseIconBox}>
//                         <Icon name="class" size={22} color={colors.primary || "#4F46E5"} />
//                       </View>
//                       <View style={styles.courseInfo}>
//                         <Text style={styles.courseTitle}>
//                           {course.course_name}
//                         </Text>
//                         <View style={styles.activeTag}>
//                           <View style={styles.activeDot} />
//                           <Text style={styles.activeTagText}>Enrolled</Text>
//                         </View>
//                       </View>
//                       <Icon name="chevron-right" size={20} color="#94A3B8" />
//                     </View>
//                   ))
//                 ) : (
//                   <View style={styles.emptyCard}>
//                     <View style={styles.emptyIconCircle}>
//                       <Icon name="menu-book" size={36} color="#94A3B8" />
//                     </View>
//                     <Text style={styles.emptyTitle}>No Courses Added Yet</Text>
//                     <Text style={styles.emptySubtitle}>
//                       Tap the button below to browse available catalog courses and start learning.
//                     </Text>
//                   </View>
//                 )}
//               </ScrollView>
//             )}

//             {/* FLOATING ACTION BUTTON */}
//             <TouchableOpacity
//               style={styles.floatingBtn}
//               activeOpacity={0.85}
//               onPress={fetchAllCourses}
//             >
//               <Icon name="add" size={28} color="#FFFFFF" />
//               <Text style={styles.floatingBtnText}>Add Course</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           // =====================================================
//           // AVAILABLE CATALOG COURSES VIEW
//           // =====================================================
//           <View style={styles.catalogContainer}>
//             <View style={styles.catalogHeader}>
//               <View>
//                 <Text style={styles.pageTitle}>Course Catalog</Text>
//                 <Text style={styles.pageSubtitle}>
//                   Select a course to add to your study plan
//                 </Text>
//               </View>

//               <TouchableOpacity
//                 style={styles.closeButton}
//                 activeOpacity={0.7}
//                 onPress={() => {
//                   setShowCourses(false);
//                   setSearchQuery("");
//                 }}
//               >
//                 <Icon name="close" size={20} color="#64748B" />
//               </TouchableOpacity>
//             </View>

//             {/* SEARCH INPUT */}
//             <View style={styles.searchBox}>
//               <Icon name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search courses..."
//                 placeholderTextColor="#94A3B8"
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//               />
//               {searchQuery.length > 0 && (
//                 <TouchableOpacity onPress={() => setSearchQuery("")}>
//                   <Icon name="cancel" size={18} color="#94A3B8" />
//                 </TouchableOpacity>
//               )}
//             </View>

//             {loading ? (
//               <View style={styles.loadingState}>
//                 <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
//                 <Text style={styles.loadingText}>Fetching available catalog...</Text>
//               </View>
//             ) : (
//               <ScrollView
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.scrollContent}
//               >
//                 {filteredAvailableCourses.length > 0 ? (
//                   filteredAvailableCourses.map((course, index) => (
//                     <View key={index} style={styles.availableCard}>
//                       <View style={styles.availableIconBox}>
//                         <Icon name="school" size={22} color="#0EA5E9" />
//                       </View>

//                       <View style={styles.courseInfo}>
//                         <Text style={styles.courseTitle}>
//                           {course.course_name}
//                         </Text>
//                         <Text style={styles.availableSubtext}>
//                           Available for enrollment
//                         </Text>
//                       </View>

//                       <TouchableOpacity
//                         style={styles.addBtn}
//                         activeOpacity={0.8}
//                         disabled={addingId === course.course_id}
//                         onPress={() => addCourse(course)}
//                       >
//                         {addingId === course.course_id ? (
//                           <ActivityIndicator size="small" color="#FFFFFF" />
//                         ) : (
//                           <>
//                             <Icon name="add" size={16} color="#FFFFFF" />
//                             <Text style={styles.addBtnText}>Add</Text>
//                           </>
//                         )}
//                       </TouchableOpacity>
//                     </View>
//                   ))
//                 ) : (
//                   <View style={styles.emptyCard}>
//                     <View style={styles.emptyIconCircle}>
//                       <Icon name="search-off" size={36} color="#94A3B8" />
//                     </View>
//                     <Text style={styles.emptyTitle}>No Courses Found</Text>
//                     <Text style={styles.emptySubtitle}>
//                       {searchQuery
//                         ? `No subjects matching "${searchQuery}"`
//                         : "There are no additional courses available at this time."}
//                     </Text>
//                   </View>
//                 )}
//               </ScrollView>
//             )}
//           </View>
//         )}
//       </View>

//       {/* BOTTOM NAVIGATION */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity
//           style={styles.navItem}
//           activeOpacity={0.7}
//           onPress={() => navigation.navigate("StudentHome")}
//         >
//           <Icon name="calendar-today" size={22} color="#94A3B8" />
//           <Text style={styles.navText}>Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
//           <View style={styles.activeNavIndicator}>
//             <Icon
//               name="library-add"
//               size={22}
//               color={colors.primary || "#4F46E5"}
//             />
//             <Text style={styles.navTextActive}>Add Courses</Text>
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           activeOpacity={0.7}
//           onPress={() => navigation.navigate("StudentCourses")}
//         >
//           <Icon name="menu-book" size={22} color="#94A3B8" />
//           <Text style={styles.navText}>Courses</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           activeOpacity={0.7}
//           onPress={() => navigation.navigate("StudentAllClasses")}
//         >
//           <Icon name="school" size={22} color="#94A3B8" />
//           <Text style={styles.navText}>Classes</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default StudentAddCourses;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },

//   // =====================================================
//   // HEADER STYLES
//   // =====================================================

//   header: {
//     height: 60,
//     backgroundColor: "#FFFFFF",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F5F9",
//   },

//   iconButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 10,
//     backgroundColor: "#F8FAFC",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   headerCenter: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   logoImage: {
//     width: 26,
//     height: 26,
//     resizeMode: "contain",
//     marginRight: 8,
//   },

//   logoText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: colors.primary || "#4F46E5",
//     letterSpacing: -0.3,
//   },

//   // =====================================================
//   // CONTENT AREA
//   // =====================================================

//   content: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },

//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },

//   pageTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#0F172A",
//     letterSpacing: -0.5,
//   },

//   pageSubtitle: {
//     fontSize: 13,
//     color: "#64748B",
//     marginTop: 2,
//   },

//   scrollContent: {
//     paddingBottom: 100,
//   },

//   loadingState: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 60,
//   },

//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: "#64748B",
//     fontWeight: "500",
//   },

//   // =====================================================
//   // COURSE CARDS (MY COURSES)
//   // =====================================================

//   courseCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     ...Platform.select({
//       ios: {
//         shadowColor: "#0F172A",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.04,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },

//   courseIconBox: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: "#EEF2FF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 14,
//   },

//   courseInfo: {
//     flex: 1,
//   },

//   courseTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#1E293B",
//   },

//   activeTag: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 4,
//   },

//   activeDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: "#10B981",
//     marginRight: 6,
//   },

//   activeTagText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#10B981",
//   },

//   // =====================================================
//   // CATALOG COURSES VIEW
//   // =====================================================

//   catalogContainer: {
//     flex: 1,
//   },

//   catalogHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },

//   closeButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#E2E8F0",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   searchBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     height: 44,
//     marginBottom: 16,
//   },

//   searchIcon: {
//     marginRight: 8,
//   },

//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: "#0F172A",
//   },

//   availableCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//   },

//   availableIconBox: {
//     width: 42,
//     height: 42,
//     borderRadius: 12,
//     backgroundColor: "#F0F9FF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },

//   availableSubtext: {
//     fontSize: 12,
//     color: "#64748B",
//     marginTop: 2,
//   },

//   addBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: colors.primary || "#4F46E5",
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 8,
//     minWidth: 70,
//     justifyContent: "center",
//   },

//   addBtnText: {
//     color: "#FFFFFF",
//     fontSize: 13,
//     fontWeight: "700",
//     marginLeft: 2,
//   },

//   // =====================================================
//   // EMPTY STATES & FLOATING BUTTON
//   // =====================================================

//   emptyCard: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 48,
//     paddingHorizontal: 24,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     marginTop: 10,
//   },

//   emptyIconCircle: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "#F1F5F9",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 14,
//   },

//   emptyTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#1E293B",
//   },

//   emptySubtitle: {
//     fontSize: 13,
//     color: "#64748B",
//     textAlign: "center",
//     marginTop: 6,
//     lineHeight: 18,
//   },

//   floatingBtn: {
//     position: "absolute",
//     right: 20,
//     bottom: 80,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: colors.primary || "#4F46E5",
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderRadius: 30,
//     ...Platform.select({
//       ios: {
//         shadowColor: colors.primary || "#4F46E5",
//         shadowOffset: { width: 0, height: 6 },
//         shadowOpacity: 0.35,
//         shadowRadius: 10,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },

//   floatingBtnText: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//     fontSize: 14,
//     marginLeft: 6,
//   },

//   // =====================================================
//   // BOTTOM NAVIGATION
//   // =====================================================

//   bottomNav: {
//     flexDirection: "row",
//     justifycontent: "space-around",
//     alignItems: "center",
//     height: 64,
//     backgroundColor: "#FFFFFF",
//     borderTopWidth: 1,
//     borderTopColor: "#F1F5F9",
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//   },

//   navItem: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   activeNavIndicator: {
//     alignItems: "center",
//   },

//   navText: {
//     fontSize: 11,
//     color: "#94A3B8",
//     fontWeight: "500",
//     marginTop: 3,
//   },

//   navTextActive: {
//     fontSize: 11,
//     color: colors.primary || "#4F46E5",
//     fontWeight: "700",
//     marginTop: 3,
//   },
// });
