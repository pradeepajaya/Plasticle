import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, FlatList,
  TextInput, Alert, TouchableOpacity, Linking,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CollectorCalendarScreen() {
  const [allocations, setAllocations] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBins, setSelectedBins] = useState([]);
  const [vehicleIds, setVehicleIds] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAllocations = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        alert('Please log in again');
        return;
      }

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
        const dateStr = new Date(allocation.collectionDate).toISOString().split('T')[0];
        if (!marks[dateStr]) {
          marks[dateStr] = { marked: true, dotColor: 'blue' };
        }
      });

      setMarkedDates(marks);
    } catch (err) {
      console.error(err);
      alert('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const onDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);

    const binsForDate = allocations.filter(alloc => {
      const allocDate = new Date(alloc.collectionDate).toISOString().split('T')[0];
      return allocDate === dateString;
    });

    setSelectedBins(binsForDate);
  };

  const toggleCollected = async (item) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const vehicleNumber = vehicleIds[item.binId];

      if (!vehicleNumber || vehicleNumber.trim() === '') {
        Alert.alert('Error', 'Please enter a vehicle number before submitting.');
        return;
      }

      const response = await fetch(`${API_URL}/collector/update-bin-status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          binId: item.binId,
          vehicleId: vehicleNumber,
        }),
      });

      const updatedBin = await response.json();

      if (!response.ok) {
        alert(updatedBin.message || "Failed to update collection status");
        return;
      }

      const updatedAllocations = allocations.map((bin) =>
        bin.binId === updatedBin.binId
          ? { ...bin, collected: true, currentFill: 0, status: 'active' }
          : bin
      );
      setAllocations(updatedAllocations);

      const updatedSelected = selectedBins.map((bin) =>
        bin.binId === updatedBin.binId
          ? { ...bin, collected: true, currentFill: 0, status: 'active' }
          : bin
      );
      setSelectedBins(updatedSelected);

      const binsOnDate = updatedAllocations.filter((bin) => {
        const allocDate = new Date(bin.collectionDate).toISOString().split('T')[0];
        return allocDate === selectedDate;
      });

      const anyUncollected = binsOnDate.some((bin) => !bin.collected);

      setMarkedDates((prev) => {
        const updated = { ...prev };
        if (!anyUncollected) {
          delete updated[selectedDate];
        }
        return updated;
      });

      Alert.alert("Success", "Bin marked as collected");
    } catch (err) {
      console.error(err);
      alert("Error updating collection status");
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={{ flex: 1, justifyContent: 'center' }} />
    );
  }

  return (
    <LinearGradient colors={['#f6faf6ff', '#4faa4cff']} style={styles.container}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}> Your Collection Calendar{'    '}</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => {
          setLoading(true);
          fetchAllocations();
        }}>
          <Text style={styles.refreshText}>♻️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            ...markedDates,
            ...(selectedDate
              ? { [selectedDate]: { selected: true, selectedColor: 'green' } }
              : {}),
          }}
        />
      </View>

      <View style={styles.allocationsContainer}>
        <Text style={styles.title}>
          {selectedDate ? `Allocations on ${selectedDate}` : 'Select a date'}
        </Text>

        {selectedBins.length === 0 && selectedDate ? (
          <Text style={styles.noAllocations}>🚫 No allocations on this day.</Text>

        ) : (
          <FlatList
            data={selectedBins}
            keyExtractor={item => item.binId}
            renderItem={({ item }) => {
              const isCollected = item.status === 'active' && item.currentFill === 0;
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.binId}>♻ {item.binId}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: isCollected ? '#4caf50' : '#f44336' }
                    ]}>
                      <Text style={styles.statusText}>{isCollected ? 'Collected' : 'Pending'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          item.location
                        )}`
                      )
                    }
                  >
                    <Text style={[styles.binText, styles.locationLink]}>
                      📍 Location: {item.location}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.detail}><Text style={styles.label}>📅 Date:</Text> {selectedDate}</Text>

                  {!isCollected && (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter Vehicle ID (e.g., VA-7020)"
                        value={vehicleIds[item.binId] || ''}
                        onChangeText={(text) =>
                          setVehicleIds((prev) => ({ ...prev, [item.binId]: text }))
                        }
                      />
                      <Text style={styles.updateBtn} onPress={() => toggleCollected(item)}>
                        ✅ Mark as Collected
                      </Text>
                    </>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  calendarWrapper: {
    marginTop: 60,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  allocationsContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#23582aff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#5ced73',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  binId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
  detail: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    borderRadius: 8,
    fontSize: 14,
  },
  updateBtn: {
    marginTop: 10,
    color: 'white',
    backgroundColor: '#31880eff',
    paddingVertical: 10,
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  locationLink: {
    color: '#1e88e5',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  noAllocations: {
    color: '#1c462dff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 10,
  },
  calendarHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e5e2eff',
    textAlign: 'center',
  },
  refreshIcon: {
    fontSize: 30,
    color: '#2e7d32',
  },
  calendarWrapper: {
    marginTop: 10, // moved calendar up
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },

});
