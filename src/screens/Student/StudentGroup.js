import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../config/api';
import colors from '../utils/colors';

const MAX_STUDENTS = 10;

// Change this path only if your logo is stored elsewhere.
const APP_LOGO = require('../../assets/images/logo.png');

const StudentGroup = () => {
  const navigation = useNavigation();

  // Main screen
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Create group
  const [groupName, setGroupName] = useState('');
  const [tutors, setTutors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tutorId, setTutorId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [tutorDropdownOpen, setTutorDropdownOpen] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

  const [loadingTutors, setLoadingTutors] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Classmate management
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [groupInfo, setGroupInfo] = useState({
    totalMembers: 0,
    maxStudents: MAX_STUDENTS,
    remainingSlots: MAX_STUDENTS - 1,
  });

  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [addingStudentId, setAddingStudentId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ------------------------------------------------------
  // API HELPER
  // BASE_URL should end with /api
  // Example: http://192.168.1.5:5000/api
  // ------------------------------------------------------
  const apiRequest = useCallback(async (endpoint, method = 'GET', body = null) => {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Your session has expired. Please log in again.');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...(body !== null ? { body: JSON.stringify(body) } : {}),
    });

    const responseText = await response.text();
    let data = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.Message ||
          data.title ||
          `Request failed with status ${response.status}`,
      );
    }

    return data;
  }, []);

  // ------------------------------------------------------
  // RESPONSE HELPERS: camelCase and PascalCase
  // ------------------------------------------------------
  const getGroupId = item => item?.studyGroupId ?? item?.StudyGroupId;
  const getGroupName = item => item?.groupName ?? item?.GroupName ?? 'Study Group';
  const getTutorId = item => item?.tutorId ?? item?.TutorId;
  const getTutorName = item => item?.tutorName ?? item?.TutorName ?? 'Tutor';
  const getCourseId = item => item?.courseId ?? item?.CourseId;
  const getCourseTitle = item => item?.courseTitle ?? item?.CourseTitle ?? 'Course';

  const getMemberCount = item =>
    Number(item?.totalMembers ?? item?.TotalMembers ?? 0);

  const getMaxStudents = item =>
    Math.min(
      Number(item?.maxStudents ?? item?.MaxStudents ?? MAX_STUDENTS),
      MAX_STUDENTS,
    );

  const getStatus = item => item?.status ?? item?.Status ?? 'Open';
  const getStudentId = item => item?.studentId ?? item?.StudentId;
  const getStudentName = item => item?.fullName ?? item?.FullName ?? 'Student';

  const getIsCreator = item =>
    (item?.isCreator ?? item?.IsCreator) === true;

  const getRemainingSlots = (total, max) => Math.max(0, max - total);

  const getApiList = (data, lowerKey, upperKey) => {
    if (Array.isArray(data?.[lowerKey])) return data[lowerKey];
    if (Array.isArray(data?.[upperKey])) return data[upperKey];
    return [];
  };

  // ------------------------------------------------------
  // LOAD MY STUDY GROUPS
  // GET /Student/my-study-groups
  // ------------------------------------------------------
  const loadMyGroups = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const data = await apiRequest('/Student/my-study-groups');
      const list = Array.isArray(data) ? data : [];

      setGroups(list);

      setSelectedGroup(previous => {
        if (!previous) return previous;

        const updated = list.find(
          item => Number(getGroupId(item)) === Number(getGroupId(previous)),
        );

        return updated ? { ...previous, ...updated } : previous;
      });

      return list;
    } catch (error) {
      Alert.alert(
        'Unable to Load Groups',
        error.message || 'Unable to load your study groups.',
      );
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiRequest]);

  // ------------------------------------------------------
  // LOAD APPROVED NON-VISITING TUTORS
  // GET /Student/non-visiting-group-tutors
  // ------------------------------------------------------
  const loadTutors = useCallback(async (showError = true) => {
    try {
      setLoadingTutors(true);

      const data = await apiRequest('/Student/non-visiting-group-tutors');
      const tutorList = getApiList(data, 'tutors', 'Tutors');

      setTutors(tutorList);

      // If the selected tutor is no longer available, clear selections.
      setTutorId(previous => {
        const exists = tutorList.some(
          item => String(getTutorId(item)) === String(previous),
        );

        if (previous && !exists) {
          setCourseId('');
          setCourses([]);
          return '';
        }

        return previous;
      });

      return tutorList;
    } catch (error) {
      setTutors([]);

      if (showError) {
        Alert.alert(
          'Unable to Load Tutors',
          error.message || 'Could not load your Non-Visiting tutors.',
        );
      }

      return [];
    } finally {
      setLoadingTutors(false);
    }
  }, [apiRequest]);

  // ------------------------------------------------------
  // LOAD COURSES FOR SELECTED TUTOR
  // GET /Student/non-visiting-group-tutor-courses?tutorId=1
  // ------------------------------------------------------
  const loadCourses = useCallback(async selectedTutorId => {
    if (!selectedTutorId) {
      setCourses([]);
      setCourseId('');
      return [];
    }

    try {
      setLoadingCourses(true);
      setCourses([]);
      setCourseId('');

      const data = await apiRequest(
        `/Student/non-visiting-group-tutor-courses?tutorId=${encodeURIComponent(
          selectedTutorId,
        )}`,
      );

      const courseList = getApiList(data, 'courses', 'Courses');
      setCourses(courseList);

      return courseList;
    } catch (error) {
      setCourses([]);
      setCourseId('');

      Alert.alert(
        'Unable to Load Courses',
        error.message || 'Could not load courses for this tutor.',
      );

      return [];
    } finally {
      setLoadingCourses(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadMyGroups();
    loadTutors(false);
  }, [loadMyGroups, loadTutors]);

  // ------------------------------------------------------
  // LOAD ELIGIBLE CLASSMATES
  // GET /Student/eligible-group-students
  // ------------------------------------------------------
  const loadEligibleStudents = useCallback(async group => {
    if (!group) return;

    const id = getGroupId(group);
    const tutor = getTutorId(group);
    const course = getCourseId(group);

    if (!id || !tutor || !course) {
      Alert.alert('Error', 'Study group, tutor, or course ID is missing.');
      return;
    }

    try {
      setLoadingStudents(true);

      const query =
        `?tutorId=${encodeURIComponent(tutor)}` +
        `&courseId=${encodeURIComponent(course)}` +
        `&studyGroupId=${encodeURIComponent(id)}`;

      const data = await apiRequest(
        `/Student/eligible-group-students${query}`,
      );

      const students = getApiList(data, 'students', 'Students');

      const total = Number(
        data.totalMembers ?? data.TotalMembers ?? getMemberCount(group),
      );

      const max = Math.min(
        Number(data.maxStudents ?? data.MaxStudents ?? getMaxStudents(group)),
        MAX_STUDENTS,
      );

      const remaining = Math.max(
        0,
        Number(data.remainingSlots ?? data.RemainingSlots ?? max - total),
      );

      const status = data.status ?? data.Status ?? getStatus(group);

      setEligibleStudents(students);

      setGroupInfo({
        totalMembers: total,
        maxStudents: max,
        remainingSlots: remaining,
      });

      const updatedGroup = {
        ...group,
        totalMembers: total,
        maxStudents: max,
        remainingSlots: remaining,
        status,
      };

      setSelectedGroup(previous => {
        if (
          previous &&
          Number(getGroupId(previous)) === Number(id)
        ) {
          return { ...previous, ...updatedGroup };
        }

        return previous;
      });

      setGroups(previous =>
        previous.map(item =>
          Number(getGroupId(item)) === Number(id)
            ? { ...item, ...updatedGroup }
            : item,
        ),
      );
    } catch (error) {
      Alert.alert(
        'Unable to Load Classmates',
        error.message || 'Unable to load eligible classmates.',
      );
    } finally {
      setLoadingStudents(false);
    }
  }, [apiRequest]);

  // ------------------------------------------------------
  // CREATE STUDY GROUP
  // POST /Student/create-study-group
  // ------------------------------------------------------
  const handleCreateGroup = async () => {
    const cleanName = groupName.trim();
    const parsedTutorId = Number(tutorId);
    const parsedCourseId = Number(courseId);

    if (!cleanName) {
      Alert.alert('Required', 'Please enter a group name.');
      return;
    }

    if (cleanName.length > 100) {
      Alert.alert('Group Name Too Long', 'Group name cannot exceed 100 characters.');
      return;
    }

    if (!parsedTutorId || !parsedCourseId) {
      Alert.alert('Required', 'Please select a tutor and a course.');
      return;
    }

    const selectedTutor = tutors.find(
      item => Number(getTutorId(item)) === parsedTutorId,
    );

    const selectedCourse = courses.find(
      item => Number(getCourseId(item)) === parsedCourseId,
    );

    if (!selectedTutor || !selectedCourse) {
      Alert.alert(
        'Invalid Selection',
        'Please select a valid tutor and course from the dropdowns.',
      );
      return;
    }

    try {
      setCreatingGroup(true);

      const data = await apiRequest(
        '/Student/create-study-group',
        'POST',
        {
          groupName: cleanName,
          tutorId: parsedTutorId,
          courseId: parsedCourseId,
        },
      );

      const newGroupId = data.studyGroupId ?? data.StudyGroupId;

      if (!newGroupId) {
        setGroupName('');
        setActiveTab('groups');
        await loadMyGroups(false);

        Alert.alert(
          'Group Created',
          data.message || data.Message ||
            'The group was created, but its ID was not returned.',
        );
        return;
      }

      const createdGroup = {
        studyGroupId: newGroupId,
        groupName: data.groupName ?? data.GroupName ?? cleanName,
        tutorId: data.tutorId ?? data.TutorId ?? parsedTutorId,
        tutorName: getTutorName(selectedTutor),
        courseId: data.courseId ?? data.CourseId ?? parsedCourseId,
        courseTitle: getCourseTitle(selectedCourse),
        totalMembers: Number(data.totalMembers ?? data.TotalMembers ?? 1),
        maxStudents: Math.min(
          Number(data.maxStudents ?? data.MaxStudents ?? MAX_STUDENTS),
          MAX_STUDENTS,
        ),
        remainingSlots: Number(
          data.remainingSlots ?? data.RemainingSlots ?? MAX_STUDENTS - 1,
        ),
        status: data.status ?? data.Status ?? 'Open',
        isCreator: true,
      };

      setGroupName('');
      setSelectedGroup(createdGroup);
      setGroupInfo({
        totalMembers: createdGroup.totalMembers,
        maxStudents: createdGroup.maxStudents,
        remainingSlots: createdGroup.remainingSlots,
      });
      setEligibleStudents([]);
      setActiveTab('manage');

      await loadMyGroups(false);
      await loadEligibleStudents(createdGroup);

      Alert.alert(
        'Success',
        data.message || data.Message || 'Study group created successfully.',
      );
    } catch (error) {
      Alert.alert(
        'Unable to Create Group',
        error.message || 'Something went wrong while creating the group.',
      );
    } finally {
      setCreatingGroup(false);
    }
  };

  // ------------------------------------------------------
  // ADD CLASSMATE
  // POST /Student/add-study-group-member
  // ------------------------------------------------------
  const handleAddStudent = student => {
    if (!selectedGroup) return;

    if (
      groupInfo.totalMembers >= groupInfo.maxStudents ||
      getStatus(selectedGroup) !== 'Open'
    ) {
      Alert.alert('Group Full', 'This group is not accepting new members.');
      return;
    }

    const studentId = getStudentId(student);

    if (!studentId) {
      Alert.alert('Error', 'Student ID was not found.');
      return;
    }

    Alert.alert(
      'Add Student',
      `Do you want to add ${getStudentName(student)} to this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            try {
              setAddingStudentId(studentId);

              const data = await apiRequest(
                '/Student/add-study-group-member',
                'POST',
                {
                  studyGroupId: Number(getGroupId(selectedGroup)),
                  studentId: Number(studentId),
                },
              );

              const total = Number(
                data.totalMembers ??
                  data.TotalMembers ??
                  groupInfo.totalMembers + 1,
              );

              const max = Math.min(
                Number(
                  data.maxStudents ??
                    data.MaxStudents ??
                    groupInfo.maxStudents,
                ),
                MAX_STUDENTS,
              );

              const status =
                data.status ?? data.Status ?? (total >= max ? 'Full' : 'Open');

              const updatedGroup = {
                ...selectedGroup,
                totalMembers: total,
                maxStudents: max,
                remainingSlots: Math.max(0, max - total),
                status,
              };

              setGroupInfo({
                totalMembers: total,
                maxStudents: max,
                remainingSlots: Math.max(0, max - total),
              });

              setSelectedGroup(updatedGroup);

              setGroups(previous =>
                previous.map(item =>
                  Number(getGroupId(item)) === Number(getGroupId(updatedGroup))
                    ? { ...item, ...updatedGroup }
                    : item,
                ),
              );

              await loadEligibleStudents(updatedGroup);

              Alert.alert(
                'Success',
                data.message || data.Message || 'Student added successfully.',
              );
            } catch (error) {
              Alert.alert(
                'Unable to Add Student',
                error.message || 'Could not add this student.',
              );
            } finally {
              setAddingStudentId(null);
            }
          },
        },
      ],
    );
  };

  // ------------------------------------------------------
  // OPEN GROUP MANAGEMENT
  // Only the creator can manage classmates.
  // ------------------------------------------------------
  const openGroup = async group => {
    if (!getIsCreator(group)) {
      Alert.alert(
        'Group Member',
        'Only the group creator can manage classmates.',
      );
      return;
    }

    setSelectedGroup(group);

    const count = getMemberCount(group);
    const max = getMaxStudents(group);

    setGroupInfo({
      totalMembers: count,
      maxStudents: max,
      remainingSlots: getRemainingSlots(count, max),
    });

    setEligibleStudents([]);
    setActiveTab('manage');

    await loadEligibleStudents(group);
  };

  // ------------------------------------------------------
  // REFRESH CURRENT TAB
  // ------------------------------------------------------
  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await loadMyGroups(false);

      if (activeTab === 'create') {
        await loadTutors(false);

        if (tutorId) {
          await loadCourses(tutorId);
        }
      }

      if (activeTab === 'manage' && selectedGroup) {
        await loadEligibleStudents(selectedGroup);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // ------------------------------------------------------
  // REUSABLE DROPDOWN
  // ------------------------------------------------------
  const renderDropdown = ({
    label,
    placeholder,
    value,
    options,
    optionId,
    optionLabel,
    isOpen,
    setIsOpen,
    onSelect,
    loadingOptions = false,
    disabled = false,
    emptyMessage = 'No options available.',
  }) => {
    const selectedOption = options.find(
      option => String(optionId(option)) === String(value),
    );

    return (
      <View style={styles.dropdownWrapper}>
        <Text style={styles.inputLabel}>{label} *</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.dropdownButton,
            disabled && styles.dropdownDisabled,
          ]}
          disabled={disabled || loadingOptions}
          onPress={() => {
            const nextOpen = !isOpen;

            setTutorDropdownOpen(false);
            setCourseDropdownOpen(false);

            setIsOpen(nextOpen);
          }}
        >
          <MaterialIcons
            name="arrow-drop-down-circle"
            size={21}
            color={disabled ? colors.muted : colors.primary}
          />

          <Text
            numberOfLines={1}
            style={[
              styles.dropdownValue,
              !selectedOption && styles.dropdownPlaceholder,
            ]}
          >
            {loadingOptions
              ? 'Loading...'
              : selectedOption
                ? optionLabel(selectedOption)
                : placeholder}
          </Text>

          {loadingOptions ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialIcons
              name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={23}
              color={colors.muted}
            />
          )}
        </TouchableOpacity>

        {isOpen && !disabled && (
          <View style={styles.dropdownOptions}>
            {options.length === 0 ? (
              <Text style={styles.dropdownEmptyText}>{emptyMessage}</Text>
            ) : (
              options.map((option, index) => {
                const optionValue = String(optionId(option));
                const isSelected = optionValue === String(value);

                return (
                  <TouchableOpacity
                    key={`${optionValue}-${index}`}
                    style={[
                      styles.dropdownOption,
                      isSelected && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => {
                      setIsOpen(false);
                      onSelect(option);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        isSelected && styles.dropdownOptionSelectedText,
                      ]}
                    >
                      {optionLabel(option)}
                    </Text>

                    {isSelected && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </View>
    );
  };

  // ------------------------------------------------------
  // HEADER
  // Back arrow on the left, logo and app name centered.
  // ------------------------------------------------------
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.75}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Go back"
      >
        <MaterialIcons name="arrow-back" size={25} />
      </TouchableOpacity>

      <View style={styles.headerBrand}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />

        <Text style={styles.headerBrandText} numberOfLines={1}>
          House of Tutor
        </Text>
      </View>

      {/* Balances the back arrow so the brand stays centered. */}
      <View style={styles.headerRightSpace} />
    </View>
  );

  // ------------------------------------------------------
  // TABS
  // ------------------------------------------------------
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
        onPress={() => {
          setActiveTab('groups');
          setSelectedGroup(null);
          setTutorDropdownOpen(false);
          setCourseDropdownOpen(false);
        }}
      >
        <MaterialIcons
          name="groups"
          size={19}
          color={activeTab === 'groups' ? colors.white : colors.primary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'groups' && styles.activeTabText,
          ]}
        >
          My Groups
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'create' && styles.activeTab]}
        onPress={() => {
          setActiveTab('create');
          setTutorDropdownOpen(false);
          setCourseDropdownOpen(false);
          loadTutors(false);
        }}
      >
        <MaterialIcons
          name="add-circle-outline"
          size={19}
          color={activeTab === 'create' ? colors.white : colors.primary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'create' && styles.activeTabText,
          ]}
        >
          Create Group
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ------------------------------------------------------
  // GROUP CARD
  // ------------------------------------------------------
  const renderGroup = ({ item }) => {
    const count = getMemberCount(item);
    const max = getMaxStudents(item);
    const status = getStatus(item);
    const isCreator = getIsCreator(item);

    return (
      <View style={styles.groupCard}>
        <View style={styles.groupCardTop}>
          <View style={styles.groupIcon}>
            <MaterialIcons name="groups" size={27} color={colors.primary} />
          </View>

          <View style={styles.groupTitleContainer}>
            <Text style={styles.groupName}>{getGroupName(item)}</Text>
            <Text style={styles.groupSmallText}>
              Tutor: {getTutorName(item)}
            </Text>
            <Text style={styles.groupSmallText}>
              Course: {getCourseTitle(item)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              status === 'Full' && styles.fullBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                status === 'Full' && styles.fullStatusText,
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.memberProgressContainer}>
          <View style={styles.memberProgressHeader}>
            <Text style={styles.memberCount}>
              {count}/{max} Members
            </Text>
            <Text style={styles.slotsText}>
              {getRemainingSlots(count, max)} slots left
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (count / max) * 100)}%` },
              ]}
            />
          </View>
        </View>

        {isCreator ? (
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => openGroup(item)}
          >
            <Text style={styles.manageButtonText}>Manage Classmates</Text>
            <MaterialIcons
              name="arrow-forward"
              size={19}
              color={colors.white}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.memberOnlyNotice}>
            <MaterialIcons
              name="check-circle"
              size={18}
              color={colors.success}
            />
            <Text style={styles.memberOnlyText}>You are a group member</Text>
          </View>
        )}
      </View>
    );
  };

  // ------------------------------------------------------
  // MY GROUPS SCREEN
  // ------------------------------------------------------
  const renderMyGroups = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <View style={styles.flexOne}>
          <Text style={styles.sectionTitle}>My Study Groups</Text>
          <Text style={styles.sectionSubtitle}>
            View your Non-Visiting tutor study groups.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addIconButton}
          onPress={() => {
            setActiveTab('create');
            loadTutors(false);
          }}
        >
          <MaterialIcons name="add" size={25} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item, index) =>
            String(getGroupId(item) ?? index)
          }
          renderItem={renderGroup}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="groups"
                size={65}
                color={colors.iconMuted || colors.muted}
              />
              <Text style={styles.emptyTitle}>No Groups Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first study group with a Non-Visiting tutor.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setActiveTab('create');
                  loadTutors(false);
                }}
              >
                <MaterialIcons name="add" size={21} color={colors.white} />
                <Text style={styles.primaryButtonText}>
                  Create Study Group
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );

  // ------------------------------------------------------
  // CREATE GROUP FORM
  // ------------------------------------------------------
  const renderCreateGroup = () => (
    <ScrollView
      style={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      <Text style={styles.sectionTitle}>Create Study Group</Text>
      <Text style={styles.sectionSubtitle}>
        Choose a Non-Visiting tutor and a course you study with that tutor.
      </Text>

      <View style={styles.infoCard}>
        <MaterialIcons
          name="info-outline"
          size={23}
          color={colors.primary}
        />
        <Text style={styles.infoText}>
          Only your approved Non-Visiting tutors and courses with accepted
          requests are available. You will automatically be the first member.
          Each group can contain up to 10 active students.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Group Name *</Text>

        <View style={styles.inputContainer}>
          <MaterialIcons name="groups" size={21} color={colors.muted} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Programming Study Group"
            placeholderTextColor={colors.placeholder || colors.muted}
            value={groupName}
            onChangeText={setGroupName}
            maxLength={100}
          />
        </View>

        {renderDropdown({
          label: 'Non-Visiting Tutor',
          placeholder: 'Select your tutor',
          value: tutorId,
          options: tutors,
          optionId: getTutorId,
          optionLabel: getTutorName,
          isOpen: tutorDropdownOpen,
          setIsOpen: setTutorDropdownOpen,
          loadingOptions: loadingTutors,
          emptyMessage: 'No eligible Non-Visiting tutors found.',
          onSelect: item => {
            const selectedId = String(getTutorId(item));

            setTutorId(selectedId);
            setCourseId('');
            setCourses([]);
            setTutorDropdownOpen(false);
            setCourseDropdownOpen(false);

            loadCourses(selectedId);
          },
        })}

        {renderDropdown({
          label: 'Course',
          placeholder: tutorId ? 'Select a course' : 'Select a tutor first',
          value: courseId,
          options: courses,
          optionId: getCourseId,
          optionLabel: getCourseTitle,
          isOpen: courseDropdownOpen,
          setIsOpen: setCourseDropdownOpen,
          loadingOptions: loadingCourses,
          disabled: !tutorId || loadingCourses,
          emptyMessage: tutorId
            ? 'No eligible courses found for this tutor.'
            : 'Select a tutor first.',
          onSelect: item => {
            setCourseId(String(getCourseId(item)));
            setCourseDropdownOpen(false);
          },
        })}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            (creatingGroup || loadingTutors || loadingCourses) &&
              styles.disabledButton,
          ]}
          onPress={handleCreateGroup}
          disabled={creatingGroup || loadingTutors || loadingCourses}
        >
          {creatingGroup ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <MaterialIcons
                name="add-circle-outline"
                size={21}
                color={colors.white}
              />
              <Text style={styles.primaryButtonText}>
                Create Study Group
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ------------------------------------------------------
  // ELIGIBLE CLASSMATE CARD
  // ------------------------------------------------------
  const renderEligibleStudent = ({ item }) => {
    const studentId = getStudentId(item);
    const isAdding = String(addingStudentId) === String(studentId);

    const canAdd =
      selectedGroup &&
      getStatus(selectedGroup) === 'Open' &&
      groupInfo.totalMembers < groupInfo.maxStudents;

    return (
      <View style={styles.studentCard}>
        <View style={styles.studentAvatar}>
          <MaterialIcons name="person" size={27} color={colors.primary} />
        </View>

        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{getStudentName(item)}</Text>
          <Text style={styles.studentId}>Student ID: {studentId}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addStudentButton,
            (!canAdd || isAdding) && styles.disabledButton,
          ]}
          disabled={!canAdd || isAdding}
          onPress={() => handleAddStudent(item)}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <MaterialIcons
                name="person-add"
                size={17}
                color={colors.white}
              />
              <Text style={styles.addStudentButtonText}>Add</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // ------------------------------------------------------
  // GROUP MANAGEMENT SCREEN
  // ------------------------------------------------------
  const renderManageGroup = () => {
    if (!selectedGroup) {
      return (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backToGroups}
            onPress={() => setActiveTab('groups')}
          >
            <MaterialIcons
              name="arrow-back"
              size={21}
              color={colors.primary}
            />
            <Text style={styles.backToGroupsText}>Back to My Groups</Text>
          </TouchableOpacity>

          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Select a Study Group</Text>
            <Text style={styles.emptySubtitle}>
              Open a group from My Groups to manage classmates.
            </Text>
          </View>
        </View>
      );
    }

    // Prevent non-creators from managing classmates.
    if (!getIsCreator(selectedGroup)) {
      return (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backToGroups}
            onPress={() => {
              setSelectedGroup(null);
              setActiveTab('groups');
            }}
          >
            <MaterialIcons
              name="arrow-back"
              size={21}
              color={colors.primary}
            />
            <Text style={styles.backToGroupsText}>Back to My Groups</Text>
          </TouchableOpacity>

          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="lock-outline"
              size={55}
              color={colors.muted}
            />
            <Text style={styles.emptyTitle}>Group Member</Text>
            <Text style={styles.emptySubtitle}>
              Only the group creator can manage classmates.
            </Text>
          </View>
        </View>
      );
    }

    const groupStatus = getStatus(selectedGroup);
    const isFull =
      groupStatus !== 'Open' ||
      groupInfo.totalMembers >= groupInfo.maxStudents;

    return (
      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <TouchableOpacity
          style={styles.backToGroups}
          onPress={() => {
            setSelectedGroup(null);
            setActiveTab('groups');
          }}
        >
          <MaterialIcons
            name="arrow-back"
            size={21}
            color={colors.primary}
          />
          <Text style={styles.backToGroupsText}>Back to My Groups</Text>
        </TouchableOpacity>

        <View style={styles.manageHeaderCard}>
          <View style={styles.manageHeaderIcon}>
            <MaterialIcons name="groups" size={35} color={colors.primary} />
          </View>

          <Text style={styles.manageGroupName}>
            {getGroupName(selectedGroup)}
          </Text>

          <Text style={styles.sectionSubtitle}>
            Tutor: {getTutorName(selectedGroup)}
          </Text>
          <Text style={styles.sectionSubtitle}>
            Course: {getCourseTitle(selectedGroup)}
          </Text>

          <View style={styles.memberSummary}>
            <Text style={styles.memberSummaryNumber}>
              {groupInfo.totalMembers}/{groupInfo.maxStudents}
            </Text>
            <Text style={styles.memberSummaryLabel}>Group Members</Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    Math.min(
                      100,
                      (groupInfo.totalMembers /
                        Math.max(1, groupInfo.maxStudents)) *
                        100,
                    )
                  }%`,
                },
              ]}
            />
          </View>

          <Text style={styles.slotsText}>
            {groupInfo.remainingSlots} available slot(s)
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.flexOne}>
            <Text style={styles.sectionTitle}>Eligible Classmates</Text>
            <Text style={styles.sectionSubtitle}>
              Students with an accepted request for this same tutor and course.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadEligibleStudents(selectedGroup)}
            disabled={loadingStudents}
          >
            <MaterialIcons
              name="refresh"
              size={23}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {isFull ? (
          <View style={styles.fullGroupCard}>
            <MaterialIcons
              name="check-circle"
              size={30}
              color={colors.success}
            />
            <Text style={styles.fullGroupTitle}>
              {groupStatus === 'Full' ||
              groupInfo.totalMembers >= groupInfo.maxStudents
                ? 'Group is Full'
                : `Group is ${groupStatus}`}
            </Text>
            <Text style={styles.emptySubtitle}>
              This group is not accepting new members.
            </Text>
          </View>
        ) : loadingStudents ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={eligibleStudents}
            keyExtractor={(item, index) =>
              String(getStudentId(item) ?? index)
            }
            renderItem={renderEligibleStudent}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="person-search"
                  size={55}
                  color={colors.iconMuted || colors.muted}
                />
                <Text style={styles.emptyTitle}>
                  No Eligible Classmates
                </Text>
                <Text style={styles.emptySubtitle}>
                  No other eligible students are available for this group
                  right now.
                </Text>
              </View>
            }
          />
        )}
      </ScrollView>
    );
  };

  // ------------------------------------------------------
  // MAIN SCREEN
  // ------------------------------------------------------
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle="light-content"
      />

      {renderHeader()}

      {activeTab !== 'manage' && renderTabs()}

      {activeTab === 'groups' && renderMyGroups()}
      {activeTab === 'create' && renderCreateGroup()}
      {activeTab === 'manage' && renderManageGroup()}
    </View>
  );
};

export default StudentGroup;

// ------------------------------------------------------
// STYLES
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header with left back arrow and centered logo/brand.
  header: {
    height: 76,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },

  backButton: {
    width: 42,
    height: 46,
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 2,
    color: '#000'
  },

  headerBrand: {
    position: 'absolute',
    left: 58,
    right: 58,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerLogo: {
    width: 39,
    height: 39,
    marginRight: 9,
    borderRadius: 7,
    backgroundColor: colors.white,
  },

  headerBrandText: {
    color: "#0F172A",
    fontSize: 19,
    fontWeight: 'bold',
    flexShrink: 1,
  },

  headerRightSpace: {
    width: 42,
    height: 46,
  },

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 5,
    elevation: 2,
  },

  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  activeTab: {
    backgroundColor: colors.primary,
  },

  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  activeTabText: {
    color: colors.white,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  flexOne: {
    flex: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },

  sectionSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },

  addIconButton: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  groupCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder || colors.border,
    elevation: 2,
  },

  groupCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  groupIcon: {
    width: 49,
    height: 49,
    borderRadius: 12,
    backgroundColor: colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  groupTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  groupName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  groupSmallText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },

  statusBadge: {
    backgroundColor: colors.lightGreen,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  fullBadge: {
    backgroundColor: colors.fullBackground || '#FDECEC',
  },

  statusText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },

  fullStatusText: {
    color: colors.danger,
  },

  memberProgressContainer: {
    marginTop: 18,
    marginBottom: 15,
  },

  memberProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  memberCount: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },

  slotsText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
  },

  progressBackground: {
    height: 7,
    backgroundColor: colors.progressBackground || '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 10,
  },

  manageButton: {
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  manageButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },

  memberOnlyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    backgroundColor: colors.lightGreen,
    borderRadius: 9,
  },

  memberOnlyText: {
    color: colors.success,
    fontWeight: '600',
    fontSize: 12,
  },

  loader: {
    marginTop: 35,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 35,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 13,
    textAlign: 'center',
  },

  emptySubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    textAlign: 'center',
  },

  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 22,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },

  disabledButton: {
    opacity: 0.55,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.lightGreen,
    borderRadius: 11,
    padding: 13,
    marginTop: 18,
    gap: 10,
  },

  infoText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 19,
  },

  formCard: {
    backgroundColor: colors.white,
    padding: 17,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 25,
    elevation: 2,
  },

  inputLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },

  inputContainer: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 10,
  },

  dropdownWrapper: {
    marginTop: 2,
    zIndex: 1,
  },

  dropdownButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
  },

  dropdownDisabled: {
    backgroundColor: colors.lightGray || '#F1F3F5',
    opacity: 0.8,
  },

  dropdownValue: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },

  dropdownPlaceholder: {
    color: colors.placeholder || colors.muted,
  },

  dropdownOptions: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    marginTop: 5,
    backgroundColor: colors.white,
    overflow: 'hidden',
    elevation: 4,
  },

  dropdownOption: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray || '#F1F3F5',
  },

  dropdownOptionSelected: {
    backgroundColor: colors.selectedBackground || colors.lightGreen,
  },

  dropdownOptionText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },

  dropdownOptionSelectedText: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  dropdownEmptyText: {
    padding: 14,
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },

  backToGroups: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 18,
  },

  backToGroupsText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  manageHeaderCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },

  manageHeaderIcon: {
    width: 65,
    height: 65,
    backgroundColor: colors.lightGreen,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  manageGroupName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  memberSummary: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 14,
  },

  memberSummaryNumber: {
    color: colors.primary,
    fontSize: 27,
    fontWeight: 'bold',
  },

  memberSummaryLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },

  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGreen,
    borderRadius: 10,
    marginLeft: 8,
  },

  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: colors.cardBorder || colors.border,
  },

  studentAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentInfo: {
    flex: 1,
    marginHorizontal: 11,
  },

  studentName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },

  studentId: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 5,
  },

  addStudentButton: {
    backgroundColor: colors.primary,
    minWidth: 67,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },

  addStudentButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },

  fullGroupCard: {
    backgroundColor: colors.white,
    borderRadius: 13,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },

  fullGroupTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 12,
  },
});