import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#181818"
      iconColor={{ default: '#70707A', selected: Platform.OS === 'android' ? '#121212' : '#1ED760' }}
      indicatorColor="#1ED760"
      labelStyle={{ default: { color: '#B3B3B3' }, selected: { color: '#FFFFFF', fontWeight: '700' } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Overview</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>All stats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
