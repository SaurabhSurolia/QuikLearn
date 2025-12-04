import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert, 
  Dimensions, 
  StatusBar 
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../UserContext';
import { getItemJSON, setItemJSON } from '../utils/storage';
import CommentModal from '../components/CommentModal';

const { height, width } = Dimensions.get('window');

// Sample remote videos
const SAMPLE_REELS = [
  { id:'r1', title:'Confusion Matrix — 60s', src:'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', creator:'Aisha - ML', tags:['AI','ML'] },
  { id:'r2', title:'List Comprehension — 45s', src:'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', creator:'Rohit - Dev', tags:['Programming'] },
];

export default function StudentHome({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  
  // Data State
  const [reels, setReels] = useState([]);
  const [likesMap, setLikesMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  
  // UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeComments, setActiveComments] = useState([]);
  const [activeReelId, setActiveReelId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refs for video playback control
  const videoRefs = useRef([]);

  // 1. INITIALIZATION & DATA LOADING
  useEffect(() => {
    async function init() {
      const session = await getItemJSON('ll_session', null);
      if (!session || session.role !== 'student') {
        Alert.alert('Not logged in as student');
        navigation.replace('Login');
        return;
      }

      const likes = await getItemJSON('ll_likes', {});
      const comments = await getItemJSON('ll_comments', {});
      const uploads = await getItemJSON('ll_creator_uploads', []);

      // Combine user uploads + samples
      const merged = [...(uploads || []).map(u => ({ ...u })), ...SAMPLE_REELS];
      
      // We don't map likes into the object here anymore, we look them up dynamically
      setReels(merged);
      setLikesMap(likes);
      setCommentsMap(comments);
    }
    init();
  }, []);

  // 2. INTERACTIONS
  async function onLike(reelId) {
    const currentLikes = likesMap[reelId] || 0;
    const newLikes = { ...likesMap, [reelId]: currentLikes + 1 };
    setLikesMap(newLikes);
    await setItemJSON('ll_likes', newLikes);
  }

  function openComments(reelId) {
    setActiveReelId(reelId);
    const c = commentsMap[reelId] || [];
    setActiveComments(c);
    setModalVisible(true);
  }

  async function postComment(entry) {
    const c = { ...(commentsMap || {}) };
    c[activeReelId] = c[activeReelId] || [];
    c[activeReelId].push(entry);
    setCommentsMap(c);
    await setItemJSON('ll_comments', c);
    setActiveComments(c[activeReelId]);
  }

  async function logout() {
    // Pause current video before leaving
    if (videoRefs.current[currentIndex]) {
      await videoRefs.current[currentIndex].pauseAsync();
    }
    await setItemJSON('ll_session', null);
    setUser(null);
    navigation.replace('Login');
  }

  // 3. PLAYBACK LOGIC
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);
    }
  }).current;

  // 4. RENDER SINGLE REEL ITEM
  const renderItem = ({ item, index }) => {
    const isLiked = false; // Simple toggle simulation, normally would check if user ID is in a list
    const likeCount = likesMap[item.id] || 0;
    const commentCount = (commentsMap[item.id] || []).length;

    return (
      <View style={styles.videoContainer}>
        {/* VIDEO PLAYER */}
        <Video
          ref={ref => (videoRefs.current[index] = ref)}
          source={{ uri: item.src }}
          style={styles.video}
          resizeMode="cover"
          shouldPlay={index === currentIndex} // Only play if it's the active slide
          isLooping
          isMuted={false}
        />

        {/* OVERLAY: Bottom Text info */}
        <View style={styles.overlay}>
          <View style={styles.textContainer}>
            <Text style={styles.creatorText}>@{item.creator}</Text>
            <Text style={styles.titleText}>{item.title}</Text>
            <View style={{flexDirection:'row', marginTop:5}}>
               {(item.tags || []).map((t, i) => (
                 <Text key={i} style={styles.tagText}>#{t}  </Text>
               ))}
            </View>
          </View>

          {/* OVERLAY: Right Side Actions */}
          <View style={styles.actionsContainer}>
            {/* LIKE BUTTON */}
            <TouchableOpacity onPress={() => onLike(item.id)} style={styles.actionButton}>
              <Ionicons name="heart" size={35} color={likeCount > 0 ? "#ff4757" : "white"} />
              <Text style={styles.actionText}>{likeCount}</Text>
            </TouchableOpacity>

            {/* COMMENT BUTTON */}
            <TouchableOpacity onPress={() => openComments(item.id)} style={styles.actionButton}>
              <Ionicons name="chatbubble-ellipses" size={32} color="white" />
              <Text style={styles.actionText}>{commentCount}</Text>
            </TouchableOpacity>

            {/* SHARE BUTTON (Placeholder) */}
            <TouchableOpacity onPress={() => Alert.alert('Share', 'Link copied!')} style={styles.actionButton}>
              <Ionicons name="arrow-redo" size={32} color="white" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* REELS LIST */}
      <FlatList
        data={reels}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        pagingEnabled // This gives the "TikTok" snap effect
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        initialNumToRender={1}
        windowSize={3}
      />

      {/* FLOATING HEADER (Transparent) */}
      <View style={styles.floatingHeader}>
        <Text style={styles.brand}>LearnLoop</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* COMMENTS MODAL */}
      <CommentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        comments={activeComments}
        onPost={postComment}
        currentUser={user}
      />
    </View>
  );
}

// 5. STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    width: width,
    height: height,
    position: 'relative',
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  // Floating Header Styles
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10, // Ensure it sits on top of video
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  // Content Overlay Styles
  overlay: {
    position: 'absolute',
    bottom: 80, // Space from bottom
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  textContainer: {
    flex: 1,
    marginRight: 20,
    paddingBottom: 10,
  },
  creatorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  titleText: {
    color: 'white',
    fontSize: 15,
    marginBottom: 5,
    lineHeight: 22,
  },
  tagText: {
    color: '#a78bfa',
    fontWeight: '700',
    fontSize: 13
  },
  actionsContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 5,
  }
});