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
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {BASE_URL} from '../../config/api';


// ============================================================
// DAYS
// ============================================================

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];


// ============================================================
// MAIN SCREEN
// ============================================================

const AdminAddLTRoom = ({navigation}) => {

  // ============================================================
  // LT ROOM LIST
  // ============================================================

  const [rooms, setRooms] = useState([]);

  const [roomsLoading, setRoomsLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);


  // ============================================================
  // ADD ROOM MODAL
  // ============================================================

  const [addRoomModalVisible, setAddRoomModalVisible] =
    useState(false);


  // ============================================================
  // ROOM FORM DATA
  // ============================================================

  const [roomName, setRoomName] = useState('');

  const [capacity, setCapacity] = useState('');


  // ============================================================
  // SCHEDULE DATA
  // ============================================================

  const [schedules, setSchedules] = useState([]);

  const [selectedDay, setSelectedDay] = useState('Monday');

  const [time, setTime] = useState('');

  const [startDate, setStartDate] = useState('');

  const [endDate, setEndDate] = useState('');


  // ============================================================
  // SCHEDULE MODAL
  // ============================================================

  const [scheduleModalVisible, setScheduleModalVisible] =
    useState(false);


  // ============================================================
  // ADD ROOM LOADING
  // ============================================================

  const [savingRoom, setSavingRoom] = useState(false);


  // ============================================================
  // GET TOKEN
  // ============================================================

  const getToken = async () => {

    const token =
      await AsyncStorage.getItem('token');

    if (!token) {

      Alert.alert(
        'Session Expired',
        'Please login again.',
      );

      return null;
    }

    return token;
  };


  // ============================================================
  // LOAD ALL LT ROOMS
  // ============================================================

  const getLTRooms = useCallback(async () => {

    try {

      setRoomsLoading(true);


      // ========================================================
      // GET TOKEN
      // ========================================================

      const token = await getToken();

      if (!token) {

        setRoomsLoading(false);

        return;
      }


      // ========================================================
      // API URL
      // ========================================================

      const url =
        `${BASE_URL}/Admin/get-lt-rooms`;


      console.log(
        '========================================',
      );

      console.log(
        'GET LT ROOMS',
      );

      console.log(
        'API:',
        url,
      );

      console.log(
        '========================================',
      );


      // ========================================================
      // API REQUEST
      // ========================================================

      const response = await fetch(
        url,
        {
          method: 'GET',

          headers: {
            Accept: 'application/json',

            Authorization: `Bearer ${token}`,
          },
        },
      );


      // ========================================================
      // RESPONSE
      // ========================================================

      const responseText =
        await response.text();


      console.log(
        'GET LT ROOMS STATUS:',
        response.status,
      );

      console.log(
        'GET LT ROOMS RESPONSE:',
        responseText,
      );


      let data = {};

      try {

        data = responseText
          ? JSON.parse(responseText)
          : {};

      } catch (error) {

        console.log(
          'JSON PARSE ERROR:',
          error,
        );

        data = {};
      }


      // ========================================================
      // SUCCESS
      // ========================================================

      if (response.ok) {

        const roomList =
          Array.isArray(data.rooms)
            ? data.rooms
            : [];

        setRooms(roomList);

        return;
      }


      // ========================================================
      // ERROR
      // ========================================================

      let errorMessage =
        'Unable to load LT Rooms.';


      if (data.message) {

        errorMessage =
          data.message;

      } else if (data.error) {

        errorMessage =
          data.error;

      } else if (responseText) {

        errorMessage =
          responseText;
      }


      Alert.alert(
        'Error',
        errorMessage,
      );

    } catch (error) {

      console.log(
        'GET LT ROOMS ERROR:',
        error,
      );


      Alert.alert(
        'Network Error',
        'Unable to connect with server. Please check your backend and network connection.',
      );

    } finally {

      setRoomsLoading(false);
    }

  }, []);


  // ============================================================
  // LOAD ROOMS WHEN SCREEN OPENS
  // ============================================================

  useEffect(() => {

    getLTRooms();

  }, [getLTRooms]);


  // ============================================================
  // PULL TO REFRESH
  // ============================================================

  const onRefresh = async () => {

    setRefreshing(true);

    await getLTRooms();

    setRefreshing(false);
  };


  // ============================================================
  // OPEN ADD ROOM MODAL
  // ============================================================

  const openAddRoomModal = () => {

    resetRoomForm();

    setAddRoomModalVisible(true);
  };


  // ============================================================
  // CLOSE ADD ROOM MODAL
  // ============================================================

  const closeAddRoomModal = () => {

    if (savingRoom) {
      return;
    }

    setAddRoomModalVisible(false);

    resetRoomForm();
  };


  // ============================================================
  // RESET ROOM FORM
  // ============================================================

  const resetRoomForm = () => {

    setRoomName('');

    setCapacity('');

    setSchedules([]);

    resetScheduleForm();
  };


  // ============================================================
  // OPEN SCHEDULE POPUP
  // ============================================================

  const openSchedulePopup = () => {

    if (!roomName.trim()) {

      Alert.alert(
        'Required',
        'Please enter venue name first.',
      );

      return;
    }


    if (!capacity.trim()) {

      Alert.alert(
        'Required',
        'Please enter venue capacity first.',
      );

      return;
    }


    if (
      isNaN(parseInt(capacity, 10)) ||
      parseInt(capacity, 10) <= 0
    ) {

      Alert.alert(
        'Invalid Capacity',
        'Capacity must be greater than 0.',
      );

      return;
    }


    setScheduleModalVisible(true);
  };


  // ============================================================
  // RESET SCHEDULE FORM
  // ============================================================

  const resetScheduleForm = () => {

    setSelectedDay('Monday');

    setTime('');

    setStartDate('');

    setEndDate('');
  };


  // ============================================================
  // ADD SCHEDULE
  // ============================================================

  const addSchedule = () => {

    // ==========================================================
    // VALIDATE TIME
    // ==========================================================

    if (!time.trim()) {

      Alert.alert(
        'Required',
        'Please enter schedule time.',
      );

      return;
    }


    // ==========================================================
    // VALIDATE START DATE
    // ==========================================================

    if (!startDate.trim()) {

      Alert.alert(
        'Required',
        'Please enter start date.',
      );

      return;
    }


    // ==========================================================
    // VALIDATE END DATE
    // ==========================================================

    if (!endDate.trim()) {

      Alert.alert(
        'Required',
        'Please enter end date.',
      );

      return;
    }


    // ==========================================================
    // DATE FORMAT
    // ==========================================================

    const dateRegex =
      /^\d{4}-\d{2}-\d{2}$/;


    if (!dateRegex.test(startDate.trim())) {

      Alert.alert(
        'Invalid Date',
        'Start date must be in YYYY-MM-DD format.\n\nExample: 2026-10-05',
      );

      return;
    }


    if (!dateRegex.test(endDate.trim())) {

      Alert.alert(
        'Invalid Date',
        'End date must be in YYYY-MM-DD format.\n\nExample: 2027-02-28',
      );

      return;
    }


    // ==========================================================
    // CHECK DATE ORDER
    // ==========================================================

    if (
      new Date(startDate.trim()) >
      new Date(endDate.trim())
    ) {

      Alert.alert(
        'Invalid Date',
        'Start date cannot be greater than end date.',
      );

      return;
    }


    // ==========================================================
    // CHECK DUPLICATE
    // ==========================================================

    const duplicate =
      schedules.some(
        item =>
          item.day.toLowerCase() ===
            selectedDay.toLowerCase() &&
          item.time.toLowerCase() ===
            time.trim().toLowerCase(),
      );


    if (duplicate) {

      Alert.alert(
        'Duplicate Schedule',
        'This day and time schedule has already been added.',
      );

      return;
    }


    // ==========================================================
    // NEW SCHEDULE
    // ==========================================================

    const newSchedule = {

      day: selectedDay,

      time: time.trim(),

      startDate:
        startDate.trim(),

      endDate:
        endDate.trim(),
    };


    // ==========================================================
    // ADD
    // ==========================================================

    setSchedules(prev => [
      ...prev,
      newSchedule,
    ]);


    // ==========================================================
    // RESET
    // ==========================================================

    resetScheduleForm();

    setScheduleModalVisible(false);


    Alert.alert(
      'Schedule Added',
      `${selectedDay} schedule has been added successfully.`,
    );
  };


  // ============================================================
  // REMOVE SCHEDULE
  // ============================================================

  const removeSchedule = index => {

    Alert.alert(
      'Remove Schedule',
      'Are you sure you want to remove this schedule?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Remove',
          style: 'destructive',

          onPress: () => {

            setSchedules(prev =>
              prev.filter(
                (_, scheduleIndex) =>
                  scheduleIndex !== index,
              ),
            );
          },
        },
      ],
    );
  };


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDateForApi = date => {

    if (!date) {
      return null;
    }

    return date.trim();
  };


  // ============================================================
  // SAVE LT ROOM
  // ============================================================

  const saveLTRoom = async () => {

    // ==========================================================
    // VALIDATE ROOM NAME
    // ==========================================================

    if (!roomName.trim()) {

      Alert.alert(
        'Required',
        'Please enter venue name.',
      );

      return;
    }


    // ==========================================================
    // VALIDATE CAPACITY
    // ==========================================================

    if (!capacity.trim()) {

      Alert.alert(
        'Required',
        'Please enter venue capacity.',
      );

      return;
    }


    const numericCapacity =
      parseInt(
        capacity.trim(),
        10,
      );


    if (
      isNaN(numericCapacity) ||
      numericCapacity <= 0
    ) {

      Alert.alert(
        'Invalid Capacity',
        'Please enter a valid capacity greater than 0.',
      );

      return;
    }


    // ==========================================================
    // VALIDATE SCHEDULE
    // ==========================================================

    if (schedules.length === 0) {

      Alert.alert(
        'Schedule Required',
        'Please add at least one available schedule.',
      );

      return;
    }


    try {

      setSavingRoom(true);


      // ========================================================
      // TOKEN
      // ========================================================

      const token =
        await AsyncStorage.getItem('token');


      if (!token) {

        Alert.alert(
          'Session Expired',
          'Please login again.',
        );

        setSavingRoom(false);

        return;
      }


      // ========================================================
      // REQUEST BODY
      // ========================================================

      const body = {

        roomName:
          roomName.trim(),

        capacity:
          numericCapacity,

        schedules:
          schedules.map(item => ({

            day:
              item.day,

            time:
              item.time,

            startDate:
              formatDateForApi(
                item.startDate,
              ),

            endDate:
              formatDateForApi(
                item.endDate,
              ),
          })),
      };


      console.log(
        '========================================',
      );

      console.log(
        'ADD LT ROOM',
      );

      console.log(
        'API:',
        `${BASE_URL}/Admin/add-lt-room`,
      );

      console.log(
        'REQUEST BODY:',
        body,
      );

      console.log(
        '========================================',
      );


      // ========================================================
      // POST API
      // ========================================================

      const response =
        await fetch(
          `${BASE_URL}/Admin/add-lt-room`,
          {
            method: 'POST',

            headers: {

              'Content-Type':
                'application/json',

              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(body),
          },
        );


      // ========================================================
      // RESPONSE
      // ========================================================

      const responseText =
        await response.text();


      console.log(
        'ADD LT ROOM STATUS:',
        response.status,
      );

      console.log(
        'ADD LT ROOM RESPONSE:',
        responseText,
      );


      let data = {};


      try {

        data =
          responseText
            ? JSON.parse(responseText)
            : {};

      } catch (error) {

        console.log(
          'JSON PARSE ERROR:',
          error,
        );

        data = {};
      }


      // ========================================================
      // SUCCESS
      // ========================================================

      if (response.ok) {

        setAddRoomModalVisible(false);

        resetRoomForm();


        Alert.alert(
          'Success',
          data.message ||
            'Venue and schedule added successfully.',
          [
            {
              text: 'OK',

              onPress: async () => {

                await getLTRooms();
              },
            },
          ],
        );

        return;
      }


      // ========================================================
      // ERROR
      // ========================================================

      let errorMessage =
        'Unable to add venue.';


      if (data.message) {

        errorMessage =
          data.message;

      } else if (data.error) {

        errorMessage =
          data.error;

      } else if (responseText) {

        errorMessage =
          responseText;
      }


      Alert.alert(
        'Error',
        errorMessage,
      );

    } catch (error) {

      console.log(
        'ADD LT ROOM ERROR:',
        error,
      );


      Alert.alert(
        'Network Error',
        'Unable to connect with server. Please check your backend and network connection.',
      );

    } finally {

      setSavingRoom(false);
    }
  };


  // ============================================================
  // GET STATUS STYLE
  // ============================================================

  const getStatusStyle = status => {

    const value =
      String(status || '')
        .toLowerCase();


    if (value === 'active' ||
        value === 'available' ||
        value === 'approved') {

      return {

        backgroundColor: '#EAF8EF',

        color: '#267A48',
      };
    }


    if (value === 'inactive' ||
        value === 'blocked' ||
        value === 'disabled') {

      return {

        backgroundColor: '#FFF0F0',

        color: '#C0392B',
      };
    }


    return {

      backgroundColor: '#FFF7E8',

      color: '#A66A00',
    };
  };


  // ============================================================
  // RENDER SCHEDULE
  // ============================================================

  const renderRoomSchedule = (
    schedule,
    index,
  ) => {

    return (

      <View
        key={
          schedule.ltScheduleId ||
          `${schedule.day}-${index}`
        }
        style={styles.roomScheduleCard}
      >

        {/* Day */}

        <View style={styles.roomScheduleDay}>

          <MaterialIcons
            name="calendar-today"
            size={18}
            color="#173F5F"
          />

          <Text style={styles.roomScheduleDayText}>
            {schedule.day || 'N/A'}
          </Text>

        </View>


        {/* Details */}

        <View style={styles.roomScheduleDetails}>

          <View style={styles.roomScheduleRow}>

            <MaterialIcons
              name="access-time"
              size={17}
              color="#666"
            />

            <Text style={styles.roomScheduleTime}>
              {schedule.time || 'Time not available'}
            </Text>

          </View>


          <View style={styles.roomScheduleRow}>

            <MaterialIcons
              name="date-range"
              size={17}
              color="#777"
            />

            <Text style={styles.roomScheduleDate}>

              {schedule.startDate || '-'}
              {' → '}
              {schedule.endDate || '-'}

            </Text>

          </View>


          {/* Schedule Status */}

          {schedule.status ? (

            <View style={styles.scheduleStatusRow}>

              <View
                style={[
                  styles.smallStatusDot,

                  String(schedule.status)
                    .toLowerCase() ===
                    'available'
                    ? styles.availableDot
                    : styles.defaultDot,
                ]}
              />

              <Text style={styles.scheduleStatusText}>
                {schedule.status}
              </Text>

            </View>

          ) : null}

        </View>

      </View>
    );
  };


  // ============================================================
  // RENDER ROOM
  // ============================================================

  const renderRoom = (
    room,
    index,
  ) => {

    const roomStatus =
      getStatusStyle(room.status);


    const roomSchedules =
      Array.isArray(room.schedules)
        ? room.schedules
        : [];


    return (

      <View
        key={
          room.ltRoomId ||
          `room-${index}`
        }
        style={styles.roomCard}
      >

        {/* ====================================================
            ROOM HEADER
        ==================================================== */}

        <View style={styles.roomHeader}>

          <View style={styles.roomIcon}>

            <MaterialIcons
              name="meeting-room"
              size={25}
              color="#173F5F"
            />

          </View>


          <View style={styles.roomTitleContainer}>

            <Text style={styles.roomName}>
              {room.roomName ||
                'Unnamed Venue'}
            </Text>

            <Text style={styles.roomId}>
              Venue ID: {room.ltRoomId || '-'}
            </Text>

          </View>


          {/* STATUS */}

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  roomStatus.backgroundColor,
              },
            ]}
          >

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    roomStatus.color,
                },
              ]}
            >
              {room.status || 'Unknown'}
            </Text>

          </View>

        </View>


        {/* ====================================================
            ROOM INFORMATION
        ==================================================== */}

        <View style={styles.roomInfoContainer}>

          <View style={styles.roomInfoItem}>

            <MaterialIcons
              name="groups"
              size={19}
              color="#173F5F"
            />

            <View style={styles.roomInfoTextContainer}>

              <Text style={styles.roomInfoLabel}>
                Capacity
              </Text>

              <Text style={styles.roomInfoValue}>
                {room.capacity || 0} Students
              </Text>

            </View>

          </View>


          <View style={styles.roomInfoItem}>

            <MaterialIcons
              name="event-available"
              size={19}
              color="#173F5F"
            />

            <View style={styles.roomInfoTextContainer}>

              <Text style={styles.roomInfoLabel}>
                Schedules
              </Text>

              <Text style={styles.roomInfoValue}>
                {roomSchedules.length} Available
              </Text>

            </View>

          </View>

        </View>


        {/* ====================================================
            DIVIDER
        ==================================================== */}

        <View style={styles.divider} />


        {/* ====================================================
            SCHEDULE HEADER
        ==================================================== */}

        <View style={styles.roomScheduleHeader}>

          <View>

            <Text style={styles.roomScheduleTitle}>
              Venue Schedule
            </Text>

            <Text style={styles.roomScheduleSubtitle}>
              Available days and timings
            </Text>

          </View>


          <View style={styles.scheduleCountBadge}>

            <Text style={styles.scheduleCountText}>
              {roomSchedules.length}
            </Text>

          </View>

        </View>


        {/* ====================================================
            SCHEDULES
        ==================================================== */}

        {roomSchedules.length === 0 ? (

          <View style={styles.noScheduleBox}>

            <MaterialIcons
              name="event-busy"
              size={25}
              color="#B0B8C0"
            />

            <Text style={styles.noScheduleText}>
              No schedule available for this venue.
            </Text>

          </View>

        ) : (

          <View style={styles.roomSchedulesList}>

            {roomSchedules.map(
              renderRoomSchedule,
            )}

          </View>

        )}

      </View>
    );
  };


  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (

    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#173F5F"
      />


      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>

        {/* BACK */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation?.goBack()
          }
        >

          <MaterialIcons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />

        </TouchableOpacity>


        {/* TITLE */}

        <View style={styles.headerTextContainer}>

          <Text style={styles.headerTitle}>
            LT Room Management
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage learning venues and schedules
          </Text>

        </View>


        {/* ==================================================
            PLUS BUTTON
        ================================================== */}

        <TouchableOpacity
          style={styles.addRoomHeaderButton}
          onPress={openAddRoomModal}
          activeOpacity={0.8}
        >

          <MaterialIcons
            name="add"
            size={28}
            color="#173F5F"
          />

        </TouchableOpacity>

      </View>


      {/* ======================================================
          MAIN ROOM LIST
      ====================================================== */}

      {roomsLoading ? (

        <View style={styles.loadingContainer}>

          <ActivityIndicator
            size="large"
            color="#173F5F"
          />

          <Text style={styles.loadingText}>
            Loading LT Rooms...
          </Text>

        </View>

      ) : (

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#173F5F']}
              tintColor="#173F5F"
            />
          }
        >

          {/* ==================================================
              PAGE INTRO
          ================================================== */}

          <View style={styles.pageIntro}>

            <View style={styles.pageIntroIcon}>

              <MaterialIcons
                name="meeting-room"
                size={26}
                color="#173F5F"
              />

            </View>


            <View style={styles.pageIntroText}>

              <Text style={styles.pageIntroTitle}>
                Learning Venues
              </Text>

              <Text style={styles.pageIntroSubtitle}>
                Manage all LT rooms and their available schedules.
              </Text>

            </View>


            <View style={styles.totalRoomsBadge}>

              <Text style={styles.totalRoomsNumber}>
                {rooms.length}
              </Text>

              <Text style={styles.totalRoomsLabel}>
                Rooms
              </Text>

            </View>

          </View>


          {/* ==================================================
              EMPTY ROOM LIST
          ================================================== */}

          {rooms.length === 0 ? (

            <View style={styles.emptyRooms}>

              <View style={styles.emptyRoomsIcon}>

                <MaterialIcons
                  name="meeting-room"
                  size={45}
                  color="#B6C0C9"
                />

              </View>


              <Text style={styles.emptyRoomsTitle}>
                No LT Rooms Added
              </Text>


              <Text style={styles.emptyRoomsText}>
                No learning venues are currently available.
                Tap the + button above to add a new venue.
              </Text>


              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={openAddRoomModal}
                activeOpacity={0.8}
              >

                <MaterialIcons
                  name="add"
                  size={21}
                  color="#FFFFFF"
                />

                <Text style={styles.emptyAddButtonText}>
                  Add First Venue
                </Text>

              </TouchableOpacity>

            </View>

          ) : (

            <View>

              {rooms.map(
                renderRoom,
              )}

            </View>

          )}


          <View style={styles.bottomSpace} />

        </ScrollView>

      )}


      {/* ======================================================
          ADD VENUE MODAL
      ====================================================== */}

      <Modal
        visible={addRoomModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeAddRoomModal}
      >

        <View style={styles.addModalOverlay}>

          <KeyboardAvoidingView
            style={styles.addModalKeyboard}
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : undefined
            }
          >

            <View style={styles.addModalContainer}>

              {/* ==============================================
                  MODAL HEADER
              ============================================== */}

              <View style={styles.addModalHeader}>

                <View style={styles.addModalTitleContainer}>

                  <View style={styles.addModalIcon}>

                    <MaterialIcons
                      name="add-business"
                      size={22}
                      color="#173F5F"
                    />

                  </View>


                  <View>

                    <Text style={styles.addModalTitle}>
                      Add New Venue
                    </Text>

                    <Text style={styles.addModalSubtitle}>
                      Add LT / Learning Venue
                    </Text>

                  </View>

                </View>


                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeAddRoomModal}
                  disabled={savingRoom}
                >

                  <MaterialIcons
                    name="close"
                    size={23}
                    color="#555"
                  />

                </TouchableOpacity>

              </View>


              {/* ==============================================
                  ADD VENUE FORM
              ============================================== */}

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >

                {/* ==========================================
                    VENUE INFORMATION
                ========================================== */}

                <View style={styles.formSection}>

                  <Text style={styles.formSectionTitle}>
                    Venue Information
                  </Text>


                  {/* VENUE NAME */}

                  <Text style={styles.label}>
                    Venue Name
                  </Text>

                  <View style={styles.inputContainer}>

                    <MaterialIcons
                      name="meeting-room"
                      size={21}
                      color="#777"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="e.g. LT Room 1"
                      placeholderTextColor="#999"
                      value={roomName}
                      onChangeText={setRoomName}
                    />

                  </View>


                  {/* CAPACITY */}

                  <Text style={styles.label}>
                    Capacity
                  </Text>

                  <View style={styles.inputContainer}>

                    <MaterialIcons
                      name="groups"
                      size={21}
                      color="#777"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 30"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={capacity}
                      onChangeText={setCapacity}
                    />

                  </View>

                </View>


                {/* ==========================================
                    SCHEDULE
                ========================================== */}

                <View style={styles.formSection}>

                  <View style={styles.formSectionHeader}>

                    <View>

                      <Text style={styles.formSectionTitle}>
                        Available Schedule
                      </Text>

                      <Text style={styles.formSectionSubtitle}>
                        Add the days and times when this venue is available.
                      </Text>

                    </View>


                    <View style={styles.formScheduleCount}>

                      <Text style={styles.formScheduleCountText}>
                        {schedules.length}
                      </Text>

                    </View>

                  </View>


                  {/* ADD SCHEDULE */}

                  <TouchableOpacity
                    style={styles.addScheduleButton}
                    onPress={openSchedulePopup}
                    activeOpacity={0.8}
                  >

                    <MaterialIcons
                      name="add"
                      size={23}
                      color="#FFFFFF"
                    />

                    <Text style={styles.addScheduleButtonText}>
                      Add Schedule
                    </Text>

                  </TouchableOpacity>


                  {/* SCHEDULE LIST */}

                  {schedules.length === 0 ? (

                    <View style={styles.emptySchedule}>

                      <MaterialIcons
                        name="event-note"
                        size={38}
                        color="#B8C0C8"
                      />

                      <Text style={styles.emptyTitle}>
                        No Schedule Added
                      </Text>

                      <Text style={styles.emptyText}>
                        Add at least one available day and time.
                      </Text>

                    </View>

                  ) : (

                    <View style={styles.scheduleList}>

                      {schedules.map(
                        (item, index) => (

                          <View
                            key={`${item.day}-${index}`}
                            style={styles.scheduleCard}
                          >

                            <View style={styles.scheduleDayBox}>

                              <MaterialIcons
                                name="calendar-today"
                                size={21}
                                color="#173F5F"
                              />

                              <Text style={styles.scheduleDay}>
                                {item.day}
                              </Text>

                            </View>


                            <View style={styles.scheduleDetails}>

                              <View style={styles.scheduleRow}>

                                <MaterialIcons
                                  name="access-time"
                                  size={18}
                                  color="#666"
                                />

                                <Text style={styles.scheduleTime}>
                                  {item.time}
                                </Text>

                              </View>


                              <View style={styles.scheduleRow}>

                                <MaterialIcons
                                  name="date-range"
                                  size={18}
                                  color="#666"
                                />

                                <Text style={styles.scheduleDate}>
                                  {item.startDate} → {item.endDate}
                                </Text>

                              </View>

                            </View>


                            {/* DELETE */}

                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() =>
                                removeSchedule(index)
                              }
                            >

                              <MaterialIcons
                                name="delete-outline"
                                size={22}
                                color="#D64545"
                              />

                            </TouchableOpacity>

                          </View>

                        ),
                      )}

                    </View>

                  )}

                </View>


                {/* ==========================================
                    SAVE
                ========================================== */}

                <TouchableOpacity
                  style={[
                    styles.saveButton,

                    savingRoom &&
                      styles.disabledButton,
                  ]}
                  onPress={saveLTRoom}
                  disabled={savingRoom}
                  activeOpacity={0.8}
                >

                  {savingRoom ? (

                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                  ) : (

                    <MaterialIcons
                      name="save"
                      size={22}
                      color="#FFFFFF"
                    />

                  )}

                  <Text style={styles.saveButtonText}>

                    {savingRoom
                      ? 'Saving Venue...'
                      : 'Save Venue'}

                  </Text>

                </TouchableOpacity>


                <View style={styles.modalBottomSpace} />

              </ScrollView>

            </View>

          </KeyboardAvoidingView>

        </View>

      </Modal>


      {/* ======================================================
          SCHEDULE MODAL
      ====================================================== */}

      <Modal
        visible={scheduleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          setScheduleModalVisible(false)
        }
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            {/* ================================================
                MODAL HEADER
            ================================================ */}

            <View style={styles.modalHeader}>

              <View>

                <Text style={styles.modalTitle}>
                  Add Available Schedule
                </Text>

                <Text style={styles.modalSubtitle}>
                  Set venue availability
                </Text>

              </View>


              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() =>
                  setScheduleModalVisible(false)
                }
              >

                <MaterialIcons
                  name="close"
                  size={23}
                  color="#555"
                />

              </TouchableOpacity>

            </View>


            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* ============================================
                  DAY
              ============================================ */}

              <Text style={styles.modalLabel}>
                Day
              </Text>


              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                  styles.daysContainer
                }
              >

                {DAYS.map(day => (

                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,

                      selectedDay === day &&
                        styles.selectedDayButton,
                    ]}
                    onPress={() =>
                      setSelectedDay(day)
                    }
                  >

                    <Text
                      style={[
                        styles.dayButtonText,

                        selectedDay === day &&
                          styles.selectedDayButtonText,
                      ]}
                    >
                      {day.substring(0, 3)}
                    </Text>

                  </TouchableOpacity>

                ))}

              </ScrollView>


              {/* ============================================
                  TIME
              ============================================ */}

              <Text style={styles.modalLabel}>
                Time
              </Text>


              <View style={styles.inputContainer}>

                <MaterialIcons
                  name="access-time"
                  size={21}
                  color="#777"
                />

                <TextInput
                  style={styles.input}
                  placeholder="e.g. 9:00-10:00 am"
                  placeholderTextColor="#999"
                  value={time}
                  onChangeText={setTime}
                />

              </View>


              <Text style={styles.helperText}>
                Example: 9:00-10:00 am
              </Text>


              {/* ============================================
                  START DATE
              ============================================ */}

              <Text style={styles.modalLabel}>
                Start Date
              </Text>


              <View style={styles.inputContainer}>

                <MaterialIcons
                  name="date-range"
                  size={21}
                  color="#777"
                />

                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                  value={startDate}
                  onChangeText={setStartDate}
                  keyboardType="numbers-and-punctuation"
                />

              </View>


              {/* ============================================
                  END DATE
              ============================================ */}

              <Text style={styles.modalLabel}>
                End Date
              </Text>


              <View style={styles.inputContainer}>

                <MaterialIcons
                  name="date-range"
                  size={21}
                  color="#777"
                />

                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                  value={endDate}
                  onChangeText={setEndDate}
                  keyboardType="numbers-and-punctuation"
                />

              </View>


              {/* ============================================
                  STATUS
              ============================================ */}

              <View style={styles.availableBox}>

                <MaterialIcons
                  name="check-circle"
                  size={21}
                  color="#2E8B57"
                />

                <View style={styles.availableTextContainer}>

                  <Text style={styles.availableTitle}>
                    Available
                  </Text>

                  <Text style={styles.availableDescription}>
                    This schedule will be saved as available.
                  </Text>

                </View>

              </View>


              {/* ============================================
                  ADD BUTTON
              ============================================ */}

              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={addSchedule}
                activeOpacity={0.8}
              >

                <MaterialIcons
                  name="add"
                  size={22}
                  color="#FFFFFF"
                />

                <Text style={styles.modalAddButtonText}>
                  Add Schedule
                </Text>

              </TouchableOpacity>


              <View style={styles.modalBottomSpace} />

            </ScrollView>

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
};


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  flex: {
    flex: 1,
  },


  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    backgroundColor: '#173F5F',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: '#D9E5EE',
    fontSize: 11,
    marginTop: 2,
  },

  addRoomHeaderButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },


  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#666',
    fontSize: 13,
    marginTop: 10,
  },


  // ==========================================================
  // MAIN CONTAINER
  // ==========================================================

  container: {
    padding: 15,
    paddingBottom: 30,
  },


  // ==========================================================
  // PAGE INTRO
  // ==========================================================

  pageIntro: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',

    elevation: 2,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  pageIntroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F0F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  pageIntroText: {
    flex: 1,
  },

  pageIntroTitle: {
    color: '#173F5F',
    fontSize: 16,
    fontWeight: '700',
  },

  pageIntroSubtitle: {
    color: '#777',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },

  totalRoomsBadge: {
    minWidth: 48,
    backgroundColor: '#F0F5F9',
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalRoomsNumber: {
    color: '#173F5F',
    fontSize: 16,
    fontWeight: '800',
  },

  totalRoomsLabel: {
    color: '#777',
    fontSize: 9,
    marginTop: 1,
  },


  // ==========================================================
  // ROOM CARD
  // ==========================================================

  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 14,

    elevation: 2,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F0F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  roomTitleContainer: {
    flex: 1,
  },

  roomName: {
    color: '#173F5F',
    fontSize: 16,
    fontWeight: '700',
  },

  roomId: {
    color: '#999',
    fontSize: 10,
    marginTop: 3,
  },

  statusBadge: {
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginLeft: 5,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },


  // ==========================================================
  // ROOM INFORMATION
  // ==========================================================

  roomInfoContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 9,
  },

  roomInfoItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 9,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  roomInfoTextContainer: {
    marginLeft: 8,
    flex: 1,
  },

  roomInfoLabel: {
    color: '#888',
    fontSize: 10,
  },

  roomInfoValue: {
    color: '#333',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },


  // ==========================================================
  // DIVIDER
  // ==========================================================

  divider: {
    height: 1,
    backgroundColor: '#E8ECF0',
    marginVertical: 14,
  },


  // ==========================================================
  // ROOM SCHEDULE HEADER
  // ==========================================================

  roomScheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  roomScheduleTitle: {
    color: '#173F5F',
    fontSize: 14,
    fontWeight: '700',
  },

  roomScheduleSubtitle: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },

  scheduleCountBadge: {
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#E8F0F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scheduleCountText: {
    color: '#173F5F',
    fontSize: 11,
    fontWeight: '800',
  },


  // ==========================================================
  // ROOM SCHEDULE
  // ==========================================================

  roomSchedulesList: {
    gap: 8,
  },

  roomScheduleCard: {
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#E2E7EC',
    borderRadius: 9,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  roomScheduleDay: {
    width: 73,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
  },

  roomScheduleDayText: {
    color: '#173F5F',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },

  roomScheduleDetails: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E7EC',
    paddingLeft: 10,
  },

  roomScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },

  roomScheduleTime: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  roomScheduleDate: {
    color: '#777',
    fontSize: 10,
    marginLeft: 6,
  },

  scheduleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  smallStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  availableDot: {
    backgroundColor: '#2E8B57',
  },

  defaultDot: {
    backgroundColor: '#A0A8B0',
  },

  scheduleStatusText: {
    color: '#777',
    fontSize: 9,
  },


  // ==========================================================
  // NO SCHEDULE
  // ==========================================================

  noScheduleBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 9,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noScheduleText: {
    color: '#888',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },


  // ==========================================================
  // EMPTY ROOMS
  // ==========================================================

  emptyRooms: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',

    elevation: 2,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  emptyRoomsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyRoomsTitle: {
    color: '#173F5F',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 15,
  },

  emptyRoomsText: {
    color: '#888',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },

  emptyAddButton: {
    backgroundColor: '#173F5F',
    minHeight: 45,
    borderRadius: 9,
    paddingHorizontal: 18,
    marginTop: 17,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyAddButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },


  // ==========================================================
  // ADD ROOM MODAL
  // ==========================================================

  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  addModalKeyboard: {
    maxHeight: '94%',
  },

  addModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  addModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  addModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  addModalIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F0F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  addModalTitle: {
    color: '#173F5F',
    fontSize: 18,
    fontWeight: '700',
  },

  addModalSubtitle: {
    color: '#777',
    fontSize: 11,
    marginTop: 2,
  },


  // ==========================================================
  // FORM SECTION
  // ==========================================================

  formSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },

  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  formSectionTitle: {
    color: '#173F5F',
    fontSize: 15,
    fontWeight: '700',
  },

  formSectionSubtitle: {
    color: '#888',
    fontSize: 10,
    marginTop: 3,
    lineHeight: 15,
  },

  formScheduleCount: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#E8F0F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  formScheduleCountText: {
    color: '#173F5F',
    fontSize: 11,
    fontWeight: '800',
  },


  // ==========================================================
  // INPUT
  // ==========================================================

  label: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
    marginTop: 4,
  },

  inputContainer: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D9DEE4',
    borderRadius: 9,
    backgroundColor: '#FAFBFC',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 13,

    marginBottom: 13,
  },

  input: {
    flex: 1,
    color: '#222',
    fontSize: 14,
    paddingVertical: 10,
    marginLeft: 9,
  },


  // ==========================================================
  // ADD SCHEDULE
  // ==========================================================

  addScheduleButton: {
    backgroundColor: '#173F5F',
    minHeight: 48,
    borderRadius: 9,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 13,
  },

  addScheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 7,
  },


  // ==========================================================
  // EMPTY SCHEDULE
  // ==========================================================

  emptySchedule: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 22,
    paddingHorizontal: 15,
  },

  emptyTitle: {
    color: '#555',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },

  emptyText: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },


  // ==========================================================
  // SCHEDULE CARD
  // ==========================================================

  scheduleList: {
    gap: 9,
  },

  scheduleCard: {
    borderWidth: 1,
    borderColor: '#E1E6EB',
    backgroundColor: '#FAFBFC',
    borderRadius: 10,

    padding: 11,

    flexDirection: 'row',
    alignItems: 'center',
  },

  scheduleDayBox: {
    width: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scheduleDay: {
    color: '#173F5F',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
    textAlign: 'center',
  },

  scheduleDetails: {
    flex: 1,
    marginLeft: 7,
  },

  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },

  scheduleTime: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  scheduleDate: {
    color: '#666',
    fontSize: 10,
    marginLeft: 6,
  },

  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },


  // ==========================================================
  // SAVE BUTTON
  // ==========================================================

  saveButton: {
    backgroundColor: '#173F5F',
    minHeight: 52,
    borderRadius: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 3,
  },

  disabledButton: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },


  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    maxHeight: '90%',

    paddingHorizontal: 18,
    paddingTop: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 17,
  },

  modalTitle: {
    color: '#173F5F',
    fontSize: 18,
    fontWeight: '700',
  },

  modalSubtitle: {
    color: '#777',
    fontSize: 12,
    marginTop: 3,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },


  // ==========================================================
  // MODAL LABEL
  // ==========================================================

  modalLabel: {
    color: '#333',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 5,
  },


  // ==========================================================
  // DAYS
  // ==========================================================

  daysContainer: {
    paddingBottom: 7,
  },

  dayButton: {
    minWidth: 50,
    height: 42,

    borderRadius: 9,

    borderWidth: 1,
    borderColor: '#D7DDE3',

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 7,
  },

  selectedDayButton: {
    backgroundColor: '#173F5F',
    borderColor: '#173F5F',
  },

  dayButtonText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },

  selectedDayButtonText: {
    color: '#FFFFFF',
  },


  // ==========================================================
  // HELPER
  // ==========================================================

  helperText: {
    color: '#888',
    fontSize: 11,
    marginTop: -7,
    marginBottom: 10,
  },


  // ==========================================================
  // AVAILABLE BOX
  // ==========================================================

  availableBox: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#EFFAF3',

    borderWidth: 1,
    borderColor: '#CBEBD5',

    borderRadius: 9,

    padding: 12,

    marginTop: 3,
    marginBottom: 15,
  },

  availableTextContainer: {
    marginLeft: 9,
    flex: 1,
  },

  availableTitle: {
    color: '#267A48',
    fontSize: 13,
    fontWeight: '700',
  },

  availableDescription: {
    color: '#5C8068',
    fontSize: 11,
    marginTop: 2,
  },


  // ==========================================================
  // MODAL ADD BUTTON
  // ==========================================================

  modalAddButton: {
    height: 49,
    borderRadius: 9,

    backgroundColor: '#173F5F',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalAddButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 7,
  },

  modalBottomSpace: {
    height: 25,
  },


  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpace: {
    height: 20,
  },
});


export default AdminAddLTRoom;




























//Only for Add Venue
// import React, {useState} from 'react';

// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   Modal,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import {BASE_URL} from '../../config/api'


// // ============================================================
// // DAYS
// // ============================================================

// const DAYS = [
//   'Monday',
//   'Tuesday',
//   'Wednesday',
//   'Thursday',
//   'Friday',
//   'Saturday',
//   'Sunday',
// ];


// // ============================================================
// // MAIN SCREEN
// // ============================================================

// const AdminAddLTRoom = ({navigation}) => {

//   // ============================================================
//   // ROOM DATA
//   // ============================================================

//   const [roomName, setRoomName] = useState('');
//   const [capacity, setCapacity] = useState('');


//   // ============================================================
//   // SCHEDULE DATA
//   // ============================================================

//   const [schedules, setSchedules] = useState([]);

//   const [selectedDay, setSelectedDay] = useState('Monday');

//   const [time, setTime] = useState('');

//   const [startDate, setStartDate] = useState('');

//   const [endDate, setEndDate] = useState('');


//   // ============================================================
//   // MODAL
//   // ============================================================

//   const [scheduleModalVisible, setScheduleModalVisible] =
//     useState(false);


//   // ============================================================
//   // LOADING
//   // ============================================================

//   const [loading, setLoading] = useState(false);


//   // ============================================================
//   // OPEN SCHEDULE POPUP
//   // ============================================================

//   const openSchedulePopup = () => {

//     if (!roomName.trim()) {
//       Alert.alert(
//         'Required',
//         'Please enter venue name first.',
//       );

//       return;
//     }

//     if (!capacity.trim()) {
//       Alert.alert(
//         'Required',
//         'Please enter venue capacity first.',
//       );

//       return;
//     }

//     if (parseInt(capacity, 10) <= 0) {
//       Alert.alert(
//         'Invalid Capacity',
//         'Capacity must be greater than 0.',
//       );

//       return;
//     }

//     setScheduleModalVisible(true);
//   };


//   // ============================================================
//   // RESET SCHEDULE FORM
//   // ============================================================

//   const resetScheduleForm = () => {

//     setSelectedDay('Monday');

//     setTime('');

//     setStartDate('');

//     setEndDate('');
//   };


//   // ============================================================
//   // ADD SCHEDULE TO LIST
//   // ============================================================

//   const addSchedule = () => {

//     // ----------------------------------------------------------
//     // Validate Time
//     // ----------------------------------------------------------

//     if (!time.trim()) {

//       Alert.alert(
//         'Required',
//         'Please enter schedule time.',
//       );

//       return;
//     }


//     // ----------------------------------------------------------
//     // Validate Start Date
//     // ----------------------------------------------------------

//     if (!startDate.trim()) {

//       Alert.alert(
//         'Required',
//         'Please enter start date.',
//       );

//       return;
//     }


//     // ----------------------------------------------------------
//     // Validate End Date
//     // ----------------------------------------------------------

//     if (!endDate.trim()) {

//       Alert.alert(
//         'Required',
//         'Please enter end date.',
//       );

//       return;
//     }


//     // ----------------------------------------------------------
//     // Date Format Validation
//     // Expected:
//     // YYYY-MM-DD
//     // ----------------------------------------------------------

//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

//     if (!dateRegex.test(startDate.trim())) {

//       Alert.alert(
//         'Invalid Date',
//         'Start date must be in YYYY-MM-DD format.\n\nExample: 2026-10-05',
//       );

//       return;
//     }

//     if (!dateRegex.test(endDate.trim())) {

//       Alert.alert(
//         'Invalid Date',
//         'End date must be in YYYY-MM-DD format.\n\nExample: 2027-02-28',
//       );

//       return;
//     }


//     // ----------------------------------------------------------
//     // Check Date Order
//     // ----------------------------------------------------------

//     if (
//       new Date(startDate.trim()) >
//       new Date(endDate.trim())
//     ) {

//       Alert.alert(
//         'Invalid Date',
//         'Start date cannot be greater than end date.',
//       );

//       return;
//     }


//     // ----------------------------------------------------------
//     // Check Duplicate Day + Time
//     // ----------------------------------------------------------

//     const duplicate = schedules.some(
//       item =>
//         item.day.toLowerCase() ===
//           selectedDay.toLowerCase() &&
//         item.time.toLowerCase() ===
//           time.trim().toLowerCase(),
//     );

//     if (duplicate) {

//       Alert.alert(
//         'Duplicate Schedule',
//         'This day and time schedule has already been added.',
//       );

//       return;
//     }


//     // ----------------------------------------------------------
//     // Create Schedule Object
//     // ----------------------------------------------------------

//     const newSchedule = {
//       day: selectedDay,
//       time: time.trim(),
//       startDate: startDate.trim(),
//       endDate: endDate.trim(),
//     };


//     // ----------------------------------------------------------
//     // Add Schedule
//     // ----------------------------------------------------------

//     setSchedules(prev => [
//       ...prev,
//       newSchedule,
//     ]);


//     // ----------------------------------------------------------
//     // Reset Form
//     // ----------------------------------------------------------

//     resetScheduleForm();

//     setScheduleModalVisible(false);


//     Alert.alert(
//       'Schedule Added',
//       `${selectedDay} schedule has been added successfully.`,
//     );
//   };


//   // ============================================================
//   // REMOVE SCHEDULE
//   // ============================================================

//   const removeSchedule = index => {

//     Alert.alert(
//       'Remove Schedule',
//       'Are you sure you want to remove this schedule?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },

//         {
//           text: 'Remove',
//           style: 'destructive',

//           onPress: () => {

//             setSchedules(prev =>
//               prev.filter(
//                 (_, scheduleIndex) =>
//                   scheduleIndex !== index,
//               ),
//             );
//           },
//         },
//       ],
//     );
//   };


//   // ============================================================
//   // FORMAT DATE FOR API
//   // ============================================================

//   const formatDateForApi = date => {

//     if (!date) {
//       return null;
//     }

//     return date.trim();
//   };


//   // ============================================================
//   // SAVE LT ROOM
//   // ============================================================

//   const saveLTRoom = async () => {

//     // ----------------------------------------------------------
//     // Validate Room Name
//     // ----------------------------------------------------------

//     if (!roomName.trim()) {

//       Alert.alert(
//         'Required',
//         'Please enter venue name.',
//       );

//       return;
//     }


//     // ----------------------------------------------------------
//     // Validate Capacity
//     // ----------------------------------------------------------

//     if (!capacity.trim()) {

//       Alert.alert(
//         'Required',
//         'Please enter venue capacity.',
//       );

//       return;
//     }


//     const numericCapacity = parseInt(
//       capacity.trim(),
//       10,
//     );

//     if (
//       isNaN(numericCapacity) ||
//       numericCapacity <= 0
//     ) {

//       Alert.alert(
//         'Invalid Capacity',
//         'Please enter a valid capacity greater than 0.',
//       );

//       return;
//     }


//     // ----------------------------------------------------------
//     // Backend Requires At Least One Schedule
//     // ----------------------------------------------------------

//     if (schedules.length === 0) {

//       Alert.alert(
//         'Schedule Required',
//         'Please add at least one available schedule.',
//       );

//       return;
//     }


//     try {

//       setLoading(true);


//       // ========================================================
//       // GET TOKEN
//       // ========================================================

//       const token = await AsyncStorage.getItem('token');

//       if (!token) {

//         setLoading(false);

//         Alert.alert(
//           'Session Expired',
//           'Please login again.',
//         );

//         return;
//       }


//       // ========================================================
//       // API BODY
//       // ========================================================

//       const body = {
//         roomName: roomName.trim(),

//         capacity: numericCapacity,

//         schedules: schedules.map(item => ({
//           day: item.day,

//           time: item.time,

//           startDate: formatDateForApi(
//             item.startDate,
//           ),

//           endDate: formatDateForApi(
//             item.endDate,
//           ),
//         })),
//       };


//       console.log(
//         '========================================',
//       );

//       console.log(
//         'ADD LT ROOM',
//       );

//       console.log(
//         'API:',
//         `${BASE_URL}/Admin/add-lt-room`,
//       );

//       console.log(
//         'Request Body:',
//         body,
//       );

//       console.log(
//         '========================================',
//       );


//       // ========================================================
//       // API REQUEST
//       // ========================================================

//       const response = await fetch(
//         `${BASE_URL}/Admin/add-lt-room`,
//         {
//           method: 'POST',

//           headers: {
//             'Content-Type': 'application/json',

//             Authorization: `Bearer ${token}`,
//           },

//           body: JSON.stringify(body),
//         },
//       );


//       // ========================================================
//       // READ RESPONSE
//       // ========================================================

//       const responseText = await response.text();

//       console.log(
//         'API Status:',
//         response.status,
//       );

//       console.log(
//         'API Response:',
//         responseText,
//       );


//       let data = {};

//       try {

//         data = responseText
//           ? JSON.parse(responseText)
//           : {};

//       } catch (error) {

//         data = {};
//       }


//       // ========================================================
//       // SUCCESS
//       // ========================================================

//       if (response.ok) {

//         Alert.alert(
//           'Success',
//           data.message ||
//             'Venue and schedule added successfully.',
//           [
//             {
//               text: 'OK',

//               onPress: () => {

//                 setRoomName('');

//                 setCapacity('');

//                 setSchedules([]);

//                 if (navigation) {

//                   navigation.goBack();
//                 }
//               },
//             },
//           ],
//         );

//         return;
//       }


//       // ========================================================
//       // ERROR
//       // ========================================================

//       let errorMessage =
//         'Unable to add venue.';


//       if (data.message) {

//         errorMessage = data.message;

//       } else if (data.error) {

//         errorMessage = data.error;

//       } else if (responseText) {

//         errorMessage = responseText;
//       }


//       Alert.alert(
//         'Error',
//         errorMessage,
//       );

//     } catch (error) {

//       console.log(
//         'ADD LT ROOM ERROR:',
//         error,
//       );

//       Alert.alert(
//         'Network Error',
//         'Unable to connect with server. Please check your backend and network connection.',
//       );

//     } finally {

//       setLoading(false);
//     }
//   };


//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <SafeAreaView style={styles.safeArea}>

//       <StatusBar
//         barStyle="light-content"
//         backgroundColor="#173F5F"
//       />


//       {/* ======================================================
//           HEADER
//       ====================================================== */}

//       <View style={styles.header}>

//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation?.goBack()}
//         >

//           <MaterialIcons
//             name="arrow-back"
//             size={24}
//             color="#FFFFFF"
//           />

//         </TouchableOpacity>


//         <View style={styles.headerTextContainer}>

//           <Text style={styles.headerTitle}>
//             Add New Venue
//           </Text>

//           <Text style={styles.headerSubtitle}>
//             Add LT / Learning Venue
//           </Text>

//         </View>

//       </View>


//       {/* ======================================================
//           MAIN CONTENT
//       ====================================================== */}

//       <KeyboardAvoidingView
//         style={styles.flex}
//         behavior={
//           Platform.OS === 'ios'
//             ? 'padding'
//             : undefined
//         }
//       >

//         <ScrollView
//           contentContainerStyle={styles.container}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >


//           {/* ==================================================
//               VENUE INFORMATION
//           ================================================== */}

//           <View style={styles.section}>

//             <View style={styles.sectionHeader}>

//               <View style={styles.iconCircle}>

//                 <MaterialIcons
//                   name="meeting-room"
//                   size={22}
//                   color="#173F5F"
//                 />

//               </View>

//               <View>

//                 <Text style={styles.sectionTitle}>
//                   Venue Information
//                 </Text>

//                 <Text style={styles.sectionSubtitle}>
//                   Enter basic venue details
//                 </Text>

//               </View>

//             </View>


//             {/* Venue Name */}

//             <Text style={styles.label}>
//               Venue Name
//             </Text>

//             <View style={styles.inputContainer}>

//               <MaterialIcons
//                 name="meeting-room"
//                 size={21}
//                 color="#777"
//               />

//               <TextInput
//                 style={styles.input}
//                 placeholder="e.g. LT Room 1"
//                 placeholderTextColor="#999"
//                 value={roomName}
//                 onChangeText={setRoomName}
//               />

//             </View>


//             {/* Capacity */}

//             <Text style={styles.label}>
//               Capacity
//             </Text>

//             <View style={styles.inputContainer}>

//               <MaterialIcons
//                 name="groups"
//                 size={21}
//                 color="#777"
//               />

//               <TextInput
//                 style={styles.input}
//                 placeholder="e.g. 10"
//                 placeholderTextColor="#999"
//                 keyboardType="numeric"
//                 value={capacity}
//                 onChangeText={setCapacity}
//               />

//             </View>

//           </View>


//           {/* ==================================================
//               AVAILABLE SCHEDULE
//           ================================================== */}

//           <View style={styles.section}>

//             <View style={styles.sectionHeader}>

//               <View style={styles.iconCircle}>

//                 <MaterialIcons
//                   name="event-available"
//                   size={22}
//                   color="#173F5F"
//                 />

//               </View>

//               <View style={styles.scheduleHeaderText}>

//                 <Text style={styles.sectionTitle}>
//                   Available Schedule
//                 </Text>

//                 <Text style={styles.sectionSubtitle}>
//                   Add the days and times when this venue is available
//                 </Text>

//               </View>

//             </View>


//             {/* Add Schedule Button */}

//             <TouchableOpacity
//               style={styles.addScheduleButton}
//               onPress={openSchedulePopup}
//               activeOpacity={0.8}
//             >

//               <MaterialIcons
//                 name="add"
//                 size={23}
//                 color="#FFFFFF"
//               />

//               <Text style={styles.addScheduleButtonText}>
//                 Add Schedule
//               </Text>

//             </TouchableOpacity>


//             {/* =================================================
//                 SCHEDULE LIST
//             ================================================= */}

//             {schedules.length === 0 ? (

//               <View style={styles.emptySchedule}>

//                 <MaterialIcons
//                   name="event-note"
//                   size={40}
//                   color="#B8C0C8"
//                 />

//                 <Text style={styles.emptyTitle}>
//                   No Schedule Added
//                 </Text>

//                 <Text style={styles.emptyText}>
//                   Add at least one available day and time.
//                 </Text>

//               </View>

//             ) : (

//               <View style={styles.scheduleList}>

//                 {schedules.map((item, index) => (

//                   <View
//                     key={`${item.day}-${index}`}
//                     style={styles.scheduleCard}
//                   >

//                     <View style={styles.scheduleDayBox}>

//                       <MaterialIcons
//                         name="calendar-today"
//                         size={21}
//                         color="#173F5F"
//                       />

//                       <Text style={styles.scheduleDay}>
//                         {item.day}
//                       </Text>

//                     </View>


//                     <View style={styles.scheduleDetails}>

//                       <View style={styles.scheduleRow}>

//                         <MaterialIcons
//                           name="access-time"
//                           size={18}
//                           color="#666"
//                         />

//                         <Text style={styles.scheduleTime}>
//                           {item.time}
//                         </Text>

//                       </View>


//                       <View style={styles.scheduleRow}>

//                         <MaterialIcons
//                           name="date-range"
//                           size={18}
//                           color="#666"
//                         />

//                         <Text style={styles.scheduleDate}>
//                           {item.startDate} → {item.endDate}
//                         </Text>

//                       </View>

//                     </View>


//                     {/* Remove */}

//                     <TouchableOpacity
//                       style={styles.deleteButton}
//                       onPress={() =>
//                         removeSchedule(index)
//                       }
//                     >

//                       <MaterialIcons
//                         name="delete-outline"
//                         size={22}
//                         color="#D64545"
//                       />

//                     </TouchableOpacity>

//                   </View>

//                 ))}

//               </View>

//             )}

//           </View>


//           {/* ==================================================
//               SAVE BUTTON
//           ================================================== */}

//           <TouchableOpacity
//             style={[
//               styles.saveButton,

//               loading &&
//                 styles.disabledButton,
//             ]}
//             onPress={saveLTRoom}
//             disabled={loading}
//             activeOpacity={0.8}
//           >

//             {loading ? (

//               <ActivityIndicator
//                 size="small"
//                 color="#FFFFFF"
//               />

//             ) : (

//               <MaterialIcons
//                 name="save"
//                 size={22}
//                 color="#FFFFFF"
//               />

//             )}

//             <Text style={styles.saveButtonText}>

//               {loading
//                 ? 'Saving Venue...'
//                 : 'Save Venue'}

//             </Text>

//           </TouchableOpacity>


//           <View style={styles.bottomSpace} />

//         </ScrollView>

//       </KeyboardAvoidingView>


//       {/* ======================================================
//           SCHEDULE MODAL
//       ====================================================== */}

//       <Modal
//         visible={scheduleModalVisible}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() =>
//           setScheduleModalVisible(false)
//         }
//       >

//         <View style={styles.modalOverlay}>

//           <View style={styles.modalContainer}>


//             {/* =================================================
//                 MODAL HEADER
//             ================================================= */}

//             <View style={styles.modalHeader}>

//               <View>

//                 <Text style={styles.modalTitle}>
//                   Add Available Schedule
//                 </Text>

//                 <Text style={styles.modalSubtitle}>
//                   Set venue availability
//                 </Text>

//               </View>


//               <TouchableOpacity
//                 style={styles.modalCloseButton}
//                 onPress={() =>
//                   setScheduleModalVisible(false)
//                 }
//               >

//                 <MaterialIcons
//                   name="close"
//                   size={23}
//                   color="#555"
//                 />

//               </TouchableOpacity>

//             </View>


//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               keyboardShouldPersistTaps="handled"
//             >


//               {/* ==============================================
//                   DAY
//               ============================================== */}

//               <Text style={styles.modalLabel}>
//                 Day
//               </Text>

//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={
//                   styles.daysContainer
//                 }
//               >

//                 {DAYS.map(day => (

//                   <TouchableOpacity
//                     key={day}
//                     style={[
//                       styles.dayButton,

//                       selectedDay === day &&
//                         styles.selectedDayButton,
//                     ]}
//                     onPress={() =>
//                       setSelectedDay(day)
//                     }
//                   >

//                     <Text
//                       style={[
//                         styles.dayButtonText,

//                         selectedDay === day &&
//                           styles.selectedDayButtonText,
//                       ]}
//                     >
//                       {day.substring(0, 3)}
//                     </Text>

//                   </TouchableOpacity>

//                 ))}

//               </ScrollView>


//               {/* ==============================================
//                   TIME
//               ============================================== */}

//               <Text style={styles.modalLabel}>
//                 Time
//               </Text>

//               <View style={styles.inputContainer}>

//                 <MaterialIcons
//                   name="access-time"
//                   size={21}
//                   color="#777"
//                 />

//                 <TextInput
//                   style={styles.input}
//                   placeholder="e.g. 9:00-10:00 am"
//                   placeholderTextColor="#999"
//                   value={time}
//                   onChangeText={setTime}
//                 />

//               </View>

//               <Text style={styles.helperText}>
//                 Example: 9:00-10:00 am
//               </Text>


//               {/* ==============================================
//                   START DATE
//               ============================================== */}

//               <Text style={styles.modalLabel}>
//                 Start Date
//               </Text>

//               <View style={styles.inputContainer}>

//                 <MaterialIcons
//                   name="date-range"
//                   size={21}
//                   color="#777"
//                 />

//                 <TextInput
//                   style={styles.input}
//                   placeholder="YYYY-MM-DD"
//                   placeholderTextColor="#999"
//                   value={startDate}
//                   onChangeText={setStartDate}
//                   keyboardType="numbers-and-punctuation"
//                 />

//               </View>


//               {/* ==============================================
//                   END DATE
//               ============================================== */}

//               <Text style={styles.modalLabel}>
//                 End Date
//               </Text>

//               <View style={styles.inputContainer}>

//                 <MaterialIcons
//                   name="date-range"
//                   size={21}
//                   color="#777"
//                 />

//                 <TextInput
//                   style={styles.input}
//                   placeholder="YYYY-MM-DD"
//                   placeholderTextColor="#999"
//                   value={endDate}
//                   onChangeText={setEndDate}
//                   keyboardType="numbers-and-punctuation"
//                 />

//               </View>


//               {/* ==============================================
//                   STATUS INFORMATION
//               ============================================== */}

//               <View style={styles.availableBox}>

//                 <MaterialIcons
//                   name="check-circle"
//                   size={21}
//                   color="#2E8B57"
//                 />

//                 <View style={styles.availableTextContainer}>

//                   <Text style={styles.availableTitle}>
//                     Available
//                   </Text>

//                   <Text style={styles.availableDescription}>
//                     This schedule will be saved as available.
//                   </Text>

//                 </View>

//               </View>


//               {/* ==============================================
//                   MODAL BUTTON
//               ============================================== */}

//               <TouchableOpacity
//                 style={styles.modalAddButton}
//                 onPress={addSchedule}
//                 activeOpacity={0.8}
//               >

//                 <MaterialIcons
//                   name="add"
//                   size={22}
//                   color="#FFFFFF"
//                 />

//                 <Text style={styles.modalAddButtonText}>
//                   Add Schedule
//                 </Text>

//               </TouchableOpacity>


//               <View style={styles.modalBottomSpace} />

//             </ScrollView>

//           </View>

//         </View>

//       </Modal>

//     </SafeAreaView>
//   );
// };


// // ============================================================
// // STYLES
// // ============================================================

// const styles = StyleSheet.create({

//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },

//   flex: {
//     flex: 1,
//   },


//   // ==========================================================
//   // HEADER
//   // ==========================================================

//   header: {
//     backgroundColor: '#173F5F',
//     minHeight: 72,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },

//   backButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },

//   headerTextContainer: {
//     flex: 1,
//   },

//   headerTitle: {
//     color: '#FFFFFF',
//     fontSize: 20,
//     fontWeight: '700',
//   },

//   headerSubtitle: {
//     color: '#D9E5EE',
//     fontSize: 12,
//     marginTop: 2,
//   },


//   // ==========================================================
//   // CONTAINER
//   // ==========================================================

//   container: {
//     padding: 16,
//     paddingBottom: 30,
//   },


//   // ==========================================================
//   // SECTION
//   // ==========================================================

//   section: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 15,

//     elevation: 2,

//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 5,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//   },

//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 18,
//   },

//   iconCircle: {
//     width: 43,
//     height: 43,
//     borderRadius: 22,
//     backgroundColor: '#E8F0F6',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 11,
//   },

//   scheduleHeaderText: {
//     flex: 1,
//   },

//   sectionTitle: {
//     color: '#173F5F',
//     fontSize: 17,
//     fontWeight: '700',
//   },

//   sectionSubtitle: {
//     color: '#777',
//     fontSize: 12,
//     marginTop: 3,
//     lineHeight: 17,
//   },


//   // ==========================================================
//   // INPUT
//   // ==========================================================

//   label: {
//     color: '#333',
//     fontSize: 13,
//     fontWeight: '600',
//     marginBottom: 7,
//     marginTop: 4,
//   },

//   inputContainer: {
//     minHeight: 48,
//     borderWidth: 1,
//     borderColor: '#D9DEE4',
//     borderRadius: 9,
//     backgroundColor: '#FAFBFC',

//     flexDirection: 'row',
//     alignItems: 'center',

//     paddingHorizontal: 13,

//     marginBottom: 13,
//   },

//   input: {
//     flex: 1,
//     color: '#222',
//     fontSize: 14,
//     paddingVertical: 10,
//     marginLeft: 9,
//   },


//   // ==========================================================
//   // ADD SCHEDULE
//   // ==========================================================

//   addScheduleButton: {
//     backgroundColor: '#173F5F',
//     minHeight: 48,
//     borderRadius: 9,

//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',

//     marginBottom: 15,
//   },

//   addScheduleButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '700',
//     marginLeft: 7,
//   },


//   // ==========================================================
//   // EMPTY SCHEDULE
//   // ==========================================================

//   emptySchedule: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F8FAFC',
//     borderRadius: 10,
//     paddingVertical: 25,
//     paddingHorizontal: 15,
//   },

//   emptyTitle: {
//     color: '#555',
//     fontSize: 14,
//     fontWeight: '700',
//     marginTop: 8,
//   },

//   emptyText: {
//     color: '#888',
//     fontSize: 12,
//     marginTop: 4,
//     textAlign: 'center',
//   },


//   // ==========================================================
//   // SCHEDULE CARD
//   // ==========================================================

//   scheduleList: {
//     gap: 10,
//   },

//   scheduleCard: {
//     borderWidth: 1,
//     borderColor: '#E1E6EB',
//     backgroundColor: '#FAFBFC',
//     borderRadius: 10,

//     padding: 12,

//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   scheduleDayBox: {
//     width: 72,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   scheduleDay: {
//     color: '#173F5F',
//     fontSize: 12,
//     fontWeight: '700',
//     marginTop: 5,
//     textAlign: 'center',
//   },

//   scheduleDetails: {
//     flex: 1,
//     marginLeft: 8,
//   },

//   scheduleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 2,
//   },

//   scheduleTime: {
//     color: '#333',
//     fontSize: 13,
//     fontWeight: '600',
//     marginLeft: 6,
//   },

//   scheduleDate: {
//     color: '#666',
//     fontSize: 11,
//     marginLeft: 6,
//   },

//   deleteButton: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: '#FFF1F1',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 5,
//   },


//   // ==========================================================
//   // SAVE BUTTON
//   // ==========================================================

//   saveButton: {
//     backgroundColor: '#173F5F',
//     minHeight: 52,
//     borderRadius: 10,

//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',

//     marginTop: 3,
//   },

//   disabledButton: {
//     opacity: 0.65,
//   },

//   saveButtonText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '700',
//     marginLeft: 8,
//   },

//   bottomSpace: {
//     height: 20,
//   },


//   // ==========================================================
//   // MODAL
//   // ==========================================================

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.45)',
//     justifyContent: 'flex-end',
//   },

//   modalContainer: {
//     backgroundColor: '#FFFFFF',

//     borderTopLeftRadius: 22,
//     borderTopRightRadius: 22,

//     maxHeight: '90%',

//     paddingHorizontal: 18,
//     paddingTop: 18,
//   },

//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',

//     marginBottom: 17,
//   },

//   modalTitle: {
//     color: '#173F5F',
//     fontSize: 18,
//     fontWeight: '700',
//   },

//   modalSubtitle: {
//     color: '#777',
//     fontSize: 12,
//     marginTop: 3,
//   },

//   modalCloseButton: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: '#F1F3F5',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },


//   // ==========================================================
//   // MODAL LABEL
//   // ==========================================================

//   modalLabel: {
//     color: '#333',
//     fontSize: 13,
//     fontWeight: '700',
//     marginBottom: 8,
//     marginTop: 5,
//   },


//   // ==========================================================
//   // DAYS
//   // ==========================================================

//   daysContainer: {
//     paddingBottom: 7,
//   },

//   dayButton: {
//     minWidth: 50,
//     height: 42,

//     borderRadius: 9,

//     borderWidth: 1,
//     borderColor: '#D7DDE3',

//     backgroundColor: '#FFFFFF',

//     alignItems: 'center',
//     justifyContent: 'center',

//     marginRight: 7,
//   },

//   selectedDayButton: {
//     backgroundColor: '#173F5F',
//     borderColor: '#173F5F',
//   },

//   dayButtonText: {
//     color: '#555',
//     fontSize: 12,
//     fontWeight: '600',
//   },

//   selectedDayButtonText: {
//     color: '#FFFFFF',
//   },


//   // ==========================================================
//   // HELPER
//   // ==========================================================

//   helperText: {
//     color: '#888',
//     fontSize: 11,
//     marginTop: -7,
//     marginBottom: 10,
//   },


//   // ==========================================================
//   // AVAILABLE BOX
//   // ==========================================================

//   availableBox: {
//     flexDirection: 'row',
//     alignItems: 'center',

//     backgroundColor: '#EFFAF3',

//     borderWidth: 1,
//     borderColor: '#CBEBD5',

//     borderRadius: 9,

//     padding: 12,

//     marginTop: 3,
//     marginBottom: 15,
//   },

//   availableTextContainer: {
//     marginLeft: 9,
//     flex: 1,
//   },

//   availableTitle: {
//     color: '#267A48',
//     fontSize: 13,
//     fontWeight: '700',
//   },

//   availableDescription: {
//     color: '#5C8068',
//     fontSize: 11,
//     marginTop: 2,
//   },


//   // ==========================================================
//   // MODAL ADD BUTTON
//   // ==========================================================

//   modalAddButton: {
//     height: 49,
//     borderRadius: 9,

//     backgroundColor: '#173F5F',

//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   modalAddButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '700',
//     marginLeft: 7,
//   },

//   modalBottomSpace: {
//     height: 25,
//   },
// });


// export default AdminAddLTRoom;
