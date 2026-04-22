import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Palette, Duration } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?:        string;
  error?:        string;
  hint?:         string;
  leftIcon?:     keyof typeof Ionicons.glyphMap;
  rightIcon?:    keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  containerStyle?: object;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightPress,
  containerStyle,
  secureTextEntry,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused,         setFocused]         = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const focusAnim  = useRef(new Animated.Value(0)).current;
  const isPassword = secureTextEntry !== undefined;

  const handleFocus = (e: any) => {
    setFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1, duration: Duration.normal, useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0, duration: Duration.fast, useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const borderColor = focusAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [
      error ? Palette.burntSienna : Palette.rawTimber,
      Palette.moss400,
    ],
  });

  const borderWidth = focusAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [1.5, 2],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label,
          focused && styles.labelFocused,
          error   && styles.labelError,
        ]}>
          {label}
        </Text>
      )}

      <Animated.View style={[styles.inputWrapper, { borderColor, borderWidth }, error && styles.inputWrapperError]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={17}
            color={focused ? Palette.moss500 : Palette.driedGrass}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={styles.input}
          placeholderTextColor={Palette.driedGrass}
          secureTextEntry={isPassword ? !passwordVisible : false}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={17}
              color={Palette.driedGrass}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={rightIcon} size={17} color={Palette.driedGrass} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily:   Typography.bodySemi,
    fontSize:     Typography.sm,
    color:        Colors.textSecondary,
    marginBottom: 8,
    marginLeft:   4,
  },
  labelFocused: {
    color: Palette.moss500,
  },
  labelError: {
    color: Palette.burntSienna,
  },
  inputWrapper: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   'rgba(255,255,255,0.6)',
    borderRadius:      9999,
    paddingHorizontal: 18,
    height:            52,
    borderWidth:       1.5,
    borderColor:       Palette.rawTimber,
    shadowColor:       Palette.moss500,
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.04,
    shadowRadius:      6,
  },
  inputWrapperError: {
    borderColor: Palette.burntSienna,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex:            1,
    fontFamily:      Typography.body,
    fontSize:        Typography.base,
    color:           Colors.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Palette.burntSienna,
    marginTop:  6,
    marginLeft: 16,
  },
  hintText: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Colors.textMuted,
    marginTop:  6,
    marginLeft: 16,
  },
});