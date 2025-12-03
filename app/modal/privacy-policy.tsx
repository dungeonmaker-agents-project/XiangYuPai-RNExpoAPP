/**
 * Privacy Policy Modal - 隐私政策
 * 提供登录页跳转查看的《隐私政策》页面（Expo Router 模态路由）。
 */

import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyPolicyModal() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>关闭</Text>
        </TouchableOpacity>
        <Text style={styles.title}>隐私政策</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>一、我们收集的信息</Text>
        <Text style={styles.paragraph}>
          为向您提供服务并优化体验，我们可能收集必要的账户信息、设备信息和使用情况信息。具体以实际功能为准。
        </Text>

        <Text style={styles.sectionTitle}>二、信息的使用</Text>
        <Text style={styles.paragraph}>
          我们在法律法规允许的范围内，为实现产品功能、提升服务质量和保障安全而使用上述信息，不会超出合理、必要的范围。
        </Text>

        <Text style={styles.sectionTitle}>三、信息的共享与披露</Text>
        <Text style={styles.paragraph}>
          未经您同意，我们不会向第三方提供您的个人信息，法律法规另有规定或监管部门要求的除外。
        </Text>

        <Text style={styles.sectionTitle}>四、信息安全</Text>
        <Text style={styles.paragraph}>
          我们采取行业内合理的安全保护措施保护您的信息安全，但由于技术限制和可能的恶意攻击，无法保证绝对安全。
        </Text>

        <Text style={styles.sectionTitle}>五、您的权利</Text>
        <Text style={styles.paragraph}>
          您有权访问、更正、删除您的个人信息，以及撤回授权或注销账户。您可通过应用内设置或联系我们实现相关操作。
        </Text>

        <Text style={styles.sectionTitle}>六、未成年人保护</Text>
        <Text style={styles.paragraph}>
          如您为未成年人，请在监护人指导下使用本服务，并在监护人同意下提供个人信息。
        </Text>

        <Text style={styles.footerNote}>最后更新：2025-11-08</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  closeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  footerNote: {
    marginTop: 20,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
});

