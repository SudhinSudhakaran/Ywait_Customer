import React, { useState } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Colors } from '../../../constants';

const GetImage = ({ style, url, fullName, alphabetColor = Colors.PRIMARY_COLOR, backgroundColor = 'fff' }) => {

    const [isImageError, setIsImageError] = useState(false);
    //var primaryColor = Colors.PRIMARY_COLOR;

    //console.log(`GetImage received url: ${url}`);

    return (
        <FastImage
            style={style}
            source={{
                uri: isImageError === false && (url?.trim().length > 0) ? url : `https://ui-avatars.com/api/?size=512&name=${fullName}&background=${backgroundColor.replace(/#/g, '')}&color=` + alphabetColor.replace(/#/g, ''),
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
            }}
            onError={() => {
                //console.log(`Image Error fullName: ${fullName}`);
                setIsImageError(true);
            }}
        />
    );
};

export { GetImage };
