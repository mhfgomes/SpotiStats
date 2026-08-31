import { NativeTabs } from 'expo-router/unstable-native-tabs';
export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#181818"
      indicatorColor="#1ED760"
      tintColor="#1ED760"
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
    </NativeTabs>
  );
}
