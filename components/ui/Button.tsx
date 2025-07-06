import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ButtonText } from './Typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  loading = false,
  icon
}: ButtonProps) {
  const renderContent = () => (
    <>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <ButtonText 
        color={variant === 'ghost' ? Colors.primary : Colors.textPrimary}
        weight="bold"
        align="center"
      >
        {loading ? 'Carregando...' : title}
      </ButtonText>
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles[size],
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: Colors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variantes
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  
  // Tamanhos
  small: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  medium: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  large: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    minHeight: 64,
  },
  
  // Estados
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  
  // Ícone
  iconContainer: {
    marginRight: 8,
  },
}); 