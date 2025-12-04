// screens/CreatorDashboard.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native'; // Import this to refresh data on return
import { getItemJSON, setItemJSON } from '../utils/storage';
import { UserContext } from '../UserContext';
import ReelCard from '../components/ReelCard';
import CommentModal from '../components/CommentModal';

export default function CreatorDashboard({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const isFocused = useIsFocused(); // Hook to know when screen is active
  const [uploads, setUploads] = useState([]);
  const [likesMap, setLikesMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [activeComments, setActiveComments] = useState([]);
  const [activeReelId, setActiveReelId] = useState(null);

  // Load data whenever the screen comes into focus
  useEffect(() => {
    async function init() {
      const session = await getItemJSON('ll_session', null);
      if (!session || session.role !== 'creator') {
        Alert.alert('Please login as creator');
        navigation.replace('Login');
        return;
      }
      const u = await getItemJSON('ll_creator_uploads', []);
      const likes = await getItemJSON('ll_likes', {});
      const comments = await getItemJSON('ll_comments', {});
      setUploads(u || []);
      setLikesMap(likes || {});
      setCommentsMap(comments || {});
    }
    
    if (isFocused) {
      init();
    }
  }, [isFocused]); // Dependency ensures this runs every time you return to this screen

  async function onLike(reelId) {
    const newLikes = { ...likesMap, [reelId]: (likesMap[reelId] || 0) + 1 };
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
    await setItemJSON('ll_session', null);
    setUser(null);
    navigation.replace('Login');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.brand}>LearnLoop</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          {/* FIX: Corrected navigation name */}
          <TouchableOpacity onPress={() => navigation.navigate('UploadScreen')}>
            <Text style={styles.link}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.link}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ padding: 12, flex: 1 }}>
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* FIX: Removed linear-gradient which causes crashes, used solid color */}
            <View style={styles.avatar} />
            <View>
              <Text style={{ fontWeight: '700' }}>You (Creator)</Text>
              <Text style={{ color: '#6b7280' }}>Creator profile</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>My Reels</Text>
        
        {uploads.length === 0 ? (
          <Text style={{ color: '#6b7280', marginTop: 10 }}>No uploads yet. Click Upload to add a reel.</Text>
        ) : (
          <FlatList 
            data={[...uploads].reverse()} 
            keyExtractor={i => i.id} 
            renderItem={({item}) => (
              <ReelCard 
                item={{ ...item, likes: likesMap[item.id] || 0 }} 
                onLike={onLike} 
                onComment={openComments} 
              />
            )} 
          />
        )}
      </View>

      <CommentModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        comments={activeComments} 
        onPost={postComment} 
        currentUser={user} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    // FIX: Added explicit top padding to push buttons down from status bar
    paddingTop: 50, 
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  brand: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#5b21b6' 
  },
  link: { 
    color: '#6b7280', 
    fontWeight: '600',
    fontSize: 16 
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#a78bfa' // Solid color fallback
  }
});