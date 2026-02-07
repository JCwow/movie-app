import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import './global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={true}></StatusBar>
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{headerShown: false}}>
        </Stack.Screen>
        <Stack.Screen
          name="movie/[id]" 
          options={{headerShown: false}}
        ></Stack.Screen>
      </Stack>
    </>
  )
}
