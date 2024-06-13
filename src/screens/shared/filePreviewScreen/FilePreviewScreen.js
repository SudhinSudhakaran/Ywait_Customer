import React, {useState, useRef, useEffect} from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import Pdf from 'react-native-pdf';
import Utilities from '../../../helpers/utils/Utilities';
import {Colors, Fonts, Images,Translations} from '../../../constants';
import {t} from 'i18next';
/**
 *  Must pass below props
 * @param {titleText, url} props
 * @returns
 */
export default function FilePreviewScreen(props) {
  const webViewRef = useRef();
  const timerRef = useRef(null);

  const {titleText, url} = props.route.params;
  const isLocalFile =
    props.route.params.isLocalFile === undefined
      ? false
      : props.route.params.isLocalFile;
  const [docUrl, setDocUrl] = useState();

  const navigation = useNavigation();

  const Spinner = () => (
    <View style={styles.activityContainer}>
      <ActivityIndicator size="large" color={Colors.PRIMARY_COLOR} />
    </View>
  );
  useEffect(() => {
    console.log('URL:', url);
    if (isLocalFile === true) {
    } else {
      let fullURL = 'http://docs.google.com/gview?embedded=true&url=' + url;
      setDocUrl(fullURL);
    }
  }, []);
  const backButtonAction = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    navigation.goBack();
  };

  const onLoadEnd = event => {
    // update component to be aware of loading status
    const {nativeEvent} = event;
    console.log('syntheticEvent:', nativeEvent);
    if (nativeEvent.url !== undefined) {
      let fileExt = Utilities.getFileExtension(nativeEvent.url);
      console.log('FileExt: ', fileExt);
      if (fileExt === 'doc' || fileExt === 'docx') {
        if (nativeEvent.title === '') {
          if (nativeEvent.loading === false) {
            console.log('Reloading..');
            setDocUrl(nativeEvent.url);
            timerRef.current = setTimeout(() => {
              if (webViewRef !== undefined) {
                if (webViewRef.current !== undefined) {
                  try {
                    webViewRef.current.reload();
                  } catch (e) {
                    console.log('onLoadEnd reload error: ', e.toString());
                  }
                }
              }
            }, 3000);
          }
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F9F9F9" barStyle={'dark-content'} />
      <View style={styles.topNavBar}>
        <TouchableOpacity
          style={{
            width: 20,
            height: 20,
            marginLeft: 20,
            alignSelf: 'center',
          }}
          onPress={() => backButtonAction()}>
          <Image
            source={Images.BACK_ARROW}
            style={{
              width: 20,
              height: 20,
              resizeMode: 'contain',
              tintColor: Colors.PRIMARY_TEXT_COLOR,
              transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
            }}
          />
        </TouchableOpacity>
        <Text style={styles.titleLabel} numberOfLines={1}>
          {titleText}
        </Text>
      </View>

      <View style={styles.contentView}>
        {Utilities.getFileExtension(url) === 'pdf' ? (
          isLocalFile === true ? (
            <Pdf
              source={{uri: url, cache: true}}
              onLoadComplete={(numberOfPages, filePath) => {
                //console.log(`Number of pages: ${numberOfPages}`);
              }}
              onPageChanged={(page, numberOfPages) => {
                //console.log(`Current page: ${page}`);
              }}
              onError={error => {
                console.log(`FileAttachmentList error: ${error}`);
              }}
              onPressLink={uri => {
                //console.log(`Link pressed: ${uri}`);
              }}
              style={{flex: 1, marginLeft: 20, marginRight: 20}}
              renderActivityIndicator={progress => {
                //console.log(progress);
                return <ActivityIndicator color={Colors.PRIMARY_COLOR} />;
              }}
            />
          ) : (
            <Pdf
              source={{uri: url, cache: true}}
              onLoadComplete={(numberOfPages, filePath) => {
                //console.log(`Number of pages: ${numberOfPages}`);
              }}
              onPageChanged={(page, numberOfPages) => {
                //console.log(`Current page: ${page}`);
              }}
              onError={error => {
               console.log(`FileAttachmentList error: ${error}`);
              }}
              onPressLink={uri => {
                //console.log(`Link pressed: ${uri}`);
              }}
              style={{flex: 1, marginLeft: 20, marginRight: 20}}
              renderActivityIndicator={progress => {
                //console.log(progress);
                return <ActivityIndicator color={Colors.PRIMARY_COLOR} />;
              }}
            />
          )
        ) : isLocalFile === true ? (
          <WebView
            ref={webViewRef}
            source={{uri: docUrl !== undefined ? docUrl : url}}
            bounces={false}
            // onError={(syntheticEvent) => {
            //     const { nativeEvent } = syntheticEvent;
            //     console.log("WebView error: ", nativeEvent);
            // }}
            startInLoadingState={true}
            renderLoading={Spinner}
            style={{flex: 1, marginLeft: 20, marginRight: 20}}
            showsHorizontalScrollIndicator={false}
            //injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
            scalesPageToFit={false}
            onLoadEnd={syntheticEvent => onLoadEnd(syntheticEvent)}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{uri: docUrl !== undefined ? docUrl : url}}
            bounces={false}
            // onError={(syntheticEvent) => {
            //     const { nativeEvent } = syntheticEvent;
            //     console.log("WebView error: ", nativeEvent);
            // }}
            startInLoadingState={true}
            renderLoading={Spinner}
            style={{flex: 1, marginLeft: 20, marginRight: 20}}
            showsHorizontalScrollIndicator={false}
            //injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
            scalesPageToFit={false}
            onLoadEnd={syntheticEvent => onLoadEnd(syntheticEvent)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#B6B6B6',
  },
  backArrowLabel: {
    marginLeft: 20,
    height: 16,
    width: 16,
    resizeMode: 'contain',
  },
  titleLabel: {
    textAlign: 'center',
    width: '80%',
    marginLeft: 20,
    marginRight: 20,
    color: '#000',
    fontFamily: Fonts.Gibson_Regular,
    fontSize: 17,
    backgroundColor: 'transparent',
  },
  contentView: {
    flex: 1,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  activityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#FFF',
    height: '100%',
    width: '100%',
  },
});
