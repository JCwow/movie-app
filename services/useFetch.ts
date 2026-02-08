import { useCallback, useEffect, useRef, useState } from "react";
// fetchMovies
// fetchMovieDetails
// useFetch(fetchMovies)
const useFetch = <T>(fetchFunction: () => Promise<T>, autoFetch = true) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const fetchFunctionRef = useRef(fetchFunction);

    // Update ref when fetchFunction changes
    useEffect(() => {
        fetchFunctionRef.current = fetchFunction;
    }, [fetchFunction]);

    const fetchData = useCallback(async() => {
        try{
            setLoading(true);
            setError(null);
            const result = await fetchFunctionRef.current();
            setData(result);
            return result;
        }catch(err){
            setError(err instanceof Error ? err: new Error('An error occurred'))
            throw err;
        }finally{
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if(autoFetch){
            fetchData();
        }
    }, [autoFetch, fetchData]);

    return {data, loading, error, refetch: fetchData, reset};
}
export default useFetch