// screens/LoginScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { UserContext } from '../UserContext';
import { setItemJSON } from '../utils/storage';

export default function LoginScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password] = useState('');

  useEffect(() => {
    // if session exists, redirect - this reads AsyncStorage in child screens as needed.
  }, []);

  function handleLogin() {
    const e = (email || '').trim().toLowerCase();
    if (!e || !e.includes('@')) { Alert.alert('Enter valid email'); return; }

    if (e.endsWith('@stu.com')) {
      const u = { email: e, role: 'student' };
      setUser(u);
      setItemJSON('ll_session', u);
      navigation.replace('StudentHome');
      return;
    }
    if (e.endsWith('@cre.com')) {
      const u = { email: e, role: 'creator' };
      setUser(u);
      setItemJSON('ll_session', u);
      navigation.replace('CreatorDashboard');
      return;
    }
    Alert.alert('Use an email ending with @stu.com or @cre.com for this prototype');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brand}>LearnLoop</Text>
        <Text style={styles.h2}>Login</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="you@stu.com or you@cre.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="(any)" value={password} secureTextEntry autoCapitalize="none" />

        <TouchableOpacity onPress={handleLogin} style={styles.btn}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.muted}>Demo accounts: alice@stu.com, bob@cre.com</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#f6f7fb'},
  card:{width:'90%',maxWidth:420,backgroundColor:'#fff',padding:20,borderRadius:12,elevation:4},
  brand:{fontSize:22,fontWeight:'700',color:'#5b21b6'},
  h2:{fontSize:20,marginTop:8,marginBottom:12},
  label:{fontSize:13,color:'#6b7280',marginTop:8},
  input:{borderWidth:1,borderColor:'#e6e7eb',padding:10,borderRadius:8,marginTop:6},
  btn:{backgroundColor:'#5b21b6',padding:12,borderRadius:8,alignItems:'center',marginTop:14},
  btnText:{color:'#fff',fontWeight:'600'},
  muted:{color:'#6b7280',marginTop:10,fontSize:13}
});
