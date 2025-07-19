import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Analytics() {
  const [manufacturerReports, setManufacturerReports] = useState([
    {
      username: 'Plasticle Manufacturer',
      companyLocation: 'Colombo',
      totalBottlesProduced: 2500,
    },
    {
      username: 'Manufacturer2',
      companyLocation: 'Kandy',
      totalBottlesProduced: 2000,
    },
    {
      username: 'Manufacturer3',
      companyLocation: 'Galle',
      totalBottlesProduced: 1500,
    },
  ]);

  return (
    <LinearGradient
      colors={['#6ff5c2ff', '#ffffff']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Manufacturer Reports</Text>
        {manufacturerReports.map((report, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{report.username}</Text>
            <Text style={styles.text}>Location: {report.companyLocation}</Text>
            <Text style={styles.text}>
              Total Bottles Produced: {report.totalBottlesProduced}
            </Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 3,
  },
});
