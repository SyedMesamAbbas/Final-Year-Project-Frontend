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
  LayoutAnimation,
  UIManager,
  Image,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {BASE_URL} from '../../config/api';
import colors from '../utils/colors';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================
// CONSTANTS FOR SCHEDULE GRID
// ============================================================

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAYS_FULL = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

const TIME_SLOTS = [
  '8:00-9:00 am',
  '9:00-10:00 am',
  '10:00-11:00 am',
  '11:00-12:00 pm',
  '12:00-1:00 pm',
  '1:00-2:00 pm',
  '2:00-3:00 pm',
  '3:00-4:00 pm',
  '4:00-5:00 pm',
  '5:00-6:00 pm',
  '6:00-7:00 pm',
  '7:00-8:00 pm',
  '8:00-9:00 pm',
  '9:00-10:00 pm',
];

// ============================================================
// MAIN SCREEN
// ============================================================

const AdminVenueManagement = ({navigation}) => {
  // ============================================================
  // LT ROOM LIST & EXPANDABLE STATES
  // ============================================================

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRoomIds, setExpandedRoomIds] = useState({});

  // ============================================================
  // ADD ROOM MODAL & FORM DATA
  // ============================================================

  const [addRoomModalVisible, setAddRoomModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState('');

  // ============================================================
  // SCHEDULE DATA & GRID STATE
  // ============================================================

  const [schedules, setSchedules] = useState([]);

  // Selected slots stored as key "DayIndex-SlotIndex"
  // Example: "0-2"
  const [selectedSlots, setSelectedSlots] = useState({});

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ============================================================
  // SCHEDULE MODAL & SAVING STATE
  // ============================================================

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);

  // ============================================================
  // GET TOKEN
  // ============================================================

  const getToken = async () => {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      Alert.alert('Session Expired', 'Please login again.');
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

      const token = await getToken();

      if (!token) {
        setRoomsLoading(false);
        return;
      }

      const url = `${BASE_URL}/Admin/get-lt-rooms`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        console.log('JSON PARSE ERROR:', error);
        data = {};
      }

      if (response.ok) {
        const roomList = Array.isArray(data.rooms) ? data.rooms : [];

        setRooms(roomList);
        return;
      }

      const errorMessage =
        data.message ||
        data.error ||
        responseText ||
        'Unable to load LT Rooms.';

      Alert.alert('Error', errorMessage);
    } catch (error) {
      console.log('GET LT ROOMS ERROR:', error);

      Alert.alert(
        'Network Error',
        'Unable to connect with server. Please check your backend and network connection.',
      );
    } finally {
      setRoomsLoading(false);
    }
  }, []);

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
  // ACCORDION / TOGGLE ROOM SCHEDULE
  // ============================================================

  const toggleRoomExpand = roomId => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpandedRoomIds(prev => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  // ============================================================
  // MODAL CONTROLS & FORM RESETS
  // ============================================================

  const openAddRoomModal = () => {
    resetRoomForm();
    setAddRoomModalVisible(true);
  };

  const closeAddRoomModal = () => {
    if (savingRoom) {
      return;
    }

    setAddRoomModalVisible(false);
    resetRoomForm();
  };

  const resetRoomForm = () => {
    setRoomName('');
    setCapacity('');
    setSchedules([]);
    setSelectedSlots({});
    setStartDate('');
    setEndDate('');
  };

  // ============================================================
  // OPEN SCHEDULE GRID
  // ============================================================

  const openSchedulePopup = () => {
    if (!roomName.trim()) {
      Alert.alert('Required', 'Please enter venue name first.');
      return;
    }

    if (!capacity.trim()) {
      Alert.alert('Required', 'Please enter venue capacity first.');
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
  // GRID SLOT TOGGLE & ACTIONS
  // ============================================================

  const toggleSlot = (dayIdx, slotIdx) => {
    const key = `${dayIdx}-${slotIdx}`;

    setSelectedSlots(prev => {
      const updated = {...prev};

      if (updated[key]) {
        delete updated[key];
      } else {
        updated[key] = true;
      }

      return updated;
    });
  };

  const clearAllSlots = () => {
    setSelectedSlots({});
  };

  // ============================================================
  // CONFIRM GRID SCHEDULE
  // ============================================================

  const confirmGridSchedule = () => {
    const selectedKeys = Object.keys(selectedSlots);

    if (selectedKeys.length === 0) {
      Alert.alert(
        'No Slot Selected',
        'Please click on one or more slots in the grid.',
      );

      return;
    }

    const newSchedules = selectedKeys.map(key => {
      const [dayIdx, slotIdx] = key.split('-').map(Number);

      return {
        day: DAYS_FULL[DAYS_SHORT[dayIdx]],
        time: TIME_SLOTS[slotIdx],
        startDate: startDate.trim() || null,
        endDate: endDate.trim() || null,
      };
    });

    setSchedules(newSchedules);
    setScheduleModalVisible(false);

    Alert.alert(
      'Schedules Selected',
      `${newSchedules.length} slot(s) added to the schedule list.`,
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
              prev.filter((_, i) => i !== index),
            );
          },
        },
      ],
    );
  };

  // ============================================================
  // FORMAT DATE FOR API
  // ============================================================

  const formatDateForApi = date => (date ? date.trim() : null);

  // ============================================================
  // SAVE LT ROOM
  // ============================================================

  const saveLTRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Required', 'Please enter venue name.');
      return;
    }

    if (!capacity.trim()) {
      Alert.alert('Required', 'Please enter venue capacity.');
      return;
    }

    const numericCapacity = parseInt(capacity.trim(), 10);

    if (isNaN(numericCapacity) || numericCapacity <= 0) {
      Alert.alert(
        'Invalid Capacity',
        'Please enter a valid capacity greater than 0.',
      );

      return;
    }

    if (schedules.length === 0) {
      Alert.alert(
        'Schedule Required',
        'Please add at least one available schedule slot.',
      );

      return;
    }

    try {
      setSavingRoom(true);

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Session Expired', 'Please login again.');
        setSavingRoom(false);
        return;
      }

      const body = {
        roomName: roomName.trim(),
        capacity: numericCapacity,
        schedules: schedules.map(item => ({
          day: item.day,
          time: item.time,
          startDate: formatDateForApi(item.startDate),
          endDate: formatDateForApi(item.endDate),
        })),
      };

      const response = await fetch(`${BASE_URL}/Admin/add-lt-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        console.log('SAVE LT ROOM JSON ERROR:', error);
        data = {};
      }

      if (response.ok) {
        setAddRoomModalVisible(false);
        resetRoomForm();

        Alert.alert(
          'Success',
          data.message || 'Venue and schedule added successfully.',
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

      const errorMessage =
        data.message ||
        data.error ||
        responseText ||
        'Unable to add venue.';

      Alert.alert('Error', errorMessage);
    } catch (error) {
      console.log('ADD LT ROOM ERROR:', error);

      Alert.alert(
        'Network Error',
        'Unable to connect with server. Please check your backend and network connection.',
      );
    } finally {
      setSavingRoom(false);
    }
  };

  // ============================================================
  // RENDER ROOM SCHEDULE
  // ============================================================

  const renderRoomSchedule = (schedule, index) => (
    <View
      key={schedule.ltScheduleId || `${schedule.day}-${index}`}
      style={styles.roomScheduleCard}>
      <View style={styles.roomScheduleDay}>
        <MaterialIcons
          name="calendar-today"
          size={15}
          color={colors.primary}
        />

        <Text style={styles.roomScheduleDayText}>
          {schedule.day || 'N/A'}
        </Text>
      </View>

      <View style={styles.roomScheduleDetails}>
        <View style={styles.roomScheduleRow}>
          <MaterialIcons
            name="access-time"
            size={14}
            color="#666"
          />

          <Text style={styles.roomScheduleTime}>
            {schedule.time || 'Time not available'}
          </Text>
        </View>

        {(schedule.startDate || schedule.endDate) && (
          <View style={styles.roomScheduleRow}>
            <MaterialIcons
              name="date-range"
              size={14}
              color="#777"
            />

            <Text style={styles.roomScheduleDate}>
              {schedule.startDate || '-'} → {schedule.endDate || '-'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // ============================================================
  // RENDER ROOM
  // ============================================================

  const renderRoom = (room, index) => {
    const roomSchedules = Array.isArray(room.schedules)
      ? room.schedules
      : [];

    const roomId = room.ltRoomId || index;
    const isExpanded = !!expandedRoomIds[roomId];

    return (
      <View
        key={room.ltRoomId || `room-${index}`}
        style={styles.roomCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleRoomExpand(roomId)}
          style={styles.roomHeaderTouchable}>
          <View style={styles.roomIcon}>
            <MaterialIcons
              name="meeting-room"
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.roomTitleContainer}>
            <Text style={styles.roomName}>
              {room.roomName || 'Unnamed Venue'}
            </Text>

            <Text style={styles.roomCapacityText}>
              Capacity:{' '}
              <Text style={styles.roomCapacityVal}>
                {room.capacity || 0} Students
              </Text>
            </Text>
          </View>

          <View style={styles.dropdownIconBox}>
            <MaterialIcons
              name={
                isExpanded
                  ? 'keyboard-arrow-up'
                  : 'keyboard-arrow-down'
              }
              size={28}
              color={colors.primary}
            />
          </View>
        </TouchableOpacity>

        {/* EXPANDABLE DROPDOWN CONTENT */}
        {isExpanded && (
          <View style={styles.dropdownContent}>
            <View style={styles.divider} />

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

            {roomSchedules.length === 0 ? (
              <View style={styles.noScheduleBox}>
                <MaterialIcons
                  name="event-busy"
                  size={22}
                  color="#B0B8C0"
                />

                <Text style={styles.noScheduleText}>
                  No schedule available for this venue.
                </Text>
              </View>
            ) : (
              <View style={styles.roomSchedulesList}>
                {roomSchedules.map(renderRoomSchedule)}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // ============================================================
  // MAIN RETURN
  // ============================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* ========================================================
          HEADER
          Same clean House of Tutor header style
          ======================================================== */}

      <View style={styles.header}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}>
          <MaterialIcons
            name="arrow-back"
            size={21}
            color="#333333"
          />
        </TouchableOpacity>

        {/* LOGO + APP NAME */}
        <View style={styles.headerCenter}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <Text style={styles.logoText}>
            House of Tutor
          </Text>
        </View>
      </View>

      {/* ========================================================
          MAIN ROOM LIST
          ======================================================== */}

      {roomsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
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
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }>
          {/* PAGE INTRO */}
          <View style={styles.pageIntro}>
            <View style={styles.pageIntroIcon}>
              <MaterialIcons
                name="meeting-room"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.pageIntroText}>
              <Text style={styles.pageIntroTitle}>
                Learning Venues
              </Text>

              <Text style={styles.pageIntroSubtitle}>
                Tap a venue to expand its schedule details.
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

          {/* EMPTY STATE */}
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
                Tap the + button at the bottom to add a new
                venue.
              </Text>

              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={openAddRoomModal}
                activeOpacity={0.8}>
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
            <View>{rooms.map(renderRoom)}</View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      )}

      {/* ========================================================
          FLOATING (+) ADD BUTTON
          ======================================================== */}

      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={openAddRoomModal}
        activeOpacity={0.85}>
        <MaterialIcons
          name="add"
          size={30}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {/* ========================================================
          ADD VENUE MODAL
          ======================================================== */}

      <Modal
        visible={addRoomModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeAddRoomModal}>
        <View style={styles.addModalOverlay}>
          <KeyboardAvoidingView
            style={styles.addModalKeyboard}
            behavior={
              Platform.OS === 'ios' ? 'padding' : undefined
            }>
            <View style={styles.addModalContainer}>
              {/* MODAL HEADER */}
              <View style={styles.addModalHeader}>
                <View style={styles.addModalTitleContainer}>
                  <View style={styles.addModalIcon}>
                    <MaterialIcons
                      name="add-business"
                      size={22}
                      color={colors.primary}
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
                  disabled={savingRoom}>
                  <MaterialIcons
                    name="close"
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{maxHeight: '82%'}}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}>
                {/* VENUE INFORMATION */}
                <View style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>
                    Venue Information
                  </Text>

                  <Text style={styles.label}>
                    Venue Name
                  </Text>

                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="meeting-room"
                      size={20}
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

                  <Text style={styles.label}>
                    Capacity
                  </Text>

                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="groups"
                      size={20}
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

                {/* AVAILABLE SCHEDULE */}
                <View style={styles.formSection}>
                  <View style={styles.formSectionHeader}>
                    <View>
                      <Text style={styles.formSectionTitle}>
                        Available Schedule
                      </Text>

                      <Text style={styles.formSectionSubtitle}>
                        Select grid slots for venue availability.
                      </Text>
                    </View>

                    <View style={styles.formScheduleCount}>
                      <Text style={styles.formScheduleCountText}>
                        {schedules.length}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.addScheduleButton}
                    onPress={openSchedulePopup}
                    activeOpacity={0.8}>
                    <MaterialIcons
                      name="calendar-view-month"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text style={styles.addScheduleButtonText}>
                      Select Schedule Grid
                    </Text>
                  </TouchableOpacity>

                  {/* NO SCHEDULE */}
                  {schedules.length === 0 ? (
                    <View style={styles.emptySchedule}>
                      <MaterialIcons
                        name="event-note"
                        size={36}
                        color="#B8C0C8"
                      />

                      <Text style={styles.emptyTitle}>
                        No Schedule Added
                      </Text>

                      <Text style={styles.emptyText}>
                        Tap above to open slot grid and select
                        timings.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.scheduleList}>
                      {schedules.map((item, index) => (
                        <View
                          key={`${item.day}-${index}`}
                          style={styles.scheduleCard}>
                          <View style={styles.scheduleDayBox}>
                            <MaterialIcons
                              name="calendar-today"
                              size={15}
                              color={colors.primary}
                            />

                            <Text style={styles.scheduleDay}>
                              {item.day.substring(0, 3)}
                            </Text>
                          </View>

                          <View style={styles.scheduleDetails}>
                            <View style={styles.scheduleRow}>
                              <MaterialIcons
                                name="access-time"
                                size={14}
                                color="#666"
                              />

                              <Text style={styles.scheduleTime}>
                                {item.time}
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() =>
                              removeSchedule(index)
                            }>
                            <MaterialIcons
                              name="delete-outline"
                              size={20}
                              color="#D64545"
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* SAVE VENUE */}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    savingRoom && styles.disabledButton,
                  ]}
                  onPress={saveLTRoom}
                  disabled={savingRoom}
                  activeOpacity={0.8}>
                  {savingRoom ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <MaterialIcons
                      name="save"
                      size={21}
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

      {/* ========================================================
          SCHEDULE GRID MODAL
          ======================================================== */}

      <Modal
        visible={scheduleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          setScheduleModalVisible(false)
        }>
        <View style={styles.modalOverlay}>
          <View style={styles.gridModalContainer}>
            {/* GRID MODAL HEADER */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Select Schedule
                </Text>

                <Text style={styles.modalSubtitle}>
                  Tap slots to toggle selection
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() =>
                  setScheduleModalVisible(false)
                }>
                <MaterialIcons
                  name="close"
                  size={22}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            {/* TIMETABLE GRID */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}>
              <View style={styles.gridCard}>
                {/* GRID HEADER */}
                <View style={styles.gridHeaderRow}>
                  <View style={styles.gridTimeColumnHeader} />

                  {DAYS_SHORT.map(day => (
                    <View
                      key={day}
                      style={styles.gridHeaderCell}>
                      <Text style={styles.gridHeaderCellText}>
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* GRID ROWS */}
                {TIME_SLOTS.map((slot, slotIdx) => (
                  <View
                    key={slot}
                    style={styles.gridRow}>
                    <View style={styles.gridTimeCell}>
                      <Text
                        style={styles.gridTimeText}
                        numberOfLines={1}>
                        {slot}
                      </Text>
                    </View>

                    {DAYS_SHORT.map((_, dayIdx) => {
                      const key = `${dayIdx}-${slotIdx}`;
                      const isSelected =
                        !!selectedSlots[key];

                      return (
                        <TouchableOpacity
                          key={key}
                          activeOpacity={0.7}
                          style={[
                            styles.gridSlotCell,
                            isSelected &&
                              styles.gridSlotCellSelected,
                          ]}
                          onPress={() =>
                            toggleSlot(dayIdx, slotIdx)
                          }>
                          {isSelected && (
                            <MaterialIcons
                              name="check"
                              size={13}
                              color="#FFFFFF"
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>

              {/* GRID ACTION BUTTONS */}
              <View style={styles.gridActionRow}>
                <TouchableOpacity
                  style={styles.saveScheduleBtn}
                  onPress={confirmGridSchedule}
                  activeOpacity={0.8}>
                  <MaterialIcons
                    name="check-circle"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.saveScheduleBtnText}>
                    Save Schedule
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.clearAllBtn}
                  onPress={clearAllSlots}
                  activeOpacity={0.8}>
                  <Text style={styles.clearAllBtnText}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>

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
  // ============================================================
  // SAFE AREA
  // ============================================================

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  // ============================================================
  // HEADER
  // Same common House of Tutor header structure
  // ============================================================

  header: {
    height: 58,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  logoImage: {
    width: 34,
    height: 34,
    marginRight: 9,
  },

  logoText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },

  // ============================================================
  // FLOATING ACTION BUTTON
  // ============================================================

  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  // ============================================================
  // LOADING
  // ============================================================

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: colors.text,
    fontSize: 13,
    marginTop: 10,
  },

  // ============================================================
  // MAIN CONTAINER
  // ============================================================

  container: {
    padding: 15,
    paddingBottom: 80,
  },

  // ============================================================
  // PAGE INTRO
  // ============================================================

  pageIntro: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  pageIntroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  pageIntroText: {
    flex: 1,
  },

  pageIntroTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  pageIntroSubtitle: {
    color: '#777',
    fontSize: 11,
    marginTop: 2,
  },

  totalRoomsBadge: {
    minWidth: 44,
    backgroundColor: '#F0F7F6',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalRoomsNumber: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  totalRoomsLabel: {
    color: '#777',
    fontSize: 9,
  },

  // ============================================================
  // ROOM CARD
  // ============================================================

  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  roomHeaderTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roomIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  roomTitleContainer: {
    flex: 1,
  },

  roomName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  roomCapacityText: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },

  roomCapacityVal: {
    color: colors.text,
    fontWeight: '700',
  },

  dropdownIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dropdownContent: {
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },

  // ============================================================
  // ROOM SCHEDULE
  // ============================================================

  roomScheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  roomScheduleTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },

  roomScheduleSubtitle: {
    color: '#888',
    fontSize: 10,
    marginTop: 1,
  },

  scheduleCountBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scheduleCountText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  roomSchedulesList: {
    gap: 7,
  },

  roomScheduleCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  roomScheduleDay: {
    width: 66,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 6,
  },

  roomScheduleDayText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },

  roomScheduleDetails: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#E8E8E8',
    paddingLeft: 9,
  },

  roomScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },

  roomScheduleTime: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },

  roomScheduleDate: {
    color: '#777',
    fontSize: 9,
    marginLeft: 5,
  },

  // ============================================================
  // NO SCHEDULE
  // ============================================================

  noScheduleBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noScheduleText: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },

  // ============================================================
  // EMPTY ROOMS
  // ============================================================

  emptyRooms: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  emptyRoomsIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyRoomsTitle: {
    color: colors.text,
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
    backgroundColor: colors.primary,
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 18,
    marginTop: 16,
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

  // ============================================================
  // ADD MODAL
  // ============================================================

  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  addModalKeyboard: {
    maxHeight: '90%',
  },

  addModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  addModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  addModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  addModalIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  addModalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  addModalSubtitle: {
    color: '#777',
    fontSize: 11,
    marginTop: 1,
  },

  // ============================================================
  // COMMON MODAL CLOSE BUTTON
  // ============================================================

  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ============================================================
  // FORM SECTION
  // ============================================================

  formSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },

  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  formSectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  formSectionSubtitle: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },

  formScheduleCount: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  formScheduleCountText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  // ============================================================
  // INPUTS
  // ============================================================

  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },

  inputContainer: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    paddingVertical: 8,
    marginLeft: 8,
  },

  // ============================================================
  // ADD SCHEDULE BUTTON
  // ============================================================

  addScheduleButton: {
    backgroundColor: colors.primary,
    minHeight: 45,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  addScheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },

  // ============================================================
  // EMPTY SCHEDULE
  // ============================================================

  emptySchedule: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },

  emptyTitle: {
    color: '#555',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },

  emptyText: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // ============================================================
  // SCHEDULE LIST
  // ============================================================

  scheduleList: {
    gap: 8,
  },

  scheduleCard: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  scheduleDayBox: {
    width: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  scheduleDay: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  scheduleDetails: {
    flex: 1,
    marginLeft: 6,
  },

  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  scheduleTime: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  // ============================================================
  // SAVE BUTTON
  // ============================================================

  saveButton: {
    backgroundColor: colors.primary,
    minHeight: 46,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },

  // ============================================================
  // GRID MODAL
  // ============================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  gridModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingHorizontal: 12,
    paddingTop: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  modalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  modalSubtitle: {
    color: '#777',
    fontSize: 11,
    marginTop: 1,
  },

  // ============================================================
  // GRID TABLE
  // ============================================================

  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 14,
  },

  gridHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    marginBottom: 4,
  },

  gridTimeColumnHeader: {
    flex: 1.8,
  },

  gridHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },

  gridHeaderCellText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },

  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },

  gridTimeCell: {
    flex: 1.8,
    justifyContent: 'center',
    paddingLeft: 2,
  },

  gridTimeText: {
    color: '#666',
    fontSize: 8.5,
    fontWeight: '600',
  },

  gridSlotCell: {
    flex: 1,
    height: 32,
    marginHorizontal: 1,
    borderRadius: 5,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  gridSlotCellSelected: {
    backgroundColor: colors.primary,
  },

  // ============================================================
  // GRID ACTION BUTTONS
  // ============================================================

  gridActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  saveScheduleBtn: {
    flex: 1.6,
    backgroundColor: colors.primary,
    height: 45,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveScheduleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 5,
  },

  clearAllBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFFFFF',
    height: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearAllBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // ============================================================
  // SPACING
  // ============================================================

  modalBottomSpace: {
    height: 25,
  },

  bottomSpace: {
    height: 20,
  },
});

export default AdminVenueManagement;



























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
