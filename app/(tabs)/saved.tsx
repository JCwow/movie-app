import MovieCard from "@/components/MovieCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { getSavedMovies, unsaveMovie } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";

export default function Saved() {
  const { data: savedMovies, loading, error, refetch } = useFetch(getSavedMovies, false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedRef = useRef(false);

  // Initial load on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      refetch().finally(() => {
        hasLoadedRef.current = true;
        setIsInitialLoad(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when tab is focused, but don't show loading if we already have data
  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current) {
        // Silently refetch in background without showing loading state
        refetch().catch((err) => {
          console.error('Error refetching saved movies:', err);
        });
      }
    }, [refetch])
  );

  const handleUnsave = async (movieId: number) => {
    try {
      await unsaveMovie(movieId);
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to unsave movie. Please try again.');
      console.error(error);
    }
  };

  const renderHeader = () => (
    <View className="px-5">
      <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto"></Image>
      <Text className="text-lg text-white font-bold mt-5 mb-3">Saved Movies</Text>
    </View>
  );

  // Only show full loading screen on initial load
  if (isInitialLoad && loading) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="absolute w-full z-0"></Image>
        <ActivityIndicator
          size="large"
          color="#0000ff"
          className="mt-10 self-center"
        />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="absolute w-full z-0"></Image>
        <Text className="text-white mt-10 text-center px-5">
          Error: {error.message}
        </Text>
      </View>
    );
  }

  if (!savedMovies || savedMovies.length === 0) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="absolute w-full z-0"></Image>
        <View className="flex justify-center items-center flex-1 flex-col gap-5 px-10">
          <Image source={icons.save} className="size-16" tintColor={"#A8B5DB"}></Image>
          <Text className="text-gray-500 text-base text-center">
            No saved movies yet. Save movies by clicking the heart icon on movie details.
          </Text>
        </View>
      </View>
    );
  }

  // Convert SavedMovie to Movie format for MovieCard component
  const moviesForDisplay = savedMovies.map((savedMovie) => ({
    id: savedMovie.movie_id,
    title: savedMovie.title,
    poster_path: savedMovie.poster_path || '',
    release_date: savedMovie.release_date,
    vote_average: savedMovie.vote_average,
    adult: false,
    backdrop_path: '',
    genre_ids: [],
    original_language: '',
    original_title: savedMovie.title,
    overview: savedMovie.overview || '',
    popularity: 0,
    video: false,
    vote_count: 0,
  }));

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0"></Image>
      {loading && !isInitialLoad && (
        <View className="absolute top-20 right-5 z-10 bg-dark-100/80 rounded-full p-2">
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      )}
      <FlatList
        data={moviesForDisplay}
        renderItem={({ item }) => <MovieCard {...item}></MovieCard>}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={{
          justifyContent: 'flex-start',
          gap: 20,
          paddingRight: 5,
          paddingLeft: 20,
          marginBottom: 10
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      />
    </View>
  );
}
