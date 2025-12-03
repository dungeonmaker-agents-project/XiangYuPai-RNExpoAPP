/**
 * User Terms Modal - 用户协议
 * 提供登录页跳转查看的《用户协议》页面（Expo Router 模态路由）。
 */

import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserTermsModal() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>关闭</Text>
        </TouchableOpacity>
        <Text style={styles.title}>用户协议</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>一、引言</Text>
        <Text style={styles.paragraph}>
          欢迎使用本应用。为保障您的合法权益，请您在使用前仔细阅读并充分理解本《用户协议》。若您继续使用，视为您已阅读并同意本协议的全部内容。
        </Text>

        <Text style={styles.sectionTitle}>二、账户注册与使用</Text>
        <Text style={styles.paragraph}>
          您需提供真实、准确、完整的注册信息，并在信息变更时及时更新。您应妥善保管账户与密码，并对通过该账户进行的操作负责。
        </Text>

        <Text style={styles.sectionTitle}>三、用户行为规范</Text>
        <Text style={styles.paragraph}>
          您承诺不发布违法、侵权、低俗或其他不当内容，不进行任何影响平台秩序或危及平台安全的行为。
        </Text>

        <Text style={styles.sectionTitle}>四、服务变更与中断</Text>
        <Text style={styles.paragraph}>
          我们可能根据业务需要调整、暂停或终止服务，并在法律法规允许的范围内进行解释。本协议未尽事宜，适用相关法律法规。
        </Text>

        <Text style={styles.sectionTitle}>五、知识产权</Text>
        <Text style={styles.paragraph}>
          平台及其内容的相关知识产权归平台或相关权利人所有，未经授权，您不得复制、修改、分发或用于商业用途。
        </Text>

        <Text style={styles.sectionTitle}>六、免责声明</Text>
        <Text style={styles.paragraph}>
          因不可抗力或第三方原因造成的服务中断或数据丢失，我们将在法律允许范围内免责。您应自行备份重要数据。
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

