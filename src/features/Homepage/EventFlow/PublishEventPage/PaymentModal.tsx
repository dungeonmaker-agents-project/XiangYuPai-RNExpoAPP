/**
 * PaymentModal - 支付弹窗
 * 用于发布组局时的支付确认
 */

import React, { useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface PaymentModalProps {
  visible: boolean;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  amount,
  onConfirm,
  onCancel,
}) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [password, setPassword] = useState('');
  const [useBalance, setUseBalance] = useState(true);
  
  React.useEffect(() => {
    if (visible) {
      setPassword('');
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleConfirm = () => {
    if (password.length !== 6) {
      // TODO: 显示错误提示
      return;
    }
    onConfirm();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                { transform: [{ translateY }] },
              ]}
            >
              {/* 标题 */}
              <View style={styles.header}>
                <Text style={styles.title}>支付确认</Text>
                <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* 金额显示 */}
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>支付金额</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.currencySymbol}>¥</Text>
                  <Text style={styles.amount}>{amount.toFixed(2)}</Text>
                </View>
              </View>

              {/* 支付方式 */}
              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={styles.paymentMethod}
                  onPress={() => setUseBalance(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.methodLeft}>
                    <View style={styles.methodIcon}>
                      <Text style={styles.methodIconText}>💰</Text>
                    </View>
                    <View>
                      <Text style={styles.methodName}>余额支付</Text>
                      <Text style={styles.methodBalance}>可用余额: ¥1000.00</Text>
                    </View>
                  </View>
                  <View style={[styles.radio, useBalance && styles.radioSelected]}>
                    {useBalance && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.paymentMethod}
                  onPress={() => setUseBalance(false)}
                  activeOpacity={0.7}
                >
                  <View style={styles.methodLeft}>
                    <View style={styles.methodIcon}>
                      <Text style={styles.methodIconText}>💳</Text>
                    </View>
                    <View>
                      <Text style={styles.methodName}>其他支付方式</Text>
                      <Text style={styles.methodBalance}>微信、支付宝等</Text>
                    </View>
                  </View>
                  <View style={[styles.radio, !useBalance && styles.radioSelected]}>
                    {!useBalance && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              </View>

              {/* 支付密码输入 */}
              {useBalance && (
                <View style={styles.passwordSection}>
                  <Text style={styles.passwordLabel}>请输入支付密码</Text>
                  <View style={styles.passwordInputContainer}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <View key={index} style={styles.passwordDot}>
                        {password.length > index && (
                          <View style={styles.passwordDotFilled} />
                        )}
                      </View>
                    ))}
                  </View>
                  <TextInput
                    style={styles.hiddenInput}
                    value={password}
                    onChangeText={setPassword}
                    keyboardType="number-pad"
                    maxLength={6}
                    secureTextEntry
                    autoFocus
                  />
                </View>
              )}

              {/* 确认按钮 */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  useBalance && password.length !== 6 && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={useBalance && password.length !== 6}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>确认支付</Text>
              </TouchableOpacity>

              {/* 提示文本 */}
              <Text style={styles.hint}>
                支付即表示您同意相关服务协议
              </Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 16,
    padding: 4,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#6B7280',
    fontWeight: '300',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
  },
  paymentMethods: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodIconText: {
    fontSize: 20,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodBalance: {
    fontSize: 12,
    color: '#6B7280',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#8B5CF6',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
  },
  passwordSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  passwordLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  passwordDot: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordDotFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1F2937',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  confirmButton: {
    marginHorizontal: 20,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

