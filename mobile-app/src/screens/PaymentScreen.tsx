import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

const PaymentScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { payuData } = route.params;
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);

  // Construct the form HTML
  const formHtml = `
    <html>
      <head>
        <title>Redirecting to Payment...</title>
      </head>
      <body onload="document.getElementById('payuForm').submit()">
        <center>
          <h3>Please wait, redirecting to payment gateway...</h3>
        </center>
        <form id="payuForm" action="https://test.payu.in/_payment" method="post">
          <input type="hidden" name="key" value="${payuData.key}" />
          <input type="hidden" name="txnid" value="${payuData.txnid}" />
          <input type="hidden" name="amount" value="${payuData.amount}" />
          <input type="hidden" name="productinfo" value="${payuData.productinfo}" />
          <input type="hidden" name="firstname" value="${payuData.firstname}" />
          <input type="hidden" name="email" value="${payuData.email}" />
          <input type="hidden" name="phone" value="${payuData.phone}" />
          <input type="hidden" name="surl" value="${payuData.surl}" />
          <input type="hidden" name="furl" value="${payuData.furl}" />
          <input type="hidden" name="hash" value="${payuData.hash}" />
          <input type="hidden" name="udf1" value="" />
          <input type="hidden" name="udf2" value="" />
          <input type="hidden" name="udf3" value="" />
          <input type="hidden" name="udf4" value="" />
          <input type="hidden" name="udf5" value="" />
        </form>
      </body>
    </html>
  `;

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    console.log('WebView URL:', url);

    if (url.includes('/payment/success') || url.includes('/payment-success')) {
      // Payment Successful
      clearCart();
      navigation.navigate('OrderSuccess', { orderId: 'PayU' });
    } else if (url.includes('/payment/failure') || url.includes('/payment-fail')) {
      // Payment Failed
      navigation.navigate('OrderFailure');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <WebView
        source={{ html: formHtml }} // Use baseUrl for assets if needed
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator size="large" color="#000" style={styles.loading} />}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentScreen;
