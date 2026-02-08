import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { getSavedMovies } from '@/services/appwrite';
import useFetch from '@/services/useFetch';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  subtitle?: string;
}

const StatCard = ({ icon, label, value, subtitle }: StatCardProps) => {
  return (
    <View className="bg-dark-100/50 rounded-2xl p-5 mb-4 border border-dark-200/30">
      <View className="flex-row items-center mb-3">
        <Image source={icon} className="size-6" tintColor="#A8B5DB" />
        <Text className="text-light-300 text-sm font-medium ml-2">{label}</Text>
      </View>
      <Text className="text-white text-3xl font-bold mb-1">{value}</Text>
      {subtitle && (
        <Text className="text-light-300 text-xs">{subtitle}</Text>
      )}
    </View>
  );
};

export default function Profile() {
  const { data: savedMovies, loading, error, refetch } = useFetch(getSavedMovies, false);

  // Refetch when tab is focused
  useFocusEffect(
    useCallback(() => {
      refetch().catch((err) => {
        console.error('Error refetching saved movies:', err);
      });
    }, [refetch])
  );

  // Calculate statistics
  const stats = useMemo(() => {
    if (!savedMovies || savedMovies.length === 0) {
      return {
        totalMovies: 0,
        averageRating: 0,
        mostCommonYear: null,
        oldestMovie: null,
        newestMovie: null,
      };
    }

    // Total movies
    const totalMovies = savedMovies.length;

    // Average rating (vote_average is out of 10, convert to 5-star scale)
    const totalRating = savedMovies.reduce((sum, movie) => sum + (movie.vote_average || 0), 0);
    const averageRating = totalRating / totalMovies;
    const averageRatingOutOf5 = averageRating / 2;

    // Most common release year
    const yearCounts: { [key: string]: number } = {};
    savedMovies.forEach((movie) => {
      if (movie.release_date) {
        const year = movie.release_date.split('-')[0];
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    const mostCommonYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Oldest and newest movies
    const moviesWithDates = savedMovies.filter(m => m.release_date).sort((a, b) => 
      a.release_date.localeCompare(b.release_date)
    );
    const oldestMovie = moviesWithDates[0]?.release_date?.split('-')[0] || null;
    const newestMovie = moviesWithDates[moviesWithDates.length - 1]?.release_date?.split('-')[0] || null;

    return {
      totalMovies,
      averageRating: averageRatingOutOf5,
      mostCommonYear,
      oldestMovie,
      newestMovie,
    };
  }, [savedMovies]);

  if (loading) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="absolute w-full z-0" />
        <View className="flex justify-center items-center flex-1">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="absolute w-full z-0" />
        <View className="flex justify-center items-center flex-1 px-10">
          <Text className="text-red-500 text-center">
            Error: {error.message}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5">
          {/* Header */}
          <View className="flex items-center mt-20 mb-8">
            <Image source={icons.logo} className="w-12 h-10 mb-5" />
            <Text className="text-lg text-white font-bold">Your Statistics</Text>
          </View>

          {/* Statistics Cards */}
          {stats.totalMovies === 0 ? (
            <View className="flex justify-center items-center flex-col gap-5 py-20 min-h-[400px]">
              <Image source={icons.person} className="size-16" tintColor={"#A8B5DB"} />
              <Text className="text-gray-500 text-base text-center px-5">
                No saved movies yet. Start saving movies to see your statistics!
              </Text>
            </View>
          ) : (
            <>
              <StatCard
                icon={icons.save}
                label="Total Saved Movies"
                value={stats.totalMovies}
                subtitle={`${stats.totalMovies} ${stats.totalMovies === 1 ? 'movie' : 'movies'} in your collection`}
              />

              <StatCard
                icon={icons.star}
                label="Average Rating"
                value={stats.averageRating.toFixed(1)}
                subtitle="Out of 5 stars"
              />

              {stats.mostCommonYear && (
                <StatCard
                  icon={icons.play}
                  label="Favorite Year"
                  value={stats.mostCommonYear}
                  subtitle="Most movies from this year"
                />
              )}

              {stats.oldestMovie && stats.newestMovie && (
                <View className="bg-dark-100/50 rounded-2xl p-5 mb-4 border border-dark-200/30">
                  <View className="flex-row items-center mb-3">
                    <Image source={icons.arrow} className="size-6" tintColor="#A8B5DB" />
                    <Text className="text-light-300 text-sm font-medium ml-2">Collection Range</Text>
                  </View>
                  <View className="flex-row justify-between items-end">
                    <View>
                      <Text className="text-white text-2xl font-bold">{stats.oldestMovie}</Text>
                      <Text className="text-light-300 text-xs mt-1">Oldest</Text>
                    </View>
                    <Text className="text-light-300 text-lg mx-4">—</Text>
                    <View>
                      <Text className="text-white text-2xl font-bold">{stats.newestMovie}</Text>
                      <Text className="text-light-300 text-xs mt-1">Newest</Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
