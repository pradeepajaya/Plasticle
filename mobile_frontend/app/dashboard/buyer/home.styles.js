import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userInfo: {
    marginLeft: 15,
  },
  welcomeText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#fff',
    marginTop: 2,
  },
  scanButtonContainer: {
    alignSelf: 'flex-start',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scanButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#fff',
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    padding: 10,
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#fff',
    marginVertical: 5,
  },
  statLabel: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#4caf50',
    marginLeft: 10,
  },
  newsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  newsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  firstNewsCard: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastNewsCard: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 0,
  },
  singleNewsCard: {
    borderRadius: 12,
  },
  newsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#2d5016',
    marginBottom: 8,
  },
  newsContent: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 15,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  newsDate: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#888',
  },
  carousel: {
    marginTop: 10,
  },
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    height: '100%',
  },
  communityImage: {
    width: '100%',
    height: 150,
  },
  communityContent: {
    flex: 1,
    padding: 15,
  },
  communityTextScroll: {
    flex: 1,
    minHeight: 80,
  },
  communityText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  communityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  communityLikes: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#4CAF50',
  },
  communityTime: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#888',
  },
});