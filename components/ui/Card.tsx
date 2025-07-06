import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  padding?: 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  style,
  variant = 'default',
  padding = 'medium'
}: CardProps) {
  if (variant === 'gradient') {
    return (
      <View style={[styles.card, styles[padding], style]}>
        <LinearGradient
          colors={['rgba(255, 0, 0, 0.1)', 'rgba(255, 51, 51, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles[variant], styles[padding], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(211, 211, 211, 0.1)',
    shadowColor: 'rgba(255, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  
  gradient: {
    width: '100%',
    height: '100%',
    padding: 24,
  },
  
  // Variantes
  default: {
    backgroundColor: '#0A0A0A',
  },
  elevated: {
    backgroundColor: '#0A0A0A',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  
  // Padding
  small: {
    padding: 16,
  },
  medium: {
    padding: 24,
  },
  large: {
    padding: 32,
  },
}); 