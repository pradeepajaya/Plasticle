import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient'; 

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CollectorCalendarScreen() {
  const [allocations, setAllocations] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBins, setSelectedBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserIdAndAllocations = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          alert('Please log in again');
          return;
        }

        const userResponse = await fetch(`${API_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        if (!userResponse.ok) {
          alert(userData.error || 'Failed to fetch user info');
          return;
        }
        setUserId(userData.user._id);

        const allocResponse = await fetch(`${API_URL}/collector/allocations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allocData = await allocResponse.json();
        if (!allocResponse.ok) {
          alert(allocData.error || 'Failed to fetch allocations');
          return;
        }
        setAllocations(allocData);

        const marks = {};
        allocData.forEach(allocation => {
          const dateStr = allocation.collectionDate.split('T')[0];
          marks[dateStr] = {
            marked: true,
            dotColor: 'blue',
          };
        });
        setMarkedDates(marks);
      } catch (err) {
        console.error(err);
        alert('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserIdAndAllocations();
  }, []);

  const onDayPress = day => {
    setSelectedDate(day.dateString);
    const binsForDate = allocations.filter(
      alloc => alloc.collectionDate.split('T')[0] === day.dateString
    );
    setSelectedBins(binsForDate);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <LinearGradient
      colors={['#5ced73', '#ffffff']} 
      style={styles.container}
    >
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          ...markedDates,
          ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: 'green' } } : {})
        }}
      />
      <View style={styles.allocationsContainer}>
        <Text style={styles.title}>
          {selectedDate ? `Allocations on ${selectedDate}` : 'Select a date'}
        </Text>
        {selectedBins.length === 0 && selectedDate ? (
          <Text>No allocations on this day.</Text>
        ) : (
          <FlatList
            data={selectedBins}
            keyExtractor={item => item.binId}
            renderItem={({ item }) => (
              <View style={styles.binItem}>
                <Text>Bin ID: {item.binId}</Text>
                <Text>Area: {item.area || 'N/A'}</Text>
              </View>
            )}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  allocationsContainer: {
    marginTop: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  binItem: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 10,
  },
});
