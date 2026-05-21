import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Account Recovery</Text>
        <Text style={styles.title}>Forgot password</Text>
        <Text style={styles.copy}>Password recovery is handled by your NurseTrack administrator. Please contact your coordinator or administrator to reset your password.</Text>
        <Link href="/" style={styles.link}>Back to login</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { alignItems: 'center', backgroundColor: '#8A252C', flex: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 24, gap: 12, padding: 22, width: '100%' },
  eyebrow: { color: '#8A252C', fontSize: 12, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  title: { color: '#202124', fontSize: 24, fontWeight: '900' },
  copy: { color: '#667085', fontSize: 14, fontWeight: '700', lineHeight: 21 },
  link: { color: '#8A252C', fontSize: 15, fontWeight: '900', marginTop: 6 },
});
