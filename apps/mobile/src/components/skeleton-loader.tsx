import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/lib/theme';

type SkeletonVariant = 'home' | 'library' | 'settings';

export function SkeletonLoader({ variant }: { variant: SkeletonVariant }) {
  const [opacity] = useState(() => new Animated.Value(0.46));

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted || reduceMotion) return;
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { duration: 720, toValue: 0.82, useNativeDriver: true }),
          Animated.timing(opacity, { duration: 720, toValue: 0.46, useNativeDriver: true }),
        ]),
      );
      animation.start();
    });

    return () => {
      mounted = false;
      animation?.stop();
    };
  }, [opacity]);

  return (
    <View accessibilityLabel="Loading your Spotify information" accessibilityRole="progressbar" style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.pulse, { opacity }]}>
          {variant === 'home' ? <HomeSkeleton /> : variant === 'library' ? <LibrarySkeleton /> : <SettingsSkeleton />}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function Bone({ circle, height, style, width = '100%' }: { circle?: boolean; height: number; style?: object; width?: number | `${number}%` }) {
  return <View style={[styles.bone, { borderRadius: circle ? height / 2 : 6, height, width }, style]} />;
}

function BrandBar() {
  return <View style={styles.brandBar}><Bone circle height={30} width={30} /><Bone height={16} width={84} /><View style={styles.spacer} /><Bone circle height={34} width={34} /></View>;
}

function RangeSkeleton() {
  return <View style={styles.range}>{[0, 1, 2].map((item) => <Bone height={32} key={item} style={styles.rangeItem} />)}</View>;
}

function Rows({ count = 4 }: { count?: number }) {
  return <View style={styles.rows}>{Array.from({ length: count }, (_, index) => <View key={index} style={styles.row}><Bone height={12} width={20} /><Bone height={48} width={48} /><View style={styles.rowCopy}><Bone height={13} width={`${72 - (index % 2) * 12}%`} /><Bone height={9} width={`${52 + (index % 3) * 8}%`} /></View><Bone height={22} width={28} /></View>)}</View>;
}

function HomeSkeleton() {
  return <ScrollView contentContainerStyle={styles.homeContent} scrollEnabled={false} showsVerticalScrollIndicator={false}>
    <BrandBar />
    <View style={styles.greeting}><Bone height={9} width={146} /><Bone height={31} width="58%" /><RangeSkeleton /></View>
    <View style={styles.hero}><View style={styles.heroTop}><Bone height={9} width={90} /><Bone height={22} width={48} /></View><View style={styles.heroBottom}><Bone circle height={124} width={124} /><Bone height={32} width="72%" /><Bone height={11} width="46%" /></View></View>
    <View style={styles.metrics}>{[0, 1, 2].map((item) => <View key={item} style={styles.metric}><Bone height={7} width="65%" /><Bone height={12} width="86%" /></View>)}</View>
    <SectionLine />
    <Rows count={4} />
    <SectionLine />
    <View style={styles.artistRail}>{[0, 1, 2].map((item) => <View key={item} style={styles.artistCard}><Bone circle height={106} width={106} /><Bone height={12} width={78} /><Bone height={8} width={54} /></View>)}</View>
  </ScrollView>;
}

function LibrarySkeleton() {
  return <View style={styles.libraryContent}>
    <View style={styles.libraryHeader}><Bone height={9} width={132} /><Bone height={34} width="62%" /><Bone height={13} width="88%" /><Bone height={13} width="68%" /></View>
    <View style={styles.tabs}>{[0, 1, 2, 3, 4].map((item) => <Bone height={12} key={item} style={styles.tab} />)}</View>
    <RangeSkeleton />
    <View style={styles.summary}><Bone height={20} width={112} /><Bone height={9} width={62} /></View>
    <Rows count={7} />
  </View>;
}

function SettingsSkeleton() {
  return <ScrollView contentContainerStyle={styles.settingsContent} scrollEnabled={false}>
    <BrandBar />
    <Bone height={9} width={104} style={styles.settingsKicker} /><Bone height={36} width={142} style={styles.settingsTitle} />
    <View style={styles.card}><View style={styles.profile}><Bone circle height={58} width={58} /><View style={styles.rowCopy}><Bone height={15} width="56%" /><Bone height={10} width="78%" /><Bone height={8} width="48%" /></View></View><View style={styles.buttonRow}><Bone height={42} style={styles.buttonBone} /><Bone height={42} style={styles.buttonBone} /></View></View>
    <SectionLine />
    <View style={styles.card}><View style={styles.profile}><Bone circle height={42} width={42} /><View style={styles.rowCopy}><Bone height={14} width="48%" /><Bone height={9} width="64%" /></View></View><Bone height={42} width={138} /></View>
    <SectionLine />
    <Rows count={3} />
  </ScrollView>;
}

function SectionLine() {
  return <View style={styles.sectionLine}><Bone height={20} width={126} /><Bone height={9} width={48} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, safeArea: { flex: 1 }, pulse: { flex: 1 }, bone: { backgroundColor: colors.elevated }, spacer: { flex: 1 },
  homeContent: { paddingHorizontal: 16, paddingBottom: 120 }, brandBar: { height: 64, flexDirection: 'row', alignItems: 'center', gap: 9 },
  greeting: { paddingTop: 16, paddingBottom: 22, gap: 13 }, range: { height: 38, flexDirection: 'row', gap: 3, padding: 3, borderRadius: 999, backgroundColor: colors.card }, rangeItem: { flex: 1, borderRadius: 999 },
  hero: { height: 370, padding: 20, borderRadius: 16, backgroundColor: colors.card, justifyContent: 'space-between' }, heroTop: { flexDirection: 'row', justifyContent: 'space-between' }, heroBottom: { gap: 12 },
  metrics: { flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingVertical: 17, marginTop: 12, borderRadius: 12, backgroundColor: colors.card }, metric: { flex: 1, gap: 8 },
  sectionLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, marginBottom: 13 }, rows: { paddingVertical: 4, borderRadius: 12, backgroundColor: colors.card }, row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10 }, rowCopy: { flex: 1, gap: 7 },
  artistRail: { flexDirection: 'row', gap: 10, overflow: 'hidden' }, artistCard: { width: 126, padding: 10, gap: 9, borderRadius: 8, backgroundColor: colors.card },
  libraryContent: { flex: 1, paddingHorizontal: 16 }, libraryHeader: { paddingTop: 28, paddingBottom: 24, gap: 13 }, tabs: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.card }, tab: { flex: 1 }, summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingTop: 24, paddingBottom: 12 },
  settingsContent: { paddingHorizontal: 16, paddingTop: 26, paddingBottom: 120 }, settingsKicker: { marginTop: 30 }, settingsTitle: { marginTop: 10, marginBottom: 24 }, card: { padding: 16, gap: 16, borderRadius: 14, backgroundColor: colors.card }, profile: { flexDirection: 'row', alignItems: 'center', gap: 13 }, buttonRow: { flexDirection: 'row', gap: 8 }, buttonBone: { flex: 1, borderRadius: 22 },
});
