/**
 * This code is from https://snack.expo.dev/@adamgrzybowski/react-native-gesture-handler-demo
 */
import React, { Component } from 'react';
import { Animated, StyleSheet, Text, View, I18nManager } from 'react-native';
import {Button} from 'react-native-elements';

import { RectButton, Swipeable } from 'react-native-gesture-handler';

const Icons = {
    'copy': 'content-copy',
    'edit': 'edit',
    'delete': 'delete',
}

type Props = {
    onActionPress: (action: string) => void;
}

export default class ListSwipe extends Component<Props> {
    renderRightAction = (action, color, x, progress) => {
        progress = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [x, 0],
            extrapolate: 'clamp',
        });
        const pressHandler = () => {
            this.props.onActionPress(action);
            this.close();
        };
        return (
            <Animated.View style={{ flex: 1, transform: [{ translateX: progress }] }}>
                <RectButton
                    style={[styles.rightAction, { backgroundColor: color }]}
                    onPress={pressHandler}
                >
                    <Button type='clear' icon={{name: Icons[action], size: 28, color: 'white'}}></Button>
                </RectButton>
            </Animated.View>
        );
    };
    renderRightActions = progress => (
        <View style={{ width: 240, flexDirection: I18nManager.isRTL? 'row-reverse' : 'row' }}>
            {this.renderRightAction('copy', '#C8C7CD', 240, progress)}
            {this.renderRightAction('edit', '#ffab00', 160, progress)}
            {this.renderRightAction('delete', '#dd2c00', 80, progress)}
        </View>
    );
    updateRef = ref => {
        this._swipeableRow = ref;
    };
    close = () => {
        this._swipeableRow.close();
    };
    render() {
        const { children } = this.props;
        return (
            <Swipeable
                ref={this.updateRef}
                friction={2}
                rightThreshold={40}
                renderRightActions={this.renderRightActions}>
                {children}
            </Swipeable>
        );
    }
}

const styles = StyleSheet.create({
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
});
