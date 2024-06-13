/**
    * Purpose: creating functions for the dimensions of screen
    * Created/Modified By: Sudhin Sudhakaran
    * Created/Modified Date: 06 Oct 2021
    * Steps:
        1.Get height and width using Dimensions
        2.find the percentage of width of the screen
        3.Find the percentage of height of the screen
        4.Export the value
*/

import React from 'react';
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

const setHeight = h => (height / 100) * h;
const setWidth = w => (width / 100) * w;

export default { setHeight, setWidth };