import React, { useState, useMemo, useEffect } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator } from 'react-native';
import { FAB, List, Searchbar, Text, Button, Menu, Divider, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Lead } from '../types';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '../api/leadsApi';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'LeadList'>;

type SortOption = 'name' | 'id';
type SortDirection = 'asc' | 'desc';

export default function LeadListScreen({ navigation }: Props) {
  // State for search and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user);

  // Set up header right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="account-circle"
          size={24}
          onPress={() => navigation.navigate('Profile')}
        />
      ),
    });
  }, [navigation]);

  // Fetch leads using React Query
  const { 
    data: leads, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await leadsApi.getAll();
      return response.data;
    }
  });

  // Filter and sort leads based on search query and sort options
  const filteredAndSortedLeads = useMemo(() => {
    if (!leads) return [];
    
    // Filter by search query
    const filtered = searchQuery
      ? leads.filter(lead => 
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : leads;
    
    // Sort by selected option
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        const comparison = a.name.localeCompare(b.name);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        // Sort by id (creation date)
        return sortDirection === 'asc' ? Number(a.id) - Number(b.id) : Number(b.id) - Number(a.id);
      }
    });
  }, [leads, searchQuery, sortBy, sortDirection]);

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.statusText}>Loading leads...</Text>
      </View>
    );
  }

  // Render error state
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading leads</Text>
        <Text>{(error as Error).message}</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('LeadList')} 
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Welcome message */}
      {user.username && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome, {user.username}!</Text>
        </View>
      )}
      
      {/* Search bar */}
      <Searchbar
        placeholder="Search leads..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {/* Sort options */}
      <View style={styles.sortContainer}>
        <Text>Sort by: </Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button 
              mode="outlined" 
              onPress={() => setMenuVisible(true)}
              icon={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
            >
              {sortBy === 'name' ? 'Name' : 'Created'}
            </Button>
          }
        >
          <Menu.Item 
            onPress={() => {
              setSortBy('name');
              setMenuVisible(false);
            }} 
            title="Name" 
            trailingIcon={sortBy === 'name' ? 'check' : undefined}
          />
          <Menu.Item 
            onPress={() => {
              setSortBy('id');
              setMenuVisible(false);
            }} 
            title="Created" 
            trailingIcon={sortBy === 'id' ? 'check' : undefined}
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              toggleSortDirection();
              setMenuVisible(false);
            }} 
            title={`Order: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
            trailingIcon={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
          />
        </Menu>
      </View>

      {/* Lead list */}
      {filteredAndSortedLeads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No leads match your search' : 'No leads available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedLeads}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.email}
              left={props => <List.Icon {...props} icon="account" />}
              onPress={() =>
                navigation.navigate('LeadDetail', { leadId: item.id.toString() })
              }
              style={styles.listItem}
            />
          )}
        />
      )}

      {/* Add new lead button */}
      <FAB
        icon="plus"
        onPress={() => navigation.navigate('NewLead')}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  welcomeContainer: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchBar: {
    marginBottom: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 16,
  },
});
