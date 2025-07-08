import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";
import { Colors } from "../../constants/Colors";

interface TypographyProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "caption" | "button";
  color?: string;
  weight?: "normal" | "bold" | "light";
  align?: "left" | "center" | "right";
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  color = Colors.textPrimary,
  weight = "normal",
  align = "left",
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        styles[weight],
        { color, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: "Brewheat", // Fonte padrão
    letterSpacing: 0.5,
  },

  // Variantes de tamanho
  h1: {
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: 1,
  },
  h2: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0.8,
  },
  h3: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0.6,
  },
  h4: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.8,
  },

  // Pesos
  normal: {
    fontWeight: "400" as any,
  },
  bold: {
    fontWeight: "700" as any,
  },
  light: {
    fontWeight: "300" as any,
  },
});

// Componentes pré-definidos para facilitar o uso
export const H1: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="h4" {...props} />
);

export const Body: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="body" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="caption" {...props} />
);

export const ButtonText: React.FC<Omit<TypographyProps, "variant">> = (
  props
) => <Typography variant="button" {...props} />;
