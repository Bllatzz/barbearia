import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Body, Caption } from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  containerStyle,
  icon,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Body color={Colors.textPrimary} weight="bold" style={styles.label}>
          {label}
        </Body>
      )}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            style,
          ]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && (
        <Caption color={Colors.error} style={styles.errorText}>
          {error}
        </Caption>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputFocused: {
    borderColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  inputError: {
    borderColor: Colors.error,
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'Lobster',
    minHeight: 56,
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  errorText: {
    marginTop: 8,
  },
}); 