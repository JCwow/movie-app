import { Client, Databases, ID, Query } from "react-native-appwrite";
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SAVED_MOVIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_MOVIES_COLLECTION_ID || 'saved_movies';
const client = new Client().setEndpoint('https://cloud.appwrite.io/v1').setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);
const database = new Databases(client);

export const updateSearchCount = async(query: string, movie: Movie) => {
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', query)
        ])
        if(result.documents.length > 0){
            const existingMovie = result.documents[0];
            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                existingMovie.$id,
                {
                    count: existingMovie.count + 1
                }
            )
        }else{
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm: query,
                movie_id: movie.id,
                count: 1,
                title: movie.title,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            })
        }
    } catch(error){
        console.log(error);
        throw error;
    }
}
export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]) 
        return result.documents as unknown as TrendingMovie[];
    }catch(error){
        console.log(error);
        return undefined;
    }
}

// Saved Movies Functions
export const saveMovie = async (movie: MovieDetails): Promise<void> => {
    try {
        // Check if movie is already saved
        const existingMovies = await database.listDocuments(
            DATABASE_ID,
            SAVED_MOVIES_COLLECTION_ID,
            [Query.equal('movie_id', movie.id)]
        );

        if (existingMovies.documents.length === 0) {
            // Movie not saved, create new document
            await database.createDocument(
                DATABASE_ID,
                SAVED_MOVIES_COLLECTION_ID,
                ID.unique(),
                {
                    movie_id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    release_date: movie.release_date,
                    vote_average: movie.vote_average,
                    overview: movie.overview,
                }
            );
        }
    } catch (error: any) {
        if (error?.code === 404) {
            console.error(`Collection '${SAVED_MOVIES_COLLECTION_ID}' not found. Please create it in Appwrite.`);
            console.error('See APPWRITE_SETUP.md for instructions.');
            throw new Error(`Collection '${SAVED_MOVIES_COLLECTION_ID}' not found. Please create it in Appwrite.`);
        }
        console.log('Error saving movie:', error);
        throw error;
    }
}

export const unsaveMovie = async (movieId: number): Promise<void> => {
    try {
        const existingMovies = await database.listDocuments(
            DATABASE_ID,
            SAVED_MOVIES_COLLECTION_ID,
            [Query.equal('movie_id', movieId)]
        );

        if (existingMovies.documents.length > 0) {
            await database.deleteDocument(
                DATABASE_ID,
                SAVED_MOVIES_COLLECTION_ID,
                existingMovies.documents[0].$id
            );
        }
    } catch (error: any) {
        if (error?.code === 404) {
            console.error(`Collection '${SAVED_MOVIES_COLLECTION_ID}' not found. Please create it in Appwrite.`);
            console.error('See APPWRITE_SETUP.md for instructions.');
        }
        console.log('Error unsaving movie:', error);
        throw error;
    }
}

export const isMovieSaved = async (movieId: number): Promise<boolean> => {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            SAVED_MOVIES_COLLECTION_ID,
            [Query.equal('movie_id', movieId)]
        );
        return result.documents.length > 0;
    } catch (error: any) {
        if (error?.code === 404) {
            console.error(`Collection '${SAVED_MOVIES_COLLECTION_ID}' not found. Please create it in Appwrite.`);
            console.error('See APPWRITE_SETUP.md for instructions.');
        }
        console.log('Error checking if movie is saved:', error);
        return false;
    }
}

export const getSavedMovies = async (): Promise<SavedMovie[]> => {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            SAVED_MOVIES_COLLECTION_ID,
            [Query.orderDesc('$createdAt')]
        );
        return result.documents as unknown as SavedMovie[];
    } catch (error: any) {
        if (error?.code === 404) {
            console.error(`Collection '${SAVED_MOVIES_COLLECTION_ID}' not found. Please create it in Appwrite.`);
            console.error('See APPWRITE_SETUP.md for instructions.');
        }
        console.log('Error fetching saved movies:', error);
        return [];
    }
}