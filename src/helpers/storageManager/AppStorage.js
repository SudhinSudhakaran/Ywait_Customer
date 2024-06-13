import AsyncStorage from '@react-native-async-storage/async-storage';
export const AppStorage = {
  getItem: async key => {
    try {
      let result = await AsyncStorage.getItem(key);
      //console.log('APPStorage' + Globals.USER_ID);
      return JSON.parse(result);
    } catch (e) {
      throw e;
    }
  },

  setItem: async (key, value) => {
    try {
      const item = JSON.stringify(value);
      return await AsyncStorage.setItem(key, item);
    } catch (e) {
      throw e;
    }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      throw e;
    }
  },

  clearItems: async keys => {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      console.log(`AsyncStorage clearItems ${keys} failed:`, e);
      throw e;
    }
  },
};
