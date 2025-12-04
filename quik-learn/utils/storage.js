// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItemJSON(key, fallback = null) {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    console.warn('getItemJSON error', e);
    return fallback;
  }
}

export async function setItemJSON(key, obj) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {
    console.warn('setItemJSON error', e);
  }
}
