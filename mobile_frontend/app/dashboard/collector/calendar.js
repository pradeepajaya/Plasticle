import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TextInput, Alert } from 'react-native';
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

      const response = await fetch(`${API_URL}/collector/update-bin-status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          binId: item.binId,
          vehicleId: vehicleIds[item.binId],
        }),
      });

      const updatedBin = await response.json();

      if (!response.ok) {
        alert(updatedBin.message || "Failed to update collection status");
        return;
      }

      //  Force collected: true in frontend
      updatedBin.collected = true;

      // Update allocations
      const updatedAllocations = allocations.map((bin) =>
        bin.binId === updatedBin.binId ? { ...bin, collected: true } : bin
      );
      setAllocations(updatedAllocations);

      // Update selectedBins
      const updatedSelected = selectedBins.map((bin) =>
        bin.binId === updatedBin.binId ? { ...bin, collected: true } : bin
      );
      setSelectedBins(updatedSelected);

      // Remove dot if all bins on selectedDate are collected
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
    <LinearGradient colors={['#5ced73', '#ffffff']} style={styles.container}>
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
          <Text>No allocations on this day.</Text>
        ) : (
          <FlatList
            data={selectedBins}
            keyExtractor={item => item.binId}
            renderItem={({ item }) => (
              <View style={styles.binItem}>
                <Text style={styles.binText}>♻ Bin ID: {item.binId}</Text>
                <Text style={styles.binText}>📍 Location: {item.location}</Text>
                <Text style={styles.binText}>✅ Collected: {item.collected ? "Yes" : "No"}</Text>

                {!item.collected ? (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Vehicle ID (VA-7020)"
                      value={vehicleIds[item.binId] || ''}
                      onChangeText={(text) =>
                        setVehicleIds((prev) => ({ ...prev, [item.binId]: text }))
                      }
                    />
                    <Text style={styles.updateBtn} onPress={() => toggleCollected(item)}>
                      Mark as Collected
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.collectedText]}>
                    ✅ Marked Collected
                  </Text>
                )}
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
  calendarWrapper: {
    marginTop: 60,
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
    padding: 15,
    backgroundColor: 'rgb(209, 235, 206)',
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  binText: {
    fontSize: 14,
    marginBottom: 4,
  },
  collectedText: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
    marginTop: 8,
  },
  input: {
    marginTop: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  updateBtn: {
    marginTop: 8,
    color: 'white',
    backgroundColor: '#4caf50',
    padding: 6,
    borderRadius: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});
