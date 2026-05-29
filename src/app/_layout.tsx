import { StyleSheet, Text, View } from 'react-native'
import React, {useEffect} from 'react'
import { Stack } from 'expo-router'
import { initDatabase } from '@/database/db'

const RootLayout = () => {
  try {
      useEffect(()=>{
    initDatabase();
  },[])
  } catch (error) {
    console.log(`db failed`,error);
    
  }

  return (
  <Stack>
    <Stack.Screen name='(tabs)' options={{headerShown:false}} />
  </Stack>
  )
}

export default RootLayout;

const styles = StyleSheet.create({})