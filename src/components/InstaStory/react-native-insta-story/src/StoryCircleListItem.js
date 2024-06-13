import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { usePrevious } from "./helpers/StateHelpers";

import DEFAULT_AVATAR from "./assets/images/no_avatar.png";

const StoryCircleListItem = (props) => {

    const {
        item,
        unPressedBorderColor,
        pressedBorderColor,
        avatarSize,
        avatarStyle,
        showText,
        textStyle
    } = props;

    const [isPressed, setIsPressed] = useState(props?.item?.seen);

    const prevSeen = usePrevious(props?.item?.seen);

    useEffect(() => {
        if (prevSeen != props?.item?.seen) {
            setIsPressed(props?.item?.seen);
        }

    }, [props?.item?.seen]);

    const _handleItemPress = item => {
        const { handleStoryItemPress } = props;

        if (handleStoryItemPress) handleStoryItemPress(item);

        setIsPressed(true);
    };

    const size = avatarSize ?? 60;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => _handleItemPress(item)}
                style={[
                    styles.avatarWrapper,
                    avatarStyle,
                    {
                        height: size + 4,
                        width: size + 4,
                    },
                    !isPressed
                        ? {
                            borderColor: unPressedBorderColor
                                ? unPressedBorderColor
                                : 'red',
                            borderWidth: 2.2

                        }
                        : {
                            borderColor: pressedBorderColor
                                ? pressedBorderColor
                                : 'grey',
                            borderWidth: 0
                        }
                ]}
            >
                <View style={{
                    height: size - 2, width: size - 2, borderRadius: (size + 2) / 2,
                    borderWidth: 1.5, borderColor: pressedBorderColor, justifyContent: 'center', alignItems: 'center',
                }}>
                    <Image
                        style={{
                            height: size - 12,
                            width: size - 12,
                            borderRadius: 100,
                        }}
                        source={{ uri: item.user_image }}
                        //defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
                    />
                </View>
            </TouchableOpacity>
            {showText &&
                <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                        width: size + 4,
                        ...styles.text,
                        ...textStyle
                    }}>{item.user_name}</Text>}
        </View>
    );
}

export default StoryCircleListItem;

const styles = StyleSheet.create({
    container: {
        marginVertical: 5,
        marginRight: 10
    },
    avatarWrapper: {
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderColor: 'red',
        borderRadius: 100,
        height: 64,
        width: 64,
    },
    text: {
        marginTop: 3,
        textAlign: "center",
        alignItems: "center",
        fontSize: 11
    }
});
