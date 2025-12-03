/**
 * ResetPasswordPage - 修改密码页面（从忘记密码流程跳转而来）
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthSafeArea } from '../SharedComponents/Layout/AuthSafeArea';

const COLORS = {
  BACKGROUND: '#FFFFFF',
  PRIMARY: '#9C27B0',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_HINT: '#999999',
} as const;

const CONFIG = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
} as const;

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '';
  const country = (params.country as string) || '+86';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPasswordValid = useCallback(() => {
    return (
      newPassword.length >= CONFIG.PASSWORD_MIN_LENGTH &&
      newPassword.length <= CONFIG.PASSWORD_MAX_LENGTH
    );
  }, [newPassword]);

  const isPasswordMatched = useCallback(() => {
    return newPassword === confirmPassword && confirmPassword.length > 0;
  }, [newPassword, confirmPassword]);

  const handleSubmit = useCallback(async () => {
    if (!isPasswordValid() || !isPasswordMatched()) {
      Alert.alert('提示', '请输入有效的密码且确保两次输入一致');
      return;
    }
    try {
      setLoading(true);
      // 模拟请求
      await new Promise((r) => setTimeout(r, 800));
      Alert.alert('重置成功', '密码已重置，请使用新密码登录', [
        {
          text: '确定',
          onPress: () => router.replace('/auth/login'),
        },
      ]);
    } catch (e: any) {
      Alert.alert('重置失败', e?.message || '密码重置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [isPasswordValid, isPasswordMatched, router]);

  return (
    <AuthSafeArea>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={styles.title}>设置新密码</Text>
          {!!phone && (
            <Text style={styles.subtitle}>
              为 {country} {phone} 设置新密码
            </Text>
          )}

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="请输入新密码"
              placeholderTextColor={COLORS.TEXT_HINT}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!passwordVisible}
              maxLength={CONFIG.PASSWORD_MAX_LENGTH}
              autoFocus
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setPasswordVisible((v) => !v)}
            >
              <Ionicons
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={{ height: 16 }} />

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="请再次输入新密码"
              placeholderTextColor={COLORS.TEXT_HINT}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!confirmPasswordVisible}
              maxLength={CONFIG.PASSWORD_MAX_LENGTH}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setConfirmPasswordVisible((v) => !v)}
            >
              <Ionicons
                name={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, (!isPasswordValid() || !isPasswordMatched() || loading) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isPasswordValid() || !isPasswordMatched() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>完成</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthSafeArea>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginBottom: 24 },
  inputWrapper: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 16, color: COLORS.TEXT_PRIMARY },
  eyeButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  primaryButton: {
    height: 50,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  buttonDisabled: { opacity: 0.5 },
});

export default ResetPasswordPage;

