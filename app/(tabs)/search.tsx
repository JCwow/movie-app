import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const {data: movies, loading, error, refetch: loadMovies, reset} = useFetch(() => fetchMovies({query: searchQuery}), false)

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if(searchQuery.trim()){
                const fetchedMovies = await loadMovies();
                if(fetchedMovies && Array.isArray(fetchedMovies) && fetchedMovies.length > 0 && fetchedMovies[0])
                    await updateSearchCount(searchQuery, fetchedMovies[0]);
            }else{
                reset()
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery])

    
    
    return (
        <View className="flex-1 bg-primary">
            <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover"></Image>
            <FlatList 
                data={movies || []} 
                renderItem={({item}) => <MovieCard {...item}></MovieCard>}
                keyExtractor={(item) => item.id.toString()}
                className="px-5"
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: 'center',
                    gap: 16,
                    marginVertical: 16
                }}
                contentContainerStyle={{paddingBottom: 100}}
                ListHeaderComponent={
                    <>
                        <View className="w-full flex-row justify-center mt-20 items-center">
                            <Image source={icons.logo} className="w-12 h-10"></Image>
                        </View>
                        <View className="my-5">
                            <SearchBar placeholder="Search movies... " value={searchQuery} onChangeText={(text: string) => setSearchQuery(text)}></SearchBar>
                        </View>
                        {loading && (
                            <ActivityIndicator size="large" color="#0000ff" className="my-3"></ActivityIndicator>
                        )}
                        {
                            error && (
                                <Text className="text-red-500 px-5 my-3">
                                    Error: {error.message}
                                </Text>
                            )
                        }
                        {
                            !loading && !error && searchQuery.trim() && movies && movies.length > 0 && (
                                <Text className="text-xl text-white font-bold">
                                    Search Results for{' '}
                                    <Text className="text-accent">{searchQuery}</Text>
                                </Text>
                            )
                        }
                        {
                            !loading && !error && searchQuery.trim() && (!movies || movies.length === 0) && (
                                <View className="mt-10 px-5">
                                    <Text className="text-center text-white text-lg">
                                        No movies found
                                    </Text>
                                </View>
                            )
                        }
                        {
                            !loading && !error && !searchQuery.trim() && (
                                <View className="mt-10 px-5">
                                    <Text className="text-center text-white text-lg">
                                        Search for a movie
                                    </Text>
                                </View>
                            )
                        }
                    </>
                }
                ListEmptyComponent={null}>
                
            </FlatList>
        </View>
    );
}
export default Search;
