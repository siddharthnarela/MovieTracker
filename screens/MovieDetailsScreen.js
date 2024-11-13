import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  AntDesign,
  Ionicons,
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 88 : 64;
const POSTER_HEIGHT = height * 0.5;

const MovieDetailsScreen = ({ route, navigation }) => {
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollY = new Animated.Value(0);
  // const route = useRoute();
  // console.log(route.params.movieId);

  // Fetch movie details
  const fetchMovieDetails = async (movieId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`https://api.rapidmock.com/api/vikuman/v1/movies?id=${movieId}`);
      setMovieData(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  // Add to watchlist function
  const addToList = async (status) => {
    try {
      const response = await axios.post('https://api.rapidmock.com/api/vikuman/v1/mylist/add', {
        movieId: movieData.id,
        status: status
      });
      
      // Show success feedback (you can implement your own UI feedback)
      console.log(`Successfully added ${movieData.title} to ${status} list`);
      
      // Optionally refresh the movie list
      const updatedList = await axios.get('https://api.rapidmock.com/api/vikuman/v1/mylist');
      console.log('Updated list:', updatedList.data);
      
    } catch (error) {
      console.error('Error adding to list:', error);
      // Handle error (implement your own error handling UI)
    }
  };

  useEffect(() => {
    if (route.params?.movieId) {
      fetchMovieDetails(route.params.movieId);
    }
  }, [route.params?.movieId]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, POSTER_HEIGHT - HEADER_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.getFullYear();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7047EB" />
      </View>
    );
  }

  if (error || !movieData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => fetchMovieDetails(route.params?.movieId)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <AntDesign name="left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {movieData.title}
          </Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {/* Movie Poster Section */}
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: movieData.poster_url }}
            style={styles.posterImage}
          />
          <LinearGradient
            colors={['transparent', '#13141f']}
            style={styles.posterGradient}
          />
          <View style={styles.movieMetaContainer}>
            <Text style={styles.title}>{movieData.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <AntDesign name="star" size={16} color="#FFD700" />
                <Text style={styles.metaText}>{movieData.rating}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#8a8fa8" />
                <Text style={styles.metaText}>{formatDate(movieData.release_date)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Genre Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreContainer}>
            {movieData.genre.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>{movieData.description}</Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.watchButton]}
          onPress={() => addToList('To Watch')}
        >
          <LinearGradient
            colors={['#7047EB', '#5727E8']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <MaterialCommunityIcons name="bookmark-plus-outline" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Add to Watch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.watchedButton]}
          onPress={() => addToList('Watched')}
        >
          <AntDesign name="checkcircleo" size={20} color="#7047EB" />
          <Text style={[styles.actionButtonText, styles.watchedButtonText]}>
            Mark as Watched
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13141f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#13141f',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#13141f',
    padding: 20,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#7047EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  posterContainer: {
    height: POSTER_HEIGHT,
    width: width,
  },
  posterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  movieMetaContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 20,
  },
  genreContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  genreTag: {
    backgroundColor: 'rgba(112, 71, 235, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(112, 71, 235, 0.3)',
  },
  genreText: {
    color: '#7047EB',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: '#8a8fa8',
    fontSize: 16,
    lineHeight: 24,
  },
  actionContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#1a1d2e',
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  watchButton: {
    backgroundColor: '#7047EB',
  },
  watchedButton: {
    backgroundColor: 'rgba(112, 71, 235, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(112, 71, 235, 0.3)',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  watchedButtonText: {
    color: '#7047EB',
  },
});

export default MovieDetailsScreen;