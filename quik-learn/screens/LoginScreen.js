import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { UserContext } from '../UserContext';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function LoginScreen({ navigation }) {
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // FIX: Added state setter
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false); // Toggle between Login/Signup

  async function handleAuth() {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    
    setLoading(true);
    try {
      let userCredential;
      let role = 'student'; // Default role

      if (isSignup) {
        // --- SIGN UP LOGIC ---
        // 1. Create Auth User
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        // 2. Determine Role (Simple logic for demo: email contains 'cre')
        if (email.includes('cre')) role = 'creator';

        // 3. Save User Data to Firestore
        await setDoc(doc(db, "users", uid), { email, role, uid });
      } else {
        // --- LOGIN LOGIC ---
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      // Fetch User Role from Firestore to direct them correctly
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser(userData); // Save to Context
        
        if (userData.role === 'creator') {
          navigation.replace('CreatorDashboard');
        } else {
          navigation.replace('StudentHome');
        }
      } else {
        // Fallback if doc doesn't exist (shouldn't happen in normal flow)
        const fallbackUser = { email, uid, role: 'student' };
        setUser(fallbackUser);
        navigation.replace('StudentHome');
      }

    } catch (error) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brand}>QuikLearn</Text>
        <Text style={styles.h2}>{isSignup ? 'Create Account' : 'Welcome Back'}</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="name@email.com" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none" 
        />

        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="********" 
          value={password} 
          onChangeText={setPassword} // FIX: This was missing, causing typing issue
          secureTextEntry 
        />

        {loading ? <ActivityIndicator size="large" color="#5b21b6" style={{marginTop:20}} /> : (
          <>
            <TouchableOpacity onPress={handleAuth} style={styles.btn}>
              <Text style={styles.btnText}>{isSignup ? 'Sign Up' : 'Login'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
              <Text style={styles.muted}>
                {isSignup ? "Already have an account? Login" : "New here? Create Account"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#f6f7fb'},
  card:{width:'90%',backgroundColor:'#fff',padding:20,borderRadius:12,elevation:4},
  brand:{fontSize:22,fontWeight:'700',color:'#5b21b6', textAlign:'center'},
  h2:{fontSize:20,marginTop:8,marginBottom:20, textAlign:'center'},
  label:{fontSize:13,color:'#6b7280',marginTop:8},
  input:{borderWidth:1,borderColor:'#e6e7eb',padding:10,borderRadius:8,marginTop:6},
  btn:{backgroundColor:'#5b21b6',padding:12,borderRadius:8,alignItems:'center',marginTop:20},
  btnText:{color:'#fff',fontWeight:'600'},
  muted:{color:'#6b7280',marginTop:15,fontSize:13, textAlign:'center'}
});