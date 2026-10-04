import React, {useCallback, useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  RefreshControl,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {BASE_URL} from '../../config/api';

// ============================================================
// MAIN SCREEN
// ============================================================

const StudentAddFriend = ({navigation}) => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [searchText, setSearchText] = useState('');

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [addingFriendId, setAddingFriendId] = useState(null);

  const [hasSearched, setHasSearched] = useState(false);

  // ==========================================================
  // LOAD STUDENTS
  // ==========================================================

  const loadStudents = useCallback(
    async (searchValue = '', showRefresh = false) => {
      try {
        // ------------------------------------------------------
        // Loading state
        // ------------------------------------------------------

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        // ------------------------------------------------------
        // GET TOKEN
        // ------------------------------------------------------

        const token = await AsyncStorage.getItem('token');

        if (!token) {
          Alert.alert(
            'Login Required',
            'Login token not found. Please login again.',
          );

          return;
        }

        // ------------------------------------------------------
        // CLEAN SEARCH
        // ------------------------------------------------------

        const trimmedSearch = String(searchValue || '').trim();

        // ------------------------------------------------------
        // IMPORTANT:
        // Always send "name".
        //
        // This fixes:
        //
        // The name field is required.
        // ------------------------------------------------------

        const url =
          `${BASE_URL}/Student/search-students?name=` +
          encodeURIComponent(trimmedSearch);

        console.log('========================================');
        console.log('LOAD STUDENTS');
        console.log('URL:', url);
        console.log('Search:', trimmedSearch);
        console.log('========================================');

        // ------------------------------------------------------
        // API REQUEST
        // ------------------------------------------------------

        const response = await fetch(url, {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        // ------------------------------------------------------
        // READ RESPONSE AS TEXT FIRST
        // ------------------------------------------------------

        const responseText = await response.text();

        console.log('Status:', response.status);
        console.log('Response:', responseText);

        // ------------------------------------------------------
        // PARSE JSON
        // ------------------------------------------------------

        let data = {};

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch (jsonError) {
          console.log(
            'JSON Parse Error:',
            jsonError,
          );
        }

        // ------------------------------------------------------
        // HANDLE API ERROR
        // ------------------------------------------------------

        if (!response.ok) {
          let errorMessage =
            data?.message ||
            data?.error ||
            responseText ||
            `Server returned status ${response.status}`;

          // ASP.NET validation error
          if (
            data?.errors?.name &&
            Array.isArray(data.errors.name)
          ) {
            errorMessage =
              data.errors.name.join(', ');
          }

          throw new Error(errorMessage);
        }

        // ------------------------------------------------------
        // GET STUDENT ARRAY
        // ------------------------------------------------------

        const studentList =
          Array.isArray(data?.students)
            ? data.students
            : [];

        // ------------------------------------------------------
        // UPDATE STATE
        // ------------------------------------------------------

        setStudents(studentList);

        console.log(
          'Students Loaded:',
          studentList.length,
        );
      } catch (error) {
        console.log('========================================');
        console.log('LOAD STUDENTS ERROR');
        console.log('Error:', error);
        console.log('Message:', error?.message);
        console.log('========================================');

        Alert.alert(
          'Unable to load students',
          error?.message ||
            'Something went wrong while loading students.',
        );
      } finally {
        // ------------------------------------------------------
        // ALWAYS STOP LOADING
        // ------------------------------------------------------

        setLoading(false);

        setRefreshing(false);
      }
    },
    [],
  );

  // ==========================================================
  // LOAD ALL STUDENTS WHEN SCREEN OPENS
  // ==========================================================

  useEffect(() => {
    loadStudents('');
  }, [loadStudents]);

  // ==========================================================
  // SEARCH STUDENTS
  // ==========================================================

  const searchStudents = useCallback(() => {
    const searchValue = searchText.trim();

    Keyboard.dismiss();

    setHasSearched(searchValue.length > 0);

    loadStudents(searchValue);
  }, [searchText, loadStudents]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const onRefresh = useCallback(() => {
    loadStudents(
      searchText.trim(),
      true,
    );
  }, [searchText, loadStudents]);

  // ==========================================================
  // CLEAR SEARCH
  // ==========================================================

  const clearSearch = () => {
    setSearchText('');

    setHasSearched(false);

    Keyboard.dismiss();

    loadStudents('');
  };

  // ==========================================================
  // HANDLE SEARCH TEXT CHANGE
  // ==========================================================

  const handleSearchTextChange = text => {
    setSearchText(text);

    // --------------------------------------------------------
    // If user removes all text, load all students.
    // --------------------------------------------------------

    if (text.trim().length === 0) {
      setHasSearched(false);

      loadStudents('');
    }
  };

  // ==========================================================
  // ADD FRIEND
  // ==========================================================

  const addFriend = async student => {
    // --------------------------------------------------------
    // Validate student
    // --------------------------------------------------------

    if (!student?.studentId) {
      Alert.alert(
        'Error',
        'Invalid student information.',
      );

      return;
    }

    // --------------------------------------------------------
    // Prevent duplicate request
    // --------------------------------------------------------

    if (
      student.relationshipStatus === 'Accepted' ||
      student.relationshipStatus === 'PendingSent' ||
      student.relationshipStatus === 'PendingReceived' ||
      student.relationshipStatus === 'Blocked'
    ) {
      return;
    }

    try {
      // ------------------------------------------------------
      // Set loading for selected student
      // ------------------------------------------------------

      setAddingFriendId(student.studentId);

      // ------------------------------------------------------
      // GET TOKEN
      // ------------------------------------------------------

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert(
          'Login Required',
          'Your login session has expired. Please login again.',
        );

        return;
      }

      // ------------------------------------------------------
      // REQUEST BODY
      // ------------------------------------------------------

      const body = {
        friendStudentId: student.studentId,
      };

      console.log('========================================');
      console.log('ADD FRIEND');
      console.log('URL:', `${BASE_URL}/Student/add-friend`);
      console.log('BODY:', body);
      console.log('========================================');

      // ------------------------------------------------------
      // API REQUEST
      // ------------------------------------------------------

      const response = await fetch(
        `${BASE_URL}/Student/add-friend`,
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(body),
        },
      );

      // ------------------------------------------------------
      // READ RESPONSE
      // ------------------------------------------------------

      const responseText =
        await response.text();

      console.log(
        'ADD FRIEND STATUS:',
        response.status,
      );

      console.log(
        'ADD FRIEND RESPONSE:',
        responseText,
      );

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (jsonError) {
        console.log(
          'ADD FRIEND JSON ERROR:',
          jsonError,
        );
      }

      // ------------------------------------------------------
      // API ERROR
      // ------------------------------------------------------

      if (!response.ok) {
        Alert.alert(
          'Friend Request',
          data?.message ||
            'Unable to send friend request.',
        );

        // ----------------------------------------------------
        // Refresh relationship status
        // ----------------------------------------------------

        await loadStudents(
          searchText.trim(),
        );

        return;
      }

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      Alert.alert(
        'Request Sent',
        data?.message ||
          `Friend request sent to ${
            student.fullName || 'student'
          }.`,
      );

      // ------------------------------------------------------
      // UPDATE CURRENT STUDENT LOCALLY
      // ------------------------------------------------------

      setStudents(previousStudents =>
        previousStudents.map(item =>
          item.studentId ===
          student.studentId
            ? {
                ...item,

                relationshipStatus:
                  'PendingSent',

                friendRequestSent:
                  true,

                friendRequestReceived:
                  false,
              }
            : item,
        ),
      );
    } catch (error) {
      console.log(
        'ADD FRIEND ERROR:',
        error,
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please try again.',
      );
    } finally {
      setAddingFriendId(null);
    }
  };

  // ==========================================================
  // GET BUTTON INFORMATION
  // ==========================================================

  const getButtonInfo = student => {
    const status =
      student?.relationshipStatus;

    // --------------------------------------------------------
    // ALREADY FRIENDS
    // --------------------------------------------------------

    if (status === 'Accepted') {
      return {
        text: 'Friends',
        icon: 'people',
        style: styles.friendsButton,
        disabled: true,
      };
    }

    // --------------------------------------------------------
    // REQUEST SENT
    // --------------------------------------------------------

    if (status === 'PendingSent') {
      return {
        text: 'Sent',
        icon: 'check',
        style: styles.requestSentButton,
        disabled: true,
      };
    }

    // --------------------------------------------------------
    // REQUEST RECEIVED
    // --------------------------------------------------------

    if (status === 'PendingReceived') {
      return {
        text: 'Received',
        icon: 'person',
        style: styles.receivedButton,
        disabled: true,
      };
    }

    // --------------------------------------------------------
    // BLOCKED
    // --------------------------------------------------------

    if (status === 'Blocked') {
      return {
        text: 'Blocked',
        icon: 'block',
        style: styles.blockedButton,
        disabled: true,
      };
    }

    // --------------------------------------------------------
    // DEFAULT
    // --------------------------------------------------------

    return {
      text: 'Add',
      icon: 'person-add',
      style: styles.addButton,
      disabled: false,
    };
  };

  // ==========================================================
  // RENDER STUDENT
  // ==========================================================

  const renderStudent = student => {
    const buttonInfo =
      getButtonInfo(student);

    const isAdding =
      addingFriendId === student.studentId;

    const fullName =
      student?.fullName?.trim() ||
      'Student';

    const firstLetter =
      fullName.charAt(0).toUpperCase();

    return (
      <View
        key={student.studentId}
        style={styles.studentCard}>

        {/* ==================================================
            AVATAR
        ================================================== */}

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {firstLetter}
          </Text>
        </View>

        {/* ==================================================
            STUDENT INFORMATION
        ================================================== */}

        <View style={styles.studentInfo}>
          <Text
            style={styles.studentName}
            numberOfLines={1}>
            {fullName}
          </Text>

          {student.email ? (
            <View style={styles.infoRow}>
              <MaterialIcons
                name="email"
                size={14}
                color="#6B7280"
              />

              <Text
                style={styles.studentEmail}
                numberOfLines={1}>
                {student.email}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <MaterialIcons
              name="school"
              size={14}
              color="#6B7280"
            />

            <Text style={styles.studentIdText}>
              Student ID: {student.studentId}
            </Text>
          </View>
        </View>

        {/* ==================================================
            ACTION BUTTON
        ================================================== */}

        <TouchableOpacity
          style={[
            buttonInfo.style,
            isAdding &&
              styles.disabledButton,
          ]}
          disabled={
            buttonInfo.disabled ||
            isAdding
          }
          onPress={() =>
            addFriend(student)
          }
          activeOpacity={0.8}>

          {isAdding ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <MaterialIcons
                name={buttonInfo.icon}
                size={17}
                color="#FFFFFF"
              />

              <Text
                style={styles.addButtonText}>
                {buttonInfo.text}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F9FC"
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.7}>

          <MaterialIcons
            name="arrow-back"
            size={25}
            color="#1E3A8A"
          />
        </TouchableOpacity>

        <View
          style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Add Friend
          </Text>

          <Text
            style={styles.headerSubtitle}>
            Find and connect with students
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <MaterialIcons
            name="person-add"
            size={25}
            color="#1E3A8A"
          />
        </View>
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
          />
        }>

        {/* ====================================================
            INTRO
        ==================================================== */}

        <View style={styles.introCard}>
          <View
            style={
              styles.introIconContainer
            }>
            <MaterialIcons
              name="people"
              size={30}
              color="#1E3A8A"
            />
          </View>

          <View
            style={
              styles.introTextContainer
            }>
            <Text style={styles.introTitle}>
              Find Your Friends
            </Text>

            <Text style={styles.introText}>
              Search for students and send
              them a friend request.
            </Text>
          </View>
        </View>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>
            Search Student
          </Text>

          <Text
            style={
              styles.sectionDescription
            }>
            Search by full name or even a
            single character.
          </Text>

          <View
            style={
              styles.searchContainer
            }>
            <MaterialIcons
              name="search"
              size={23}
              color="#6B7280"
              style={styles.searchIcon}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Search by student name..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={
                handleSearchTextChange
              }
              onSubmitEditing={
                searchStudents
              }
              returnKeyType="search"
              autoCapitalize="words"
              autoCorrect={false}
            />

            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
                activeOpacity={0.7}>

                <MaterialIcons
                  name="close"
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.searchButton,
              loading &&
                styles.disabledButton,
            ]}
            onPress={searchStudents}
            disabled={loading}
            activeOpacity={0.8}>

            {loading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <MaterialIcons
                  name="search"
                  size={21}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.searchButtonText
                  }>
                  Search Students
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ====================================================
            RESULTS HEADER
        ==================================================== */}

        <View
          style={
            styles.resultsHeader
          }>
          <View>
            <Text
              style={
                styles.resultsTitle
              }>
              {hasSearched
                ? 'Search Results'
                : 'All Students'}
            </Text>

            <Text
              style={
                styles.resultsSubtitle
              }>
              {students.length}{' '}
              {students.length === 1
                ? 'student'
                : 'students'}{' '}
              found
            </Text>
          </View>

          <View
            style={
              styles.resultsCount
            }>
            <Text
              style={
                styles.resultsCountText
              }>
              {students.length}
            </Text>
          </View>
        </View>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && !refreshing ? (
          <View
            style={
              styles.loadingContainer
            }>
            <ActivityIndicator
              size="large"
              color="#1E3A8A"
            />

            <Text
              style={
                styles.loadingText
              }>
              Loading students...
            </Text>
          </View>
        ) : students.length === 0 ? (
          /* ==================================================
             EMPTY
             ================================================== */

          <View
            style={
              styles.emptyCard
            }>
            <View
              style={
                styles.emptyIconContainer
              }>
              <MaterialIcons
                name={
                  hasSearched
                    ? 'person-search'
                    : 'people-outline'
                }
                size={42}
                color="#9CA3AF"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }>
              {hasSearched
                ? 'No Students Found'
                : 'No Students Available'}
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              {hasSearched
                ? `No student was found matching "${searchText.trim()}".`
                : 'There are currently no other students available.'}
            </Text>
          </View>
        ) : (
          /* ==================================================
             STUDENT LIST
             ================================================== */

          students.map(renderStudent)
        )}

        {/* ====================================================
            INFORMATION
        ==================================================== */}

        <View style={styles.infoCard}>
          <MaterialIcons
            name="info-outline"
            size={21}
            color="#1E3A8A"
          />

          <Text style={styles.infoText}>
            Friend requests are sent as
            Pending. The other student must
            accept your request before you
            become friends.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    minHeight: 78,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==========================================================
  // INTRO CARD
  // ==========================================================

  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  introIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  introTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  introTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  introText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    marginTop: 4,
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  sectionDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 14,
  },

  searchContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 14,
  },

  clearButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButton: {
    height: 50,
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  // ==========================================================
  // RESULTS
  // ==========================================================

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  resultsSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  resultsCount: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  resultsCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 10,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  emptyIconContainer: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
  },

  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },

  // ==========================================================
  // STUDENT CARD
  // ==========================================================

  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1E3A8A',
  },

  studentInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 5,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  studentEmail: {
    flex: 1,
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 5,
  },

  studentIdText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 5,
  },

  // ==========================================================
  // BUTTONS
  // ==========================================================

  addButton: {
    minWidth: 70,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  requestSentButton: {
    minWidth: 70,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  friendsButton: {
    minWidth: 78,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  receivedButton: {
    minWidth: 82,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  blockedButton: {
    minWidth: 78,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },

  // ==========================================================
  // INFORMATION
  // ==========================================================

  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoText: {
    flex: 1,
    color: '#374151',
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 9,
  },
});

export default StudentAddFriend;
