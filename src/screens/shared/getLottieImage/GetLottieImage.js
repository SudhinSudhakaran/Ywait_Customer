import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { Colors } from '../../../constants';

const GetLottieImage = ({ style, url }) => {

    const loaderAnim = require('../../../assets/animations/LoaderAnimationNew.json');
    const [LottieAnim, setLottieAnim] = useState();

    useEffect(() => {
        // console.log('url:', url)
        fetch(url)
            .then((response) => response.json())
            .then((responseData) => {
               // console.log(`GetLottieImage url ${url} response data: ${responseData}`);
                setLottieAnim(responseData);
            })
            .catch((error) => {
               // console.log(`GetLottieImage url ${url} error: ${error}`);
            });
    }, [])

    return (
        LottieAnim !== undefined ?
            <LottieView
                style={style}
                source={LottieAnim || loaderAnim}
                autoPlay
                loop
                colorFilters={[
                    {
                        keypath: 'ywait#primary',
                        color: Colors.PRIMARY_COLOR,
                    },
                    {
                        keypath: 'ywait#secondary',
                        color: Colors.SECONDARY_COLOR,
                    },
                ]}
            /> :
            null
    )
};

export { GetLottieImage };