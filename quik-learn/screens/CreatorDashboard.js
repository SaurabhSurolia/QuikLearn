// screens/CreatorDashboard.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StyleSheet, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons'; // Import Icon library
import { UserContext } from '../UserContext';
import { getCreatorVideos, deleteVideoDB } from '../utils/dbService'; // Import delete service
import ReelCard from '../components/ReelCard';

export default function CreatorDashboard({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const isFocused = useIsFocused();
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    async function init() {
      if (!user) {
        navigation.replace('Login');
        return;
      }
      // FETCH FROM DB
      const dbVideos = await getCreatorVideos(user.uid);
      setUploads(dbVideos);
    }
    if (isFocused) init();
  }, [isFocused, user]);

  function logout() {
    setUser(null);
    navigation.replace('Login');
  }

  // --- DELETE LOGIC ---
  function handleDelete(videoId) {
    Alert.alert(
      "Delete Reel",
      "Are you sure you want to delete this micro-course permanently?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            const success = await deleteVideoDB(videoId);
            if (success) {
              // Remove from UI immediately
              setUploads(prev => prev.filter(item => item.id !== videoId));
              Alert.alert("Deleted", "Reel removed successfully");
            } else {
              Alert.alert("Error", "Could not delete video");
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
      <View style={styles.header}>
        <Text style={styles.brand}>QuikLearn</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <TouchableOpacity onPress={() => navigation.navigate('UploadScreen')}>
            <Text style={styles.link}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.link}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ padding: 12, flex: 1 }}>
        <View style={styles.profileCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.avatar} />
            <View>
              <Text style={{ fontWeight: '700' }}>{user?.email?.split('@')[0]}</Text>
              <Text style={{ color: '#6b7280' }}>Creator Dashboard</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>My Reels</Text>
        
        {uploads.length === 0 ? (
          <Text style={{ color: '#6b7280', marginTop: 10 }}>No uploads yet. Click Upload to add a reel.</Text>
        ) : (
          <FlatList 
            data={uploads} 
            keyExtractor={i => i.id} 
            renderItem={({item}) => (
              <View style={styles.cardContainer}>
                {/* 1. The Video Card */}
                <ReelCard 
                  item={{ ...item, src: item.videoUrl, likes: item.likes ? item.likes.length : 0 }} 
                  onLike={() => Alert.alert('Info', 'You cannot like your own videos from dashboard')} 
                  onComment={() => {}} 
                />

                {/* 2. The Delete Button Overlay */}
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash" size={20} color="white" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )} 
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 50, paddingBottom: 15, paddingHorizontal: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  brand: { fontSize: 20, fontWeight: '700', color: '#5b21b6' },
  link: { color: '#6b7280', fontWeight: '600', fontSize: 16 },
  profileCard: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#a78bfa' },
  
  // New Styles for Delete UI
  cardContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ef4444', // Red color
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
    elevation: 5
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12
  }
});