import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions, StatusBar, Image } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [isGridView, setIsGridView] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('https://api.rapidmock.com/api/vikuman/v1/movies/all');
      setMovies(response.data);
      // console.log(response.data);
      setFilteredMovies(response.data);
    } catch (error) {
      console.error(error);4
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = movies.filter((movie) =>
      movie.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredMovies(filtered);
  };

  const sortAlphabetically = () => {
    const sortedMovies = [...filteredMovies].sort((a, b) => 
      a.title.localeCompare(b.title)
    );
    setFilteredMovies(sortedMovies);
  };

  const filterByType = (type) => {
    setActiveFilter(type);
    if (type === 'all') {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter((movie) => movie.type === type);
      setFilteredMovies(filtered);
    }
  };

  const renderMovieCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.movieCard, isGridView ? styles.gridCard : styles.listCard]}
      onPress={() => navigation.navigate('Details', { movieId: item.id})}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
        style={styles.cardGradient}
      >
        <View style={[styles.posterContainer, isGridView ? styles.gridPoster : styles.listPoster]}>
          {item.poster_url ? (
            <Image source={{ uri: item.poster_url }} style={styles.poster} />
          ) : (
            <View style={styles.placeholderPoster}>
              <Text style={styles.placeholderText}>{item.title[0]}</Text>
            </View>
          )}
        </View>
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.metaContainer}>
            <View style={styles.typeChip}>
              <Text style={styles.movieType}>{item.type}</Text>
            </View>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>★ {item.rating}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1d2e" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1a1d2e', '#2a2d3e']}
        style={styles.header}
      >
        <Text style={styles.title}>Movie Collection</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies and shows..."
            placeholderTextColor="#8a8fa8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <View style={styles.searchIconContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Controls */}
      <LinearGradient
        colors={['#2a2d3e', '#1a1d2e']}
        style={styles.controlsContainer}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlsScroll}>
          <View style={styles.controls}>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterBtn, activeFilter === 'all' && styles.activeFilter]}
                onPress={() => filterByType('all')}
              >
                <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBtn, activeFilter === 'movie' && styles.activeFilter]}
                onPress={() => filterByType('movie')}
              >
                <Text style={[styles.filterText, activeFilter === 'movie' && styles.activeFilterText]}>
                  Movies
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBtn, activeFilter === 'show' && styles.activeFilter]}
                onPress={() => filterByType('show')}
              >
                <Text style={[styles.filterText, activeFilter === 'show' && styles.activeFilterText]}>
                  TV Shows
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.viewControls}>
              <TouchableOpacity style={styles.controlBtn} onPress={sortAlphabetically}>
                <Text style={styles.controlText}>Sort A-Z</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlBtn} onPress={() => setIsGridView(!isGridView)}>
                <Text style={styles.controlText}>{isGridView ? 'List View' : 'Grid View'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Content */}
      <FlatList
        data={filteredMovies}
        renderItem={renderMovieCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={isGridView ? 2 : 1}
        key={isGridView ? 'grid' : 'list'}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('My List')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#7047EB', '#5727E8']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.fabText}>My List</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13141f',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  searchContainer: {
    position: 'relative',
    marginHorizontal: 10,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 15,
    borderRadius: 16,
    fontSize: 16,
    paddingRight: 50,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIconContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    paddingVertical: 15,
  },
  controls: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtons: {
    flexDirection: 'row',
    marginRight: 15,
  },
  filterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeFilter: {
    backgroundColor: '#7047EB',
    borderColor: '#7047EB',
  },
  filterText: {
    color: '#8a8fa8',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  viewControls: {
    flexDirection: 'row',
  },
  controlBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  controlText: {
    color: '#8a8fa8',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 10,
  },
  movieCard: {
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#2a2d3e',
  },
  cardGradient: {
    flex: 1,
  },
  gridCard: {
    flex: 1,
    margin: 5,
    maxWidth: (width - 30) / 2,
    height: 250,
  },
  listCard: {
    margin: 5,
    height: 160,
  },
  posterContainer: {
    overflow: 'hidden',
    flex: 1,
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity:0.5
  },
  placeholderPoster: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#8a8fa8',
  },
  movieInfo: {
    padding: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(112, 71, 235, 0.3)',
    borderRadius: 6,
  },
  movieType: {
    fontSize: 12,
    color: '#ffffff',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#7047EB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;