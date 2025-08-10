import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, FlatList,
  TextInput, Alert, TouchableOpacity, Linking, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CollectorCalendarScreen() {
  const [allocations, setAllocations] = useState([]);
  const [todayAllocations, setTodayAllocations] = useState([]);
  const [vehicleIds, setVehicleIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

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

      // Filter today's allocations
      const today = getTodayString();
      const todayTasks = allocData.filter(allocation => {
        const allocDate = new Date(allocation.collectionDate).toISOString().split('T')[0];
        return allocDate === today;
      });

      setTodayAllocations(todayTasks);

      // Calculate stats
      const completed = todayTasks.filter(task => task.status === 'active' && task.currentFill === 0).length;
      const pending = todayTasks.length - completed;
      
      setStats({
        total: todayTasks.length,
        completed,
        pending
      });

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

  const openLocationInMaps = (location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    Linking.openURL(url);
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
          previousFill: item.currentFill,
        }),
      });

      const updatedBin = await response.json();

      if (!response.ok) {
        alert(updatedBin.message || "Failed to update collection status");
        return;
      }

      // Update both allocations and today's allocations
      const updateTask = (task) => 
        task.binId === updatedBin.binId
          ? { ...task, collected: true, currentFill: 0, status: 'active' }
          : task;

      setAllocations(prev => prev.map(updateTask));
      setTodayAllocations(prev => prev.map(updateTask));

      // Update stats
      setStats(prev => ({
        ...prev,
        completed: prev.completed + 1,
        pending: prev.pending - 1
      }));

      Alert.alert("Success", "Bin marked as collected");
    } catch (err) {
      console.error(err);
      alert("Error updating collection status");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#064e3b', '#059669', '#10b981']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <LinearGradient colors={['#176407ff', '#059669']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Collection Dashboard</Text>
          <Text style={styles.headerDate}>{formatDate(getTodayString())}</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            setLoading(true);
            fetchAllocations();
          }}
        >
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={[styles.statCard, styles.pendingCard]}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, styles.completedCard]}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Tasks Section */}
      <View style={styles.tasksContainer}>
        <Text style={styles.sectionTitle}>Today's Collection Tasks</Text>
        
        {todayAllocations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No tasks for today</Text>
            <Text style={styles.emptySubtitle}>You have no collections scheduled for today</Text>
          </View>
        ) : (
          <FlatList
            data={todayAllocations}
            keyExtractor={(item) => item.binId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tasksList}
            renderItem={({ item, index }) => {
              const isCollected = item.status === 'active' && item.currentFill === 0;
              return (
                <View style={[styles.taskCard, isCollected && styles.completedTaskCard]}>
                  {/* Task Header */}
                  <View style={styles.taskHeader}>
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskNumber}>#{index + 1}</Text>
                      <View>
                        <Text style={styles.binId}>Bin ID: {item.binId}</Text>
                        <View style={[styles.statusBadge, isCollected ? styles.completedBadge : styles.pendingBadge]}>
                          <Text style={styles.statusText}>
                            {isCollected ? 'COMPLETED' : 'PENDING'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.taskActions}>
                      {isCollected && <Text style={styles.checkIcon}>✓</Text>}
                    </View>
                  </View>

                  {/* Location */}
                  <View style={styles.locationContainer}>
                    <Text style={styles.sectionLabel}>Location</Text>
                    <Text style={styles.locationText}>{item.location}</Text>
                    <TouchableOpacity
                      style={styles.mapButton}
                      onPress={() => openLocationInMaps(item.location)}
                    >
                      <Text style={styles.mapButtonText}>📍 Open in Maps</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Collection Action */}
                  {!isCollected && (
                    <View style={styles.actionContainer}>
                      <Text style={styles.sectionLabel}>Vehicle Information</Text>
                      <TextInput
                        style={styles.vehicleInput}
                        placeholder="Enter Vehicle Number (VA-7020)"
                        placeholderTextColor="#9ca3af"
                        value={vehicleIds[item.binId] || ''}
                        onChangeText={(text) =>
                          setVehicleIds((prev) => ({ ...prev, [item.binId]: text }))
                        }
                      />
                      <TouchableOpacity
                        style={styles.collectButton}
                        onPress={() => toggleCollected(item)}
                      >
                        <Text style={styles.collectButtonText}>Mark as Collected</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isCollected && (
                    <View style={styles.completedContainer}>
                      <Text style={styles.completedText}>✓ Collection completed successfully</Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 16,
    color: '#d1fae5',
    fontWeight: '400',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#64748b',
  },
  pendingCard: {
    borderLeftColor: '#f59e0b',
  },
  completedCard: {
    borderLeftColor: '#10b981',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tasksContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  tasksList: {
    paddingBottom: 24,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  completedTaskCard: {
    borderLeftColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  taskNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
    minWidth: 48,
  },
  binId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  checkIcon: {
    fontSize: 24,
    color: '#10b981',
    fontWeight: 'bold',
  },
  locationContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 24,
  },
  mapButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  vehicleInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1e293b',
    marginBottom: 16,
    fontWeight: '500',
  },
  collectButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  collectButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  completedContainer: {
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  completedText: {
    color: '#065f46',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});