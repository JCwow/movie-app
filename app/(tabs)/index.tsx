import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError
  } = useFetch(getTrendingMovies);
  const {data: movies, loading: moviesLoading, error: moviesError} = useFetch(() => fetchMovies({query: ''}))
  
  const renderHeader = () => (
    <View className="px-5">
      <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto"></Image>
      <View className="mt-5">
        <SearchBar 
          onPress={() => router.push("/search")} 
          placeholder="Search for a movie" 
          value={""} 
          onChangeText={function (text: string): void {
            throw new Error("Function not implemented.");
          }} 
        />
        {trendingMovies && (
          <View className="mt-10">
            <Text className="text-lg text-white font-bold mt-5 mb-3">Trending Movies</Text>
            <FlatList 
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View className="w-4"/>}
              className="mb-4 mt-3" 
              data={trendingMovies} 
              renderItem={({item, index})=> (
                <TrendingCard movie={item} index={index}></TrendingCard>
              )}
              keyExtractor={(item) => item.movie_id.toString()}
            />
          </View>
        )}
        <Text className="text-lg text-white font-bold mt-5 mb-3">Latest Movies</Text>
      </View>
    </View>
  );

  if (moviesLoading || trendingLoading) {
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

  if (moviesError || trendingError) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="absolute w-full z-0"></Image>
        <Text className="text-white mt-10 text-center px-5">
          Error: {moviesError?.message || trendingError?.message}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0"></Image>
      <FlatList
        data={movies}
        renderItem={({item}) => <MovieCard {...item}></MovieCard>}
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
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      />
    </View>
  );
}
