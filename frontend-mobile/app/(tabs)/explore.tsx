import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F9F9F9', dark: '#1A1A1A' }}
      headerImage={
        <IconSymbol
          size={280}
          color="#B0B0B0"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      {/* Contenedor principal */}
      <ThemedView style={styles.container}>
        {/* Título */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={{ fontFamily: Fonts.rounded, color: '#333' }}>
            Explore
          </ThemedText>
        </ThemedView>

        {/* Introducción */}
        <ThemedText style={{ color: '#555', marginBottom: 16 }}>
          This app includes example code to help you get started.
        </ThemedText>

        {/* Secciones collapsibles */}
        <Collapsible title="File-based routing">
          <ThemedText style={{ color: '#555', marginBottom: 8 }}>
            This app has two screens:{' '}
            <ThemedText type="defaultSemiBold" style={{ color: '#222' }}>
              app/(tabs)/index.tsx
            </ThemedText>{' '}
            and{' '}
            <ThemedText type="defaultSemiBold" style={{ color: '#222' }}>
              app/(tabs)/explore.tsx
            </ThemedText>
          </ThemedText>
          <ThemedText style={{ color: '#555', marginBottom: 8 }}>
            The layout file in{' '}
            <ThemedText type="defaultSemiBold" style={{ color: '#222' }}>
              app/(tabs)/_layout.tsx
            </ThemedText>{' '}
            sets up the tab navigator.
          </ThemedText>
          <ExternalLink href="https://docs.expo.dev/router/introduction">
            <ThemedText type="link" style={{ color: '#007AFF' }}>Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>

        <Collapsible title="Android, iOS, and web support">
          <ThemedText style={{ color: '#555', marginBottom: 8 }}>
            You can open this project on Android, iOS, and the web. To open the web version, press{' '}
            <ThemedText type="defaultSemiBold" style={{ color: '#222' }}>w</ThemedText> in the terminal.
          </ThemedText>
        </Collapsible>

        <Collapsible title="Images">
          <ThemedText style={{ color: '#555', marginBottom: 8 }}>
            For static images, you can use the <ThemedText type="defaultSemiBold" style={{ color: '#222' }}>@2x</ThemedText> and{' '}
            <ThemedText type="defaultSemiBold" style={{ color: '#222' }}>@3x</ThemedText> suffixes.
          </ThemedText>
          <Image
            source={require('@/assets/images/react-logo.png')}
            style={{ width: 100, height: 100, alignSelf: 'center', marginVertical: 10 }}
          />
          <ExternalLink href="https://reactnative.dev/docs/images">
            <ThemedText type="link" style={{ color: '#007AFF' }}>Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>

        <Collapsible title="Light and dark mode components">
          <ThemedText style={{ color: '#555', marginBottom: 8 }}>
            This template has light and dark mode support. The{' '}
            <ThemedText type="defaultSemiBold" style={{ color: '#222' }}>useColorScheme()</ThemedText> hook lets you inspect the current color scheme.
          </ThemedText>
          <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
            <ThemedText type="link" style={{ color: '#007AFF' }}>Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>

        <Collapsible title="Animations">
          <ThemedText style={{ color: '#555', marginBottom: 8 }}>
            This template includes an example of an animated component. The{' '}
            <ThemedText type="defaultSemiBold" style={{ color: '#222' }}>components/HelloWave.tsx</ThemedText> component uses{' '}
            <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono, color: '#222' }}>react-native-reanimated</ThemedText>{' '}
            library to create a waving hand animation.
          </ThemedText>
          {Platform.OS === 'ios' && (
            <ThemedText style={{ color: '#555', marginBottom: 8 }}>
              The <ThemedText type="defaultSemiBold" style={{ color: '#222' }}>components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect.
            </ThemedText>
          )}
        </Collapsible>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9F9F9', // minimalista
  },
  headerImage: {
    color: '#B0B0B0',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
});
