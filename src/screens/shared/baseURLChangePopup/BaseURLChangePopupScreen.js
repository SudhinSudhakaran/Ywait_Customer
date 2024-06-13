import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
} from 'react-native';
import APIConnection from '../../../helpers/apiManager/APIConnections';
import StorageManager from '../../../helpers/storageManager/StorageManager';
import { Fonts, Colors, Images } from '../../../constants';
import { useFocusEffect } from '@react-navigation/core';
import Utilities from '../../../helpers/utils/Utilities';

export default function BaseURLUpdatePopup(props) {
    const _urlType =
        APIConnection.URL_TYPE === undefined ? 'Staging' : APIConnection.URL_TYPE;
    const [selectedOption, setSelectedOption] = useState(_urlType);
    const [customURL, setCustomURL] = useState(APIConnection.BASE_URL);

    useFocusEffect(
        React.useCallback(() => {
            Utilities.changeKeyboardManager(false);//disabling keyboard manager to avoid extra bottom space
            return () => {
                Utilities.changeKeyboardManager(true);
            };
        }, []),
    );

    const okayButtonHandler = () => {
        //Save url and type
        //Update globals
        switch (selectedOption) {
            case 'Dev':
                StorageManager.saveBaseURL('Dev', APIConnection.DEV_URL);
                break;
            case 'QA':
                StorageManager.saveBaseURL('QA', APIConnection.QA_URL);
                break;
            case 'Staging':
                StorageManager.saveBaseURL('Staging', APIConnection.STAGE_URL);
                break;
            case 'Prod':
                StorageManager.saveBaseURL('Prod', APIConnection.PROD_URL);
                break;
            case 'Custom':
                StorageManager.saveBaseURL('Custom', customURL);
                break;
        }
        props.onBaseUrlSelection();
    };

    const optionSelectionHandler = (type: Int) => {
        switch (type) {
            case 0:
                console.log('Dev selected');
                setSelectedOption('Dev');
                break;
            case 1:
                console.log('QA selected');
                setSelectedOption('QA');
                break;
            case 2:
                console.log('Staging selected');
                setSelectedOption('Staging');
                break;
            case 3:
                console.log('Prod selected');
                setSelectedOption('Prod');
                break;
            case 4:
                console.log('Custom selected');
                setSelectedOption('Custom');
                break;
        }
    };

    return (
        <View style={styles.container}>
            {/* title */}
            <Text style={styles.title}>Select an option</Text>
            {/* Options */}
            <View style={styles.itemsContainer}>
                <TouchableOpacity
                    style={{ height: 30, marginTop: 16 }}
                    onPress={() => optionSelectionHandler(0)}>
                    <View style={styles.items}>
                        <Image
                            source={
                                selectedOption === 'Dev'
                                    ? Images.RADIO_BUTTON_ON
                                    : Images.RADIO_BUTTON_OFF
                            }
                        />
                        <Text numberOfLines={1} style={styles.itemText}>
                            Dev ({APIConnection.DEV_URL})
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ height: 30, marginTop: 16 }}
                    onPress={() => optionSelectionHandler(1)}>
                    <View style={styles.items}>
                        <Image
                            source={
                                selectedOption === 'QA'
                                    ? Images.RADIO_BUTTON_ON
                                    : Images.RADIO_BUTTON_OFF
                            }
                        />
                        <Text numberOfLines={1} style={styles.itemText}>
                            QA ({APIConnection.QA_URL})
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ height: 30, marginTop: 16 }}
                    onPress={() => optionSelectionHandler(2)}>
                    <View style={styles.items}>
                        <Image
                            source={
                                selectedOption === 'Staging'
                                    ? Images.RADIO_BUTTON_ON
                                    : Images.RADIO_BUTTON_OFF
                            }
                        />
                        <Text numberOfLines={1} style={styles.itemText}>
                            Staging ({APIConnection.STAGE_URL})
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ height: 30, marginTop: 16 }}
                    onPress={() => optionSelectionHandler(3)}>
                    <View style={styles.items}>
                        <Image
                            source={
                                selectedOption === 'Prod'
                                    ? Images.RADIO_BUTTON_ON
                                    : Images.RADIO_BUTTON_OFF
                            }
                        />
                        <Text numberOfLines={1} style={styles.itemText}>
                            Prod ({APIConnection.PROD_URL})
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ height: 40, marginTop: 16 }}
                    onPress={() => optionSelectionHandler(4)}>
                    <View style={styles.items}>
                        <Image
                            source={
                                selectedOption === 'Custom'
                                    ? Images.RADIO_BUTTON_ON
                                    : Images.RADIO_BUTTON_OFF
                            }
                        />
                        <Text numberOfLines={1} style={styles.itemText}>
                            Custom
                        </Text>
                        {selectedOption === 'Custom' ? (
                            <TextInput
                                keyboardType={'url'}
                                autoCapitalize={'none'}
                                style={styles.customTextInput}
                                placeholder={'Enter url'}
                                placeholderTextColor="#A1A1A1"
                                onChangeText={text => setCustomURL(text)}
                                value={customURL}
                            />
                        ) : null}
                    </View>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                onPress={() => okayButtonHandler()}
                style={styles.okayButton}>
                <Text style={styles.okayButtonText}>SAVE</Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 30,
    },
    title: {
        fontFamily: Fonts.Gibson_Regular,
        fontSize: 14,
        textAlign: 'left',
        marginLeft: 20,
        marginTop: 30,
    },
    itemsContainer: {
        marginTop: 8,
        marginLeft: 20,
        marginRight: 20,
    },
    items: {
        alignItems: 'center',
        flexDirection: 'row',
        alignContent: 'center',
        marginRight: 5,
    },
    itemText: {
        fontFamily: Fonts.Gibson_Regular,
        fontSize: 14,
        marginLeft: 16,
        marginRight: 5,
        color: Colors.BLACK_COLOR,
    },
    customTextInput: {
        height: 35,
        fontFamily: Fonts.Gibson_Regular,
        fontSize: 12,
        marginLeft: 8,
        borderColor: '#bcbcbc',
        borderWidth: 1,
        width: '65%',
        padding: 2,
        color: Colors.BLACK_COLOR,
    },
    okayButton: {
        backgroundColor: Colors.SECONDARY_COLOR,
        height: 40,
        width: 127,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        alignSelf: 'center',
    },
    okayButtonText: {
        color: Colors.WHITE_COLOR,
        fontFamily: Fonts.Gibson_Regular,
        fontSize: 12,
    },
});
