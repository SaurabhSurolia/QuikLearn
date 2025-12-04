import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { UserContext } from '../UserContext';
import { addVideoToDB } from '../utils/dbService';
import * as ImagePicker from 'expo-image-picker';
// REMOVED: import { storage } ...

export default function UploadScreen({ navigation }) {
  const { user } = useContext(UserContext);
  
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [videoUri, setVideoUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 1. Pick Video
  async function pickVideo() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'], // Updated syntax for newer expo versions
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  }

  // 2. Upload Logic (HACKATHON MODE)
  async function handleUpload() {
    if (!title.trim() || !videoUri) {
      return Alert.alert('Error', 'Please enter a title and pick a video');
    }

    setUploading(true);

    try {
      // --- BYPASSING CLOUD STORAGE ---
      // Instead of uploading to Google, we just use the local URI.
      // This works because the video is already on your phone.
      const fakeCloudUrl = videoUri; 

      // Save metadata to Firestore (Database is still real!)
      const success = await addVideoToDB(
        title,
        fakeCloudUrl, 
        tags.split(',').map(t => t.trim()).filter(t => t),
        user.uid,
        user.email ? user.email.split('@')[0] : 'Creator'
      );

      if (success) {
        Alert.alert('Success', 'Video uploaded successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error('Database save failed');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Upload Micro-Course</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput 
        style={styles.input} 
        placeholder="E.g., Intro to Python Loops" 
        value={title} 
        onChangeText={setTitle} 
      />

      <Text style={styles.label}>Tags</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Coding, Python, Beginner" 
        value={tags} 
        onChangeText={setTags} 
      />

      <Text style={styles.label}>Video Content</Text>
      {videoUri ? (
        <View style={styles.previewContainer}>
          <Text style={styles.successText}>✅ Video Selected</Text>
          <TouchableOpacity onPress={() => setVideoUri(null)}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={pickVideo} style={styles.pickerBtn}>
          <Text style={styles.pickerText}>📂 Choose from Gallery</Text>
        </TouchableOpacity>
      )}

      {uploading ? (
        <ActivityIndicator size="large" color="#5b21b6" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity onPress={handleUpload} style={[styles.btn, { opacity: videoUri ? 1 : 0.5 }]} disabled={!videoUri}>
          <Text style={styles.btnText}>Publish Reel</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.btn, styles.btnOutline]}>
        <Text style={styles.btnOutlineText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f6f7fb' },
  header: { fontSize: 24, fontWeight: '700', color: '#5b21b6', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 16 },
  pickerBtn: { backgroundColor: '#e0e7ff', padding: 20, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#5b21b6', alignItems: 'center', marginBottom: 20 },
  pickerText: { color: '#5b21b6', fontWeight: '600' },
  previewContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#d1fae5', padding: 15, borderRadius: 8, marginBottom: 20 },
  successText: { color: '#065f46', fontWeight: '600' },
  removeText: { color: '#dc2626', fontWeight: '600' },
  btn: { backgroundColor: '#5b21b6', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#5b21b6' },
  btnOutlineText: { color: '#5b21b6', fontWeight: '600' }
});