// components/ReelCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

export default function ReelCard({ item, onLike, onComment }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.creator}>{item.creator}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <Text style={styles.tags}>{(item.tags || []).slice(0,3).join(', ')}</Text>
      </View>

      <View style={styles.videoWrap}>
        <Video
          source={{ uri: item.src }}
          useNativeControls
          resizeMode="cover"
          style={styles.video}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onLike(item.id)} style={styles.actionBtn}>
          <Text>❤️ Like {item.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onComment(item.id)} style={styles.actionBtn}>
          <Text>💬 Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled style={[styles.actionBtn, { opacity: 0.5 }]}>
          <Text>🔗 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:{backgroundColor:'#fff',borderRadius:12,padding:10,marginBottom:12,elevation:2},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  creator:{fontWeight:'700'},
  title:{color:'#374151'},
  tags:{color:'#6b7280',fontSize:12},
  videoWrap:{height:240,backgroundColor:'#000',borderRadius:8,overflow:'hidden',marginTop:8},
  video:{width:'100%',height:'100%'},
  actions:{flexDirection:'row',justifyContent:'space-between',marginTop:8},
  actionBtn:{padding:8}
});
