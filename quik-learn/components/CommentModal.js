// components/CommentModal.js
import React, { useState } from 'react';
import { Modal, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function CommentModal({ visible, onClose, comments = [], onPost, currentUser }) {
  const [text, setText] = useState('');

  function post() {
    const t = text.trim();
    if (!t) return;
    onPost({ user: currentUser?.email || 'anon', text: t, time: Date.now() });
    setText('');
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.h2}>Comments</Text>
          <FlatList
            data={comments}
            keyExtractor={(i, idx) => String(idx)}
            style={{ maxHeight:200 }}
            renderItem={({ item }) => (
              <View style={{ marginBottom:8 }}>
                <Text style={{ fontWeight:'700' }}>{item.user}</Text>
                <Text style={{ color:'#6b7280', fontSize:12 }}>{new Date(item.time).toLocaleString()}</Text>
                <Text>{item.text}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color:'#6b7280' }}>No comments yet</Text>}
          />

          <TextInput value={text} onChangeText={setText} placeholder="Write a comment..." style={styles.input} />
          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            <TouchableOpacity onPress={post} style={styles.btn}><Text style={{ color:'#fff' }}>Post</Text></TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor:'#e5e7eb' }]}><Text>Close</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:{flex:1,backgroundColor:'rgba(0,0,0,0.35)',justifyContent:'flex-end'},
  card:{backgroundColor:'#fff',padding:16,borderTopLeftRadius:12,borderTopRightRadius:12},
  h2:{fontSize:18,fontWeight:'700',marginBottom:8},
  input:{borderWidth:1,borderColor:'#e6e7eb',padding:10,borderRadius:8,marginBottom:8},
  btn:{backgroundColor:'#5b21b6',padding:10,borderRadius:8,alignItems:'center'}
});
