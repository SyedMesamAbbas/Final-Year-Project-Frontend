import React, {useCallback, useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {BASE_URL} from '../../config/api';
import colors from '../utils/colors';

// ============================================================
// SCREEN
// ============================================================

const StudentFriendList = ({navigation}) => {
  // ============================================================
  // STATES
  // ============================================================

  const [activeTab, setActiveTab] = useState('requests');

  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [processingId, setProcessingId] = useState(null);

  // ============================================================
  // GET TOKEN
  // ============================================================

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found.');
      }

      return token;
    } catch (error) {
      throw error;
    }
  };

  // ============================================================
  // LOAD FRIEND REQUESTS
  // ============================================================

  const loadFriendRequests = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        console.log('========================================');
        console.log('LOAD FRIEND REQUESTS');
        console.log('========================================');

        const token = await getToken();

        const response = await fetch(
          `${BASE_URL}/Student/friend-requests`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        );

        console.log('Friend Requests Status:', response.status);

        const data = await response.json();

        console.log('Friend Requests Response:', data);

        if (!response.ok) {
          throw new Error(
            data?.message || 'Unable to load friend requests.',
          );
        }

        setFriendRequests(data?.requests || []);
      } catch (error) {
        console.log('LOAD FRIEND REQUESTS ERROR:', error);

        Alert.alert(
          'Error',
          error?.message || 'Unable to load friend requests.',
        );

        setFriendRequests([]);
      } finally {
        if (showLoader) {
          setLoading(false);
        }

        setRefreshing(false);
      }
    },
    [],
  );

  // ============================================================
  // LOAD ALL FRIENDS
  // ============================================================

  const loadFriends = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        console.log('========================================');
        console.log('LOAD ALL FRIENDS');
        console.log('========================================');

        const token = await getToken();

        const response = await fetch(
          `${BASE_URL}/Student/all-friends`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        );

        console.log('All Friends Status:', response.status);

        const data = await response.json();

        console.log('All Friends Response:', data);

        if (!response.ok) {
          throw new Error(
            data?.message || 'Unable to load friends.',
          );
        }

        setFriends(data?.friends || []);
      } catch (error) {
        console.log('LOAD ALL FRIENDS ERROR:', error);

        Alert.alert(
          'Error',
          error?.message || 'Unable to load friends.',
        );

        setFriends([]);
      } finally {
        if (showLoader) {
          setLoading(false);
        }

        setRefreshing(false);
      }
    },
    [],
  );

  // ============================================================
  // INITIAL LOAD / TAB LOAD
  // ============================================================

  useEffect(() => {
    if (activeTab === 'requests') {
      loadFriendRequests();
    } else {
      loadFriends();
    }
  }, [activeTab, loadFriendRequests, loadFriends]);

  // ============================================================
  // CHANGE TAB
  // ============================================================

  const handleTabChange = tab => {
    if (activeTab === tab) {
      return;
    }

    setActiveTab(tab);
    setLoading(true);
  };

  // ============================================================
  // PULL TO REFRESH
  // ============================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    if (activeTab === 'requests') {
      await loadFriendRequests(false);
    } else {
      await loadFriends(false);
    }
  };

  // ============================================================
  // ACCEPT FRIEND REQUEST
  // ============================================================

  const acceptFriendRequest = async request => {
    try {
      if (!request?.friendshipId) {
        Alert.alert('Error', 'Invalid friendship ID.');
        return;
      }

      setProcessingId(request.friendshipId);

      console.log('========================================');
      console.log('ACCEPT FRIEND REQUEST');
      console.log('Friendship ID:', request.friendshipId);
      console.log('========================================');

      const token = await getToken();

      const response = await fetch(
        `${BASE_URL}/Student/accept-friend-request`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            friendshipId: request.friendshipId,
          }),
        },
      );

      console.log('Accept Status:', response.status);

      const data = await response.json();

      console.log('Accept Response:', data);

      if (!response.ok) {
        throw new Error(
          data?.message || 'Unable to accept friend request.',
        );
      }

      setFriendRequests(previousRequests =>
        previousRequests.filter(
          item => item.friendshipId !== request.friendshipId,
        ),
      );

      Alert.alert(
        'Success',
        data?.message ||
          `${request?.senderName || 'Student'} is now your friend.`,
      );
    } catch (error) {
      console.log('ACCEPT FRIEND REQUEST ERROR:', error);

      Alert.alert(
        'Error',
        error?.message || 'Unable to accept friend request.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================================
  // REJECT FRIEND REQUEST
  // ============================================================

  const rejectFriendRequest = async request => {
    try {
      if (!request?.friendshipId) {
        Alert.alert('Error', 'Invalid friendship ID.');
        return;
      }

      setProcessingId(request.friendshipId);

      console.log('========================================');
      console.log('REJECT FRIEND REQUEST');
      console.log('Friendship ID:', request.friendshipId);
      console.log('========================================');

      const token = await getToken();

      const response = await fetch(
        `${BASE_URL}/Student/reject-friend-request`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            friendshipId: request.friendshipId,
          }),
        },
      );

      console.log('Reject Status:', response.status);

      const data = await response.json();

      console.log('Reject Response:', data);

      if (!response.ok) {
        throw new Error(
          data?.message || 'Unable to reject friend request.',
        );
      }

      setFriendRequests(previousRequests =>
        previousRequests.filter(
          item => item.friendshipId !== request.friendshipId,
        ),
      );

      Alert.alert(
        'Request Rejected',
        data?.message ||
          'Friend request rejected successfully.',
      );
    } catch (error) {
      console.log('REJECT FRIEND REQUEST ERROR:', error);

      Alert.alert(
        'Error',
        error?.message || 'Unable to reject friend request.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================================
  // CONFIRM ACCEPT
  // ============================================================

  const confirmAccept = request => {
    Alert.alert(
      'Accept Friend Request',
      `Do you want to accept ${
        request?.senderName || 'this student'
      } as your friend?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: () => acceptFriendRequest(request),
        },
      ],
    );
  };

  // ============================================================
  // CONFIRM REJECT
  // ============================================================

  const confirmReject = request => {
    Alert.alert(
      'Reject Friend Request',
      `Do you want to reject ${
        request?.senderName || 'this student'
      }'s friend request?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => rejectFriendRequest(request),
        },
      ],
    );
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = dateValue => {
    if (!dateValue) {
      return '';
    }

    try {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return '';
      }

      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return '';
    }
  };

  // ============================================================
  // RENDER FRIEND REQUEST
  // ============================================================

  const renderFriendRequest = ({item}) => {
    const isProcessing = processingId === item.friendshipId;

    return (
      <View style={styles.requestCard}>
        {/* PROFILE ICON */}

        <View style={styles.avatarContainer}>
          <MaterialIcons
            name="person"
            size={30}
            color={colors.primary}
          />
        </View>

        {/* REQUEST INFORMATION */}

        <View style={styles.requestInfo}>
          <Text
            style={styles.studentName}
            numberOfLines={1}>
            {item?.senderName || 'Unknown Student'}
          </Text>

          {item?.senderEmail ? (
            <Text
              style={styles.studentEmail}
              numberOfLines={1}>
              {item.senderEmail}
            </Text>
          ) : null}

          <View style={styles.dateRow}>
            <MaterialIcons
              name="access-time"
              size={14}
              color={colors.text}
            />

            <Text style={styles.dateText}>
              {formatDate(item?.requestedDate)}
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}

        <View style={styles.actionContainer}>
          {isProcessing ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          ) : (
            <>
              {/* ACCEPT */}

              <TouchableOpacity
                style={styles.acceptButton}
                activeOpacity={0.8}
                onPress={() => confirmAccept(item)}>
                <MaterialIcons
                  name="check"
                  size={18}
                  color={colors.background}
                />

                <Text style={styles.acceptButtonText}>
                  Accept
                </Text>
              </TouchableOpacity>

              {/* REJECT */}

              <TouchableOpacity
                style={styles.rejectButton}
                activeOpacity={0.8}
                onPress={() => confirmReject(item)}>
                <MaterialIcons
                  name="close"
                  size={18}
                  color={colors.secondary}
                />

                <Text style={styles.rejectButtonText}>
                  Reject
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  // ============================================================
  // RENDER FRIEND
  // ============================================================

  const renderFriend = ({item}) => {
    return (
      <View style={styles.friendCard}>
        {/* PROFILE ICON */}

        <View style={styles.friendAvatarContainer}>
          <MaterialIcons
            name="person"
            size={32}
            color={colors.primary}
          />
        </View>

        {/* FRIEND INFORMATION */}

        <View style={styles.friendInfo}>
          <Text
            style={styles.friendName}
            numberOfLines={1}>
            {item?.friendName || 'Unknown Student'}
          </Text>

          {item?.friendEmail ? (
            <Text
              style={styles.friendEmail}
              numberOfLines={1}>
              {item.friendEmail}
            </Text>
          ) : null}

          {item?.friendPhone ? (
            <View style={styles.friendDetailRow}>
              <MaterialIcons
                name="phone"
                size={14}
                color={colors.text}
              />

              <Text style={styles.friendDetailText}>
                {item.friendPhone}
              </Text>
            </View>
          ) : null}

          <View style={styles.friendDetailRow}>
            <MaterialIcons
              name="check-circle"
              size={14}
              color={colors.primary}
            />

            <Text style={styles.acceptedText}>
              Friends since{' '}
              {formatDate(item?.acceptedDate) ||
                'recently'}
            </Text>
          </View>
        </View>

        {/* FRIEND STATUS */}

        <View style={styles.friendStatus}>
          <MaterialIcons
            name="people"
            size={17}
            color={colors.primary}
          />

          <Text style={styles.friendStatusText}>
            Friend
          </Text>
        </View>
      </View>
    );
  };

  // ============================================================
  // EMPTY REQUEST STATE
  // ============================================================

  const renderRequestEmptyState = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="person-add-outline"
            size={50}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          No Friend Requests
        </Text>

        <Text style={styles.emptyText}>
          You do not have any pending friend requests
          right now.
        </Text>
      </View>
    );
  };

  // ============================================================
  // EMPTY FRIEND LIST STATE
  // ============================================================

  const renderFriendEmptyState = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="people-outline"
            size={55}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          No Friends Yet
        </Text>

        <Text style={styles.emptyText}>
          You have no accepted friends yet. Accept a
          friend request to see your friends here.
        </Text>
      </View>
    );
  };

  // ============================================================
  // CURRENT DATA
  // ============================================================

  const currentData =
    activeTab === 'requests'
      ? friendRequests
      : friends;

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />

      {/* ========================================================
          HEADER
      ======================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <MaterialIcons
            name="arrow-back"
            size={25}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            My Friends
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your friend requests and friends
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerIconContainer}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('StudentAddFriend')
          }>
          <Ionicons
            name="person-add-outline"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* ========================================================
          TOGGLE BUTTON
      ======================================================== */}

      <View style={styles.toggleContainer}>
        {/* FRIEND REQUEST */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.toggleButton,
            activeTab === 'requests' &&
              styles.activeToggleButton,
          ]}
          onPress={() =>
            handleTabChange('requests')
          }>
          <MaterialIcons
            name="person-add"
            size={19}
            color={
              activeTab === 'requests'
                ? colors.background
                : colors.text
            }
          />

          <Text
            style={[
              styles.toggleText,
              activeTab === 'requests' &&
                styles.activeToggleText,
            ]}>
            Friend Request
          </Text>

          {friendRequests.length > 0 && (
            <View
              style={[
                styles.toggleBadge,
                activeTab === 'requests' &&
                  styles.activeToggleBadge,
              ]}>
              <Text
                style={[
                  styles.toggleBadgeText,
                  activeTab === 'requests' &&
                    styles.activeToggleBadgeText,
                ]}>
                {friendRequests.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* FRIEND LIST */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.toggleButton,
            activeTab === 'friends' &&
              styles.activeToggleButton,
          ]}
          onPress={() =>
            handleTabChange('friends')
          }>
          <MaterialIcons
            name="people"
            size={20}
            color={
              activeTab === 'friends'
                ? colors.background
                : colors.text
            }
          />

          <Text
            style={[
              styles.toggleText,
              activeTab === 'friends' &&
                styles.activeToggleText,
            ]}>
            Friend List
          </Text>

          {friends.length > 0 && (
            <View
              style={[
                styles.toggleBadge,
                activeTab === 'friends' &&
                  styles.activeToggleBadge,
              ]}>
              <Text
                style={[
                  styles.toggleBadgeText,
                  activeTab === 'friends' &&
                    styles.activeToggleBadgeText,
                ]}>
                {friends.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ========================================================
          COUNT / INFORMATION
      ======================================================== */}

      {!loading && (
        <View style={styles.countContainer}>
          <View style={styles.countLeft}>
            <View style={styles.countIcon}>
              <MaterialIcons
                name={
                  activeTab === 'requests'
                    ? 'person-add'
                    : 'people'
                }
                size={21}
                color={colors.primary}
              />
            </View>

            <View style={styles.countTextContainer}>
              <Text style={styles.countTitle}>
                {activeTab === 'requests'
                  ? 'Pending Requests'
                  : 'My Friends'}
              </Text>

              <Text style={styles.countSubtitle}>
                {activeTab === 'requests'
                  ? friendRequests.length === 0
                    ? 'No pending requests'
                    : `${
                        friendRequests.length
                      } ${
                        friendRequests.length === 1
                          ? 'request'
                          : 'requests'
                      } waiting for your response`
                  : friends.length === 0
                  ? 'No friends yet'
                  : `${
                      friends.length
                    } ${
                      friends.length === 1
                        ? 'friend'
                        : 'friends'
                    } in your friend list`}
              </Text>
            </View>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {currentData.length}
            </Text>
          </View>
        </View>
      )}

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            {activeTab === 'requests'
              ? 'Loading friend requests...'
              : 'Loading friends...'}
          </Text>
        </View>
      ) : (
        /* ======================================================
           CURRENT LIST
           ====================================================== */

        <FlatList
          data={currentData}
          keyExtractor={(item, index) =>
            String(
              item?.friendshipId ||
                item?.friendStudentId ||
                `friend-${index}`,
            )
          }
          renderItem={
            activeTab === 'requests'
              ? renderFriendRequest
              : renderFriend
          }
          ListEmptyComponent={
            activeTab === 'requests'
              ? renderRequestEmptyState
              : renderFriendEmptyState
          }
          contentContainerStyle={
            currentData.length === 0
              ? styles.emptyListContent
              : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default StudentFriendList;

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

  // ============================================================
  // HEADER
  // ============================================================

  header: {
    minHeight: 78,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },

  headerSubtitle: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },

  headerIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ============================================================
  // TOGGLE
  // ============================================================

  toggleContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 4,
    backgroundColor: colors.background,
    borderRadius: 14,
    flexDirection: 'row',
  },

  toggleButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  activeToggleButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 6,
  },

  activeToggleText: {
    color: colors.background,
  },

  toggleBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    marginLeft: 6,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeToggleBadge: {
    backgroundColor: colors.background,
  },

  toggleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },

  activeToggleBadgeText: {
    color: colors.primary,
  },

  // ============================================================
  // COUNT
  // ============================================================

  countContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.background,
  },

  countLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  countIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  countTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  countTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  countSubtitle: {
    fontSize: 11,
    color: colors.text,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 42,
    height: 42,
    paddingHorizontal: 10,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  countBadgeText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },

  // ============================================================
  // LIST
  // ============================================================

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 25,
  },

  // ============================================================
  // REQUEST CARD
  // ============================================================

  requestCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ============================================================
  // FRIEND CARD
  // ============================================================

  friendCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ============================================================
  // AVATAR
  // ============================================================

  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  friendAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ============================================================
  // REQUEST INFO
  // ============================================================

  requestInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  studentEmail: {
    fontSize: 11,
    color: colors.text,
    marginTop: 3,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  dateText: {
    fontSize: 11,
    color: colors.text,
    marginLeft: 4,
  },

  // ============================================================
  // REQUEST ACTIONS
  // ============================================================

  actionContainer: {
    width: 86,
    alignItems: 'stretch',
  },

  acceptButton: {
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },

  acceptButtonText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },

  rejectButton: {
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    marginTop: 6,
  },

  rejectButtonText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },

  // ============================================================
  // FRIEND INFO
  // ============================================================

  friendInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  friendEmail: {
    fontSize: 11,
    color: colors.text,
    marginTop: 3,
  },

  friendDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  friendDetailText: {
    fontSize: 11,
    color: colors.text,
    marginLeft: 5,
  },

  acceptedText: {
    fontSize: 11,
    color: colors.primary,
    marginLeft: 5,
  },

  // ============================================================
  // FRIEND STATUS
  // ============================================================

  friendStatus: {
    backgroundColor: colors.secondary,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  friendStatusText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },

  // ============================================================
  // LOADING
  // ============================================================

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text,
  },

  // ============================================================
  // EMPTY
  // ============================================================

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 100,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 310,
  },
});


















































//Only friend Request
// import React, {useCallback, useEffect, useState} from 'react';

// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
// } from 'react-native';

// import AsyncStorage from '@react-native-async-storage/async-storage';

// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import {BASE_URL} from '../../config/api'

// // ============================================================
// // SCREEN
// // ============================================================

// const StudentFriendList = ({navigation}) => {
//   // ============================================================
//   // STATES
//   // ============================================================

//   const [friendRequests, setFriendRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Stores friendship ID currently being processed
//   const [processingId, setProcessingId] = useState(null);

//   // ============================================================
//   // GET TOKEN
//   // ============================================================

//   const getToken = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');

//       if (!token) {
//         throw new Error('Authentication token not found.');
//       }

//       return token;
//     } catch (error) {
//       throw error;
//     }
//   };

//   // ============================================================
//   // LOAD FRIEND REQUESTS
//   // ============================================================

//   const loadFriendRequests = useCallback(async () => {
//     try {
//       setLoading(true);

//       console.log('========================================');
//       console.log('LOAD FRIEND REQUESTS');
//       console.log('========================================');

//       const token = await getToken();

//       const response = await fetch(
//         `${BASE_URL}/Student/friend-requests`,
//         {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             Accept: 'application/json',
//           },
//         },
//       );

//       console.log('Friend Requests Status:', response.status);

//       const data = await response.json();

//       console.log('Friend Requests Response:', data);

//       if (!response.ok) {
//         throw new Error(
//           data?.message || 'Unable to load friend requests.',
//         );
//       }

//       setFriendRequests(data?.requests || []);
//     } catch (error) {
//       console.log('LOAD FRIEND REQUESTS ERROR:', error);

//       Alert.alert(
//         'Error',
//         error?.message || 'Unable to load friend requests.',
//       );

//       setFriendRequests([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   // ============================================================
//   // INITIAL LOAD
//   // ============================================================

//   useEffect(() => {
//     loadFriendRequests();
//   }, [loadFriendRequests]);

//   // ============================================================
//   // PULL TO REFRESH
//   // ============================================================

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await loadFriendRequests();
//   };

//   // ============================================================
//   // ACCEPT FRIEND REQUEST
//   // ============================================================

//   const acceptFriendRequest = async request => {
//     try {
//       if (!request?.friendshipId) {
//         Alert.alert('Error', 'Invalid friendship ID.');
//         return;
//       }

//       setProcessingId(request.friendshipId);

//       console.log('========================================');
//       console.log('ACCEPT FRIEND REQUEST');
//       console.log('Friendship ID:', request.friendshipId);
//       console.log('========================================');

//       const token = await getToken();

//       const response = await fetch(
//         `${BASE_URL}/Student/accept-friend-request`,
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//             Accept: 'application/json',
//           },
//           body: JSON.stringify({
//             friendshipId: request.friendshipId,
//           }),
//         },
//       );

//       console.log('Accept Status:', response.status);

//       const data = await response.json();

//       console.log('Accept Response:', data);

//       if (!response.ok) {
//         throw new Error(
//           data?.message || 'Unable to accept friend request.',
//         );
//       }

//       // Remove request from pending list immediately
//       setFriendRequests(previousRequests =>
//         previousRequests.filter(
//           item => item.friendshipId !== request.friendshipId,
//         ),
//       );

//       Alert.alert(
//         'Success',
//         data?.message ||
//           `${request.senderName} is now your friend.`,
//       );
//     } catch (error) {
//       console.log('ACCEPT FRIEND REQUEST ERROR:', error);

//       Alert.alert(
//         'Error',
//         error?.message || 'Unable to accept friend request.',
//       );
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   // ============================================================
//   // REJECT FRIEND REQUEST
//   // ============================================================

//   const rejectFriendRequest = async request => {
//     try {
//       if (!request?.friendshipId) {
//         Alert.alert('Error', 'Invalid friendship ID.');
//         return;
//       }

//       setProcessingId(request.friendshipId);

//       console.log('========================================');
//       console.log('REJECT FRIEND REQUEST');
//       console.log('Friendship ID:', request.friendshipId);
//       console.log('========================================');

//       const token = await getToken();

//       const response = await fetch(
//         `${BASE_URL}/Student/reject-friend-request`,
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//             Accept: 'application/json',
//           },
//           body: JSON.stringify({
//             friendshipId: request.friendshipId,
//           }),
//         },
//       );

//       console.log('Reject Status:', response.status);

//       const data = await response.json();

//       console.log('Reject Response:', data);

//       if (!response.ok) {
//         throw new Error(
//           data?.message || 'Unable to reject friend request.',
//         );
//       }

//       // Remove request from pending list immediately
//       setFriendRequests(previousRequests =>
//         previousRequests.filter(
//           item => item.friendshipId !== request.friendshipId,
//         ),
//       );

//       Alert.alert(
//         'Request Rejected',
//         data?.message || 'Friend request rejected successfully.',
//       );
//     } catch (error) {
//       console.log('REJECT FRIEND REQUEST ERROR:', error);

//       Alert.alert(
//         'Error',
//         error?.message || 'Unable to reject friend request.',
//       );
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   // ============================================================
//   // CONFIRM ACCEPT
//   // ============================================================

//   const confirmAccept = request => {
//     Alert.alert(
//       'Accept Friend Request',
//       `Do you want to accept ${request?.senderName || 'this student'} as your friend?`,
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Accept',
//           onPress: () => acceptFriendRequest(request),
//         },
//       ],
//     );
//   };

//   // ============================================================
//   // CONFIRM REJECT
//   // ============================================================

//   const confirmReject = request => {
//     Alert.alert(
//       'Reject Friend Request',
//       `Do you want to reject ${request?.senderName || 'this student'}'s friend request?`,
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Reject',
//           style: 'destructive',
//           onPress: () => rejectFriendRequest(request),
//         },
//       ],
//     );
//   };

//   // ============================================================
//   // FORMAT DATE
//   // ============================================================

//   const formatDate = dateValue => {
//     if (!dateValue) {
//       return '';
//     }

//     try {
//       const date = new Date(dateValue);

//       if (Number.isNaN(date.getTime())) {
//         return '';
//       }

//       return date.toLocaleDateString('en-US', {
//         day: 'numeric',
//         month: 'short',
//         year: 'numeric',
//       });
//     } catch (error) {
//       return '';
//     }
//   };

//   // ============================================================
//   // RENDER SINGLE REQUEST
//   // ============================================================

//   const renderFriendRequest = ({item}) => {
//     const isProcessing = processingId === item.friendshipId;

//     return (
//       <View style={styles.requestCard}>
//         {/* ======================================================
//             PROFILE ICON
//         ====================================================== */}

//         <View style={styles.avatarContainer}>
//           <MaterialIcons
//             name="person"
//             size={32}
//             color="#2F6BFF"
//           />
//         </View>

//         {/* ======================================================
//             REQUEST INFORMATION
//         ====================================================== */}

//         <View style={styles.requestInfo}>
//           <Text style={styles.studentName} numberOfLines={1}>
//             {item?.senderName || 'Unknown Student'}
//           </Text>

//           {item?.senderEmail ? (
//             <Text style={styles.studentEmail} numberOfLines={1}>
//               {item.senderEmail}
//             </Text>
//           ) : null}

//           <View style={styles.dateRow}>
//             <MaterialIcons
//               name="access-time"
//               size={15}
//               color="#777"
//             />

//             <Text style={styles.dateText}>
//               {formatDate(item?.requestedDate)}
//             </Text>
//           </View>
//         </View>

//         {/* ======================================================
//             ACTION BUTTONS
//         ====================================================== */}

//         <View style={styles.actionContainer}>
//           {isProcessing ? (
//             <ActivityIndicator
//               size="small"
//               color="#2F6BFF"
//             />
//           ) : (
//             <>
//               {/* ACCEPT */}
//               <TouchableOpacity
//                 style={styles.acceptButton}
//                 activeOpacity={0.8}
//                 onPress={() => confirmAccept(item)}>
//                 <MaterialIcons
//                   name="check"
//                   size={19}
//                   color="#FFFFFF"
//                 />

//                 <Text style={styles.acceptButtonText}>
//                   Accept
//                 </Text>
//               </TouchableOpacity>

//               {/* REJECT */}
//               <TouchableOpacity
//                 style={styles.rejectButton}
//                 activeOpacity={0.8}
//                 onPress={() => confirmReject(item)}>
//                 <MaterialIcons
//                   name="close"
//                   size={19}
//                   color="#D32F2F"
//                 />

//                 <Text style={styles.rejectButtonText}>
//                   Reject
//                 </Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       </View>
//     );
//   };

//   // ============================================================
//   // EMPTY STATE
//   // ============================================================

//   const renderEmptyState = () => {
//     if (loading) {
//       return null;
//     }

//     return (
//       <View style={styles.emptyContainer}>
//         <View style={styles.emptyIconContainer}>
//           <Ionicons
//             name="people-outline"
//             size={55}
//             color="#2F6BFF"
//           />
//         </View>

//         <Text style={styles.emptyTitle}>
//           No Friend Requests
//         </Text>

//         <Text style={styles.emptyText}>
//           You do not have any pending friend requests right now.
//         </Text>
//       </View>
//     );
//   };

//   // ============================================================
//   // MAIN UI
//   // ============================================================

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="#FFFFFF"
//       />

//       {/* ========================================================
//           HEADER
//       ======================================================== */}

//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           activeOpacity={0.7}
//           onPress={() => navigation.goBack()}>
//           <MaterialIcons
//             name="arrow-back"
//             size={25}
//             color="#222222"
//           />
//         </TouchableOpacity>

//         <View style={styles.headerTextContainer}>
//           <Text style={styles.headerTitle}>
//             Friend Requests
//           </Text>

//           <Text style={styles.headerSubtitle}>
//             Manage your friend requests
//           </Text>
//         </View>

//         <View style={styles.headerIconContainer}>
//           <TouchableOpacity onPress={()=>navigation.nagivate("StudentAddFriend")}>        
//             <Ionicons
//                 name="person-add-outline"
//                 size={24}
//                 color="#2F6BFF"
//             />  
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* ========================================================
//           REQUEST COUNT
//       ======================================================== */}

//       {!loading && (
//         <View style={styles.countContainer}>
//           <View>
//             <Text style={styles.countTitle}>
//               Pending Requests
//             </Text>

//             <Text style={styles.countSubtitle}>
//               {friendRequests.length === 0
//                 ? 'No pending requests'
//                 : `${friendRequests.length} ${
//                     friendRequests.length === 1
//                       ? 'request'
//                       : 'requests'
//                   } waiting for your response`}
//             </Text>
//           </View>

//           <View style={styles.countBadge}>
//             <Text style={styles.countBadgeText}>
//               {friendRequests.length}
//             </Text>
//           </View>
//         </View>
//       )}

//       {/* ========================================================
//           LOADING
//       ======================================================== */}

//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator
//             size="large"
//             color="#2F6BFF"
//           />

//           <Text style={styles.loadingText}>
//             Loading friend requests...
//           </Text>
//         </View>
//       ) : (
//         /* ======================================================
//            FRIEND REQUEST LIST
//            ====================================================== */

//         <FlatList
//           data={friendRequests}
//           keyExtractor={item =>
//             String(item.friendshipId)
//           }
//           renderItem={renderFriendRequest}
//           ListEmptyComponent={renderEmptyState}
//           contentContainerStyle={
//             friendRequests.length === 0
//               ? styles.emptyListContent
//               : styles.listContent
//           }
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={handleRefresh}
//               colors={['#2F6BFF']}
//               tintColor="#2F6BFF"
//             />
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// // ============================================================
// // STYLES
// // ============================================================

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F6F8FC',
//   },

//   // ============================================================
//   // HEADER
//   // ============================================================

//   header: {
//     height: 78,
//     backgroundColor: '#FFFFFF',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E9ECF2',
//   },

//   backButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: '#F1F4FA',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   headerTextContainer: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1F2937',
//   },

//   headerSubtitle: {
//     fontSize: 12,
//     color: '#7A8190',
//     marginTop: 2,
//   },

//   headerIconContainer: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: '#EEF3FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   // ============================================================
//   // COUNT
//   // ============================================================

//   countContainer: {
//     marginHorizontal: 16,
//     marginTop: 16,
//     marginBottom: 8,
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderWidth: 1,
//     borderColor: '#E8EBF2',
//   },

//   countTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#202631',
//   },

//   countSubtitle: {
//     fontSize: 12,
//     color: '#7A8190',
//     marginTop: 4,
//   },

//   countBadge: {
//     minWidth: 42,
//     height: 42,
//     paddingHorizontal: 10,
//     borderRadius: 21,
//     backgroundColor: '#2F6BFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   countBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },

//   // ============================================================
//   // LIST
//   // ============================================================

//   listContent: {
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     paddingBottom: 25,
//   },

//   // ============================================================
//   // REQUEST CARD
//   // ============================================================

//   requestCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E8EBF2',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   // ============================================================
//   // AVATAR
//   // ============================================================

//   avatarContainer: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     backgroundColor: '#EEF3FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   // ============================================================
//   // REQUEST INFO
//   // ============================================================

//   requestInfo: {
//     flex: 1,
//     marginLeft: 12,
//     marginRight: 8,
//   },

//   studentName: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#202631',
//   },

//   studentEmail: {
//     fontSize: 11,
//     color: '#7A8190',
//     marginTop: 3,
//   },

//   dateRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6,
//   },

//   dateText: {
//     fontSize: 11,
//     color: '#777777',
//     marginLeft: 4,
//   },

//   // ============================================================
//   // ACTIONS
//   // ============================================================

//   actionContainer: {
//     width: 86,
//     alignItems: 'stretch',
//   },

//   acceptButton: {
//     minHeight: 34,
//     borderRadius: 8,
//     backgroundColor: '#2F6BFF',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 7,
//   },

//   acceptButtonText: {
//     color: '#FFFFFF',
//     fontSize: 11,
//     fontWeight: '700',
//     marginLeft: 3,
//   },

//   rejectButton: {
//     minHeight: 34,
//     borderRadius: 8,
//     backgroundColor: '#FFF1F1',
//     borderWidth: 1,
//     borderColor: '#FFD4D4',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 7,
//     marginTop: 6,
//   },

//   rejectButtonText: {
//     color: '#D32F2F',
//     fontSize: 11,
//     fontWeight: '700',
//     marginLeft: 3,
//   },

//   // ============================================================
//   // LOADING
//   // ============================================================

//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: 80,
//   },

//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#777777',
//   },

//   // ============================================================
//   // EMPTY
//   // ============================================================

//   emptyListContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 30,
//     paddingBottom: 100,
//   },

//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   emptyIconContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: '#EEF3FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 18,
//   },

//   emptyTitle: {
//     fontSize: 19,
//     fontWeight: '700',
//     color: '#202631',
//   },

//   emptyText: {
//     fontSize: 13,
//     color: '#7A8190',
//     textAlign: 'center',
//     lineHeight: 20,
//     marginTop: 8,
//     maxWidth: 300,
//   },
// });

// export default StudentFriendList;
