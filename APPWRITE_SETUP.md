# Appwrite Setup for Saved Movies

## Create the Saved Movies Collection

You need to create a new collection in your Appwrite project for saved movies.

### Steps:

1. Go to your Appwrite Console (https://cloud.appwrite.io)
2. Navigate to your project
3. Go to **Databases** → Select your database
4. Click **Create Collection**
5. Set the Collection ID to: `saved_movies` (or use a custom ID and set it in your `.env` file)
6. Set the Collection Name to: "Saved Movies"

### Required Attributes:

Create the following attributes in your collection:

1. **movie_id** (Integer)
   - Required: Yes
   - Array: No
   - Size: 8 bytes

2. **title** (String)
   - Required: Yes
   - Array: No
   - Size: 255

3. **poster_path** (String)
   - Required: No
   - Array: No
   - Size: 500

4. **release_date** (String)
   - Required: Yes
   - Array: No
   - Size: 20

5. **vote_average** (Double)
   - Required: Yes
   - Array: No

6. **overview** (String)
   - Required: No
   - Array: No
   - Size: 2000

### Permissions:

Set the following permissions:
- **Create**: Any (or Users if you have authentication)
- **Read**: Any (or Users if you have authentication)
- **Update**: Any (or Users if you have authentication)
- **Delete**: Any (or Users if you have authentication)

### Environment Variable (Optional):

If you want to use a different collection ID, add this to your `.env` file:

```
EXPO_PUBLIC_APPWRITE_SAVED_MOVIES_COLLECTION_ID=your_collection_id_here
```

If you don't set this variable, it will default to `saved_movies`.
