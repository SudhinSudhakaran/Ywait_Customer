import React, { Fragment, useRef, useState, useEffect } from "react";
import { Dimensions, View, Platform } from "react-native";
import Modal from "react-native-modalbox";
import StoryListItem from "./StoryListItem";
import StoryCircleListView from "./StoryCircleListView";
import { isNullOrWhitespace } from "./helpers/ValidationHelpers";
import type { IUserStory } from "./interfaces/IUserStory";
import AndroidCubeEffect from "./components/AndroidCubeEffect";
import CubeNavigationHorizontal from "./components/CubeNavigationHorizontal";
import { TextStyle } from "react-native";
import { Globals } from '../../../../constants';
import StorageManager from "../../../../helpers/storageManager/StorageManager";

type Props = {
    data: IUserStory[],
    style?: any,
    unPressedBorderColor?: string,
    pressedBorderColor?: string,
    onClose?: function,
    onStart?: function,
    duration?: number,
    swipeText?: string,
    customSwipeUpComponent?: any,
    customCloseComponent?: any,
    avatarSize?: number,
    avatarStyle?: any,
    showAvatarText?: boolean,
    avatarTextStyle?: TextStyle
};

export const Story = (props: Props) => {
    const {
        data,
        unPressedBorderColor,
        pressedBorderColor,
        style,
        onStart,
        onClose,
        duration,
        swipeText,
        customSwipeUpComponent,
        customCloseComponent,
        avatarSize,
        avatarStyle,
        showAvatarText,
        avatarTextStyle
    } = props;

    const [dataState, setDataState] = useState(data);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedData, setSelectedData] = useState([]);
    const cube = useRef();

    // Component Functions
    const _handleStoryItemPress = (item, index) => {
        const newData = dataState.slice(index);
        if (onStart) {
            onStart(item)
        }

        setCurrentPage(0);
        setSelectedData(newData);
        setIsModalOpen(true);
    };

    useEffect(() => {
        handleSeen();
    }, [currentPage]);

    const handleSeen = () => {
        /*
        const seen = selectedData[currentPage];
        console.log('handleSeen seen: ',seen);
        const seenIndex = dataState.indexOf(seen);
        if (seenIndex > 0) {
            if (!dataState[seenIndex]?.seen) {
                let tempData = dataState;
                dataState[seenIndex] = {
                    ...dataState[seenIndex],
                    seen: true
                }
                setDataState(tempData);
            }
        }
        */

        const seen = selectedData[currentPage];
        console.log('handleSeen seen: ', seen);
        const seenIndex = dataState.indexOf(seen);
        if (seenIndex > 0) {
            if (!dataState[seenIndex]?.seen) {
                let tempData = dataState;
                dataState[seenIndex] = {
                    ...dataState[seenIndex],
                    seen: true
                }
                console.log('handleSeen item: ', dataState[seenIndex]);
                //Save storyID to db
                if (dataState[seenIndex]?.user_id !== undefined) {
                    var currentIds = Globals.SAVED_STORY_IDS;
                    if (currentIds !== null) {
                        currentIds.push(dataState[seenIndex].user_id);
                        const unique = [...new Set(currentIds)]; //remove duplicates
                        Globals.SAVED_STORY_IDS = unique;
                        StorageManager.saveStoryReadIds(unique);
                        console.log('Updated SAVED_STORY_IDS: ', Globals.SAVED_STORY_IDS);
                    }else{
                        Globals.SAVED_STORY_IDS = [dataState[seenIndex]?.user_id];
                        StorageManager.saveStoryReadIds(dataState[seenIndex]?.user_id);
                        console.log('Updated SAVED_STORY_IDS: ', Globals.SAVED_STORY_IDS);
                    }
                }
                setDataState(tempData);
            }
        }
    }

    function onStoryFinish(state) {
        if (!isNullOrWhitespace(state)) {
            if (state == "next") {
                const newPage = currentPage + 1;
                if (newPage < selectedData.length) {
                    setCurrentPage(newPage);
                    cube?.current?.scrollTo(newPage);
                } else {
                    setIsModalOpen(false);
                    setCurrentPage(0);
                    if (onClose) {
                        onClose(selectedData[selectedData.length - 1]);
                    }
                }
            } else if (state == "previous") {
                const newPage = currentPage - 1;
                if (newPage < 0) {
                    setIsModalOpen(false);
                    setCurrentPage(0);
                } else {
                    setCurrentPage(newPage);
                    cube?.current?.scrollTo(newPage);
                }
            }
        }
    }

    const renderStoryList = () => selectedData.map((x, i) => {
        return (<StoryListItem duration={duration * 1000}
            key={i}
            profileName={x.user_name}
            profileImage={x.user_image}
            stories={x.stories}
            currentPage={currentPage}
            onFinish={onStoryFinish}
            swipeText={swipeText}
            customSwipeUpComponent={customSwipeUpComponent}
            customCloseComponent={customCloseComponent}
            onClosePress={() => {
                setIsModalOpen(false);
                if (onClose) {
                    onClose(x);
                }
            }}
            index={i} />)
    })

    const renderCube = () => {
        if (Platform.OS == 'ios') {
            return (
                <CubeNavigationHorizontal
                    ref={cube}
                    callBackAfterSwipe={(x) => {
                        if (x != currentPage) {
                            setCurrentPage(parseInt(x));
                        }
                    }}
                >
                    {renderStoryList()}
                </CubeNavigationHorizontal>
            )
        } else {
            return (<AndroidCubeEffect
                ref={cube}
                callBackAfterSwipe={(x) => {
                    if (x != currentPage) {
                        setCurrentPage(parseInt(x));
                    }
                }}
            >
                {renderStoryList()}
            </AndroidCubeEffect>)
        }
    }

    return (
        <Fragment>
            <View style={style}>
                <StoryCircleListView
                    handleStoryItemPress={_handleStoryItemPress}
                    data={dataState}
                    avatarSize={avatarSize}
                    avatarStyle={avatarStyle}
                    unPressedBorderColor={unPressedBorderColor}
                    pressedBorderColor={pressedBorderColor}
                    showText={showAvatarText}
                    textStyle={avatarTextStyle}
                />
            </View>
            <Modal
                style={{
                    flex: 1,
                    height: Dimensions.get("window").height,
                    width: Dimensions.get("window").width
                }}
                isOpen={isModalOpen}
                onClosed={() => setIsModalOpen(false)}
                position="center"
                swipeToClose
                swipeArea={250}
                backButtonClose
                coverScreen={true}
            >
                {renderCube()}
            </Modal>
        </Fragment>
    );
};
export default Story;

Story.defaultProps = {
    showAvatarText: true
}
