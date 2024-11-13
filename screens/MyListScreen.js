import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import axios from 'axios';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_WIDTH = 85;
const SPACING = 16;

const MyListScreen = () => {
  const [myList, setMyList] = useState({ 'To Watch': [], 'Watched': [] });
  const [tab, setTab] = useState('To Watch');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyList();
  }, []);

  const fetchMyList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('https://api.rapidmock.com/api/vikuman/v1/mylist');
      
      if (response.data && response.data['To Watch'] && response.data['Watched']) {
        setMyList(response.data);
      } else {
        setMyList({ 'To Watch': [], 'Watched': [] });
      }
    } catch (error) {
      console.error('Error fetching list:', error);
      setError('Failed to load your list. Please try again later.');
      setMyList({ 'To Watch': [], 'Watched': [] });
    } finally {
      setLoading(false);
    }
  };

  const currentMovies = myList[tab] || [];

  const CustomTabBar = () => (
    <View style={styles.tabContainer}>
      <View 
        style={[
          styles.tabIndicator,
          { transform: [{ translateX: tab === 'To Watch' ? 0 : SCREEN_WIDTH * 0.35 }] }
        ]} 
      />
      {['To Watch', 'Watched'].map((title) => (
        <TouchableOpacity
          key={title}
          style={styles.tab}
          onPress={() => setTab(title)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            tab === title && styles.activeTabText
          ]}>
            {title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        activeOpacity={0.8}
        style={styles.itemContent}
      >
        <Image
          source={{ uri: item.poster_url }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.itemDetails}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.itemYear}>{item.year || '2024'}</Text>
            <Text style={styles.itemGenre} numberOfLines={1}>
              {item.genre || 'Action, Adventure'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>
              {tab === 'To Watch' ? 'Mark Watched' : 'Remove'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingIndicator} />
        <Text style={styles.loadingText}>Loading your movies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchMyList}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CustomTabBar />
      </View>
      
      <View style={styles.contentContainer}>
        {currentMovies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No movies found</Text>
            <Text style={styles.emptySubtitle}>
              Your {tab.toLowerCase()} list is empty.{'\n'}
              Start adding some movies!
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentMovies}
            keyExtractor={(item) => item.movieId.toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={renderItem}
            initialNumToRender={8}
            maxToRenderPerBatch={5}
            windowSize={7}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B14',
  },
  headerContainer: {
    backgroundColor: '#0A0B14',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0B14',
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 24,
    marginHorizontal: 20,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    width: '45%',
    height: 40,
    backgroundColor: '#7047EB',
    borderRadius: 20,
    top: 4,
    left: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: SPACING,
  },
  itemContainer: {
    marginBottom: SPACING,
  },
  itemContent: {
    flexDirection: 'row',
    backgroundColor: '#1A1D2E',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  poster: {
    width: POSTER_WIDTH,
    height: POSTER_WIDTH * 1.5,
    backgroundColor: '#2A2D3E',
  },
  itemDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemYear: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 4,
  },
  itemGenre: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
  },
  actionButton: {
    backgroundColor: '#7047EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7047EB',
    marginBottom: 16,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#7047EB',
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default MyListScreen;