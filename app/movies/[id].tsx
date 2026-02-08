import { icons } from '@/constants/icons';
import { fetchMovieDetails } from '@/services/api';
import { isMovieSaved, saveMovie, unsaveMovie } from '@/services/appwrite';
import useFetch from '@/services/useFetch';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface MovieInfoProps {
    label: string;
    value?: string | number | null;
}

const MovieInfo = ({label, value}: MovieInfoProps) => (
    <View className="flex-col items-start justify-center mt-5">
        <Text className="text-light-200 font-normal text-sm">{label}</Text>
        <Text className="text-light-100 font-bold text-sm mt-2">{value || 'N/A'}</Text>
    </View>
)

const MovieDetails = () => {
    const { id } = useLocalSearchParams();
    const { data: movie, loading} = useFetch(() => fetchMovieDetails(id as string));
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const checkSavedStatus = async () => {
            if (movie?.id) {
                const saved = await isMovieSaved(movie.id);
                setIsSaved(saved);
            }
        };
        checkSavedStatus();
    }, [movie?.id]);

    const handleSaveToggle = async () => {
        if (!movie) return;
        
        setSaving(true);
        try {
            if (isSaved) {
                await unsaveMovie(movie.id);
                setIsSaved(false);
            } else {
                await saveMovie(movie);
                setIsSaved(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save/unsave movie. Please try again.');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="bg-primary flex-1">
            <ScrollView contentContainerStyle={{paddingBottom: 80}}>
                <View className="relative">
                    <Image source={{uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} className="w-full h-[550px]" resizeMode="stretch"></Image>
                    <TouchableOpacity
                        onPress={handleSaveToggle}
                        disabled={saving || !movie}
                        className="absolute top-12 right-5 bg-dark-100/80 rounded-full p-3"
                    >
                        <Image 
                            source={icons.save} 
                            className="size-6" 
                            tintColor={isSaved ? "#FF6B6B" : "#A8B5DB"}
                        />
                    </TouchableOpacity>
                </View>
                <View className="flex-col items-start justify-center mt-5 px-5">
                    <View className="flex-row items-center justify-between w-full">
                        <Text className='text-white font-bold text-xl flex-1'>{movie?.title}</Text>
                    </View>
                    <View className="flex-row items-center gap-x-1 mt-2">
                        <Text className="text-light-200 text-sm">{movie?.release_date?.split('-')[0]}</Text>
                        <Text className="text-light-200 text-sm">{movie?.runtime} m</Text>
                    </View>
                    <View className="flew-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
                        <Image source={icons.star} className="size-4"></Image>
                        <Text className="text-white font-bold text-sm">{Math.round(movie?.vote_average ?? 0)} / 10</Text>
                        <Text className="text-light-200 text-sm">{movie?.vote_count} votes</Text>
                    </View>
                    <MovieInfo label="Overview" value={movie?.overview}></MovieInfo>
                    <MovieInfo label="Genres" value={movie?.genres?.map((g) => g.name).join(' - ') || 'N/A'}></MovieInfo>
                    <View className="flex flex-row justify-between w-1/2">
                        <MovieInfo label="Budget" value={movie?.budget ? `$${movie.budget / 1_000_000} million` : 'N/A'}></MovieInfo>
                        <MovieInfo label="Revenue" value={movie?.revenue ? `$${Math.round(movie.revenue) / 1_000_000} million` : 'N/A'}></MovieInfo>
                    </View>
                    <MovieInfo label="Production Companies" value={movie?.production_companies.map((c) => c.name).join(' - ') || 'N/A'}></MovieInfo>
                </View>
            </ScrollView>
            <TouchableOpacity className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50" onPress={router.back}>
                <Image source={icons.arrow} className='sie-5 mr-1 mt-0.5 rotate-180' tintColor={"#fff"}></Image>
                <Text className="text-white font-semibold text-base">Go Back</Text>
            </TouchableOpacity>
        </View>
    )
}

export default MovieDetails
