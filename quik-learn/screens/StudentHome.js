// screens/StudentHome.js
import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Dimensions, StatusBar } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../UserContext';
import { getAllVideos, toggleLikeDB, addCommentDB } from '../utils/dbService';
import CommentModal from '../components/CommentModal';

const { height, width } = Dimensions.get('window');

export default function StudentHome({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [reels, setReels] = useState([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [activeComments, setActiveComments] = useState([]);
  const [activeReelId, setActiveReelId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const videoRefs = useRef([]);

  // 1. Load Data from Firestore
  useEffect(() => {
    async function loadData() {
      if (!user) {
        navigation.replace('Login');
        return;
      }
      const dbVideos = await getAllVideos();
      setReels(dbVideos);
    }
    loadData();
  }, []);

  // 2. Like Logic
  async function onLike(reelId) {
    // Optimistic Update (Update UI instantly before DB responds)
    const updatedReels = reels.map(r => {
      if (r.id === reelId) {
        const alreadyLiked = r.likes && r.likes.includes(user.uid);
        let newLikes = r.likes || [];
        if (alreadyLiked) {
          newLikes = newLikes.filter(uid => uid !== user.uid);
        } else {
          newLikes = [...newLikes, user.uid];
        }
        return { ...r, likes: newLikes };
      }
      return r;
    });
    setReels(updatedReels);

    // DB Update
    const currentReel = reels.find(r => r.id === reelId);
    const isLiked = currentReel.likes && currentReel.likes.includes(user.uid);
    await toggleLikeDB(reelId, user.uid, isLiked);
  }

  // 3. Comment Logic
  function openComments(reelId) {
    const reel = reels.find(r => r.id === reelId);
    setActiveReelId(reelId);
    setActiveComments(reel.comments || []);
    setModalVisible(true);
  }

  async function postComment(entry) {
    // DB Update
    await addCommentDB(activeReelId, user.email, entry.text);
    
    // UI Update
    const updatedReels = reels.map(r => {
      if (r.id === activeReelId) {
        return { ...r, comments: [...(r.comments || []), { user: user.email.split('@')[0], text: entry.text, time: new Date().toISOString() }] };
      }
      return r;
    });
    setReels(updatedReels);
    setActiveComments(updatedReels.find(r => r.id === activeReelId).comments);
  }

  // 4. Logout
  function logout() {
    setUser(null);
    navigation.replace('Login');
  }

  // 5. Scroll Handling
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // 6. Render Item
  const renderItem = ({ item, index }) => {
    if (!user) return null;
    const isLiked = item.likes && item.likes.includes(user.uid);
    const likeCount = item.likes ? item.likes.length : 0;
    const commentCount = item.comments ? item.comments.length : 0;

    return (
      <View style={styles.videoContainer}>
        <Video
          ref={ref => (videoRefs.current[index] = ref)}
          source={{ uri: item.videoUrl }} // Note: Database field is videoUrl
          style={styles.video}
          resizeMode="cover"
          shouldPlay={index === currentIndex}
          isLooping
        />
        <View style={styles.overlay}>
          <View style={styles.textContainer}>
            <Text style={styles.creatorText}>@{item.creatorName}</Text>
            <Text style={styles.titleText}>{item.title}</Text>
            <View style={{flexDirection:'row'}}>
               {(item.tags || []).map((t, i) => <Text key={i} style={styles.tagText}>#{t}  </Text>)}
            </View>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => onLike(item.id)} style={styles.actionButton}>
              <Ionicons name="heart" size={35} color={isLiked ? "#ff4757" : "white"} />
              <Text style={styles.actionText}>{likeCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openComments(item.id)} style={styles.actionButton}>
              <Ionicons name="chatbubble-ellipses" size={32} color="white" />
              <Text style={styles.actionText}>{commentCount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={reels}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        initialNumToRender={1}
      />
      <View style={styles.floatingHeader}>
        <Text style={styles.brand}>LearnLoop</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>
      </View>
      <CommentModal visible={modalVisible} onClose={() => setModalVisible(false)} comments={activeComments} onPost={postComment} currentUser={user} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  videoContainer: { width: width, height: height, position: 'relative', backgroundColor: 'black' },
  video: { width: '100%', height: '100%' },
  floatingHeader: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 10 },
  brand: { fontSize: 22, fontWeight: '800', color: 'white' },
  logoutBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  logoutText: { color: 'white', fontWeight: '600' },
  overlay: { position: 'absolute', bottom: 80, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  textContainer: { flex: 1, marginRight: 20, paddingBottom: 10 },
  creatorText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  titleText: { color: 'white', fontSize: 15, marginBottom: 5 },
  tagText: { color: '#a78bfa', fontWeight: '700', fontSize: 13 },
  actionsContainer: { alignItems: 'center', marginBottom: 10 },
  actionButton: { alignItems: 'center', marginBottom: 20 },
  actionText: { color: 'white', fontSize: 13, fontWeight: '600', marginTop: 5 }
});