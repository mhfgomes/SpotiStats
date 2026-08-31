import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList style={styles.nav}>
        <TabTrigger name="home" href="/" asChild>
          <Pressable style={styles.tab}><Text style={styles.label}>OVERVIEW</Text></Pressable>
        </TabTrigger>
        <Text style={styles.brand}>SPOTI—STATS</Text>
        <TabTrigger name="library" href={'/explore' as Href} asChild>
          <Pressable style={styles.tab}><Text style={styles.label}>ALL STATS</Text></Pressable>
        </TabTrigger>
        <TabTrigger name="settings" href={'/settings' as Href} asChild>
          <Pressable style={styles.tab}><Text style={styles.label}>SETTINGS</Text></Pressable>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  slot: { height: '100%' },
  nav: { position: 'absolute', top: 18, alignSelf: 'center', width: '95%', maxWidth: 620, height: 48, borderRadius: 24, backgroundColor: '#242424', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 10 },
  label: { color: '#FFFFFF', fontFamily: 'monospace', fontSize: 10, fontWeight: '700' },
  brand: { color: '#1ED760', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
});
