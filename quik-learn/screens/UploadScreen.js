// screens/UploadScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { UserContext } from '../UserContext';
import { getItemJSON, setItemJSON } from '../utils/storage';

export default function UploadScreen({ navigation }) {
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  // Pre-filled with a sample video for demo purposes (since actual file upload requires backend)
  const [videoUrl, setVideoUrl] = useState('https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4');

  async function handleUpload() {
    if (!title.trim()) {
      Alert.alert('Please enter a title');
      return;
    }

    const newReel = {
      id: 'reel_' + Date.now(),
      title: title,
      creator: user?.email || 'Unknown Creator',
      // Split comma-separated tags
      tags: tags.split(',').map(t => t.trim()).filter(t => t), 
      src: videoUrl,
      timestamp: Date.now(),
      likes: 0
    };

    // 1. Get existing uploads
    const currentUploads = await getItemJSON('ll_creator_uploads', []);
    
    // 2. Add new reel
    const updatedUploads = [...currentUploads, newReel];

    // 3. Save back to storage
    await setItemJSON('ll_creator_uploads', updatedUploads);

    Alert.alert('Success', 'Reel uploaded successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
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

      <Text style={styles.label}>Tags (comma separated)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Coding, Python, Beginner" 
        value={tags} 
        onChangeText={setTags} 
      />

      <Text style={styles.label}>Video URL (Demo)</Text>
      <TextInput 
        style={styles.input} 
        value={videoUrl} 
        onChangeText={setVideoUrl} 
      />
      <Text style={styles.hint}>* For this prototype, use a direct MP4 link.</Text>

      <TouchableOpacity onPress={handleUpload} style={styles.btn}>
        <Text style={styles.btnText}>Publish Reel</Text>
      </TouchableOpacity>

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
  hint: { fontSize: 12, color: '#9ca3af', marginBottom: 20 },
  btn: { backgroundColor: '#5b21b6', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#5b21b6' },
  btnOutlineText: { color: '#5b21b6', fontWeight: '600' }
});