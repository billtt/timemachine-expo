import React, {Component} from 'react';
import {useState} from 'react';
import {Alert, Modal, StyleSheet, Text, Pressable, View, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {Button} from 'react-native-elements';
import Utils from './Utils';

type EditModalProps = {
    visible: boolean,
    editingItem: any,
    onCancel: () => void,
    onOK: (editingItem:any, content:string, date:Date) => void,
};

class EditModal extends Component<EditModalProps> {
    state = {
        date: new Date(),
        content: '',
        datePickerOpen: false,
    };

    componentDidUpdate(prevProps: Readonly<EditModalProps>, prevState: Readonly<{}>, snapshot?: any) {
        if (this.props.visible && prevProps.visible !== this.props.visible) {
            if (this.props.editingItem) {
                this.setState({
                    content: this.props.editingItem.content,
                    date: new Date(this.props.editingItem.time)
                });
            } else {
                this.setState({
                    content: '',
                    date: new Date(),
                });
            }
        }
    }

    render() {
        const {content, date} = this.state;
        return (
            <View>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.props.visible}
                    onRequestClose={() => {
                        this.setState({visible: false});
                    }}>
                    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <View style={styles.centeredView}>
                            <View style={{flex: 1}}></View>
                            <View style={styles.modalView}>
                                <TextInput multiline placeholder="What's up?" onChangeText={text => this.setState({content:text})} value={content} style={styles.input}/>
                                <input type="datetime-local" value={Utils.toDateTimeLocalString(date)} onChange={(e) => {
                                    this.setState({date: new Date(e.target.value)});
                                }}/>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '50%', marginTop: 20}}>
                                    <Button title='OK' type='clear' onPress={
                                        ()=>this.props.onOK(this.props.editingItem, content, date)}/>
                                    <Button title='Cancel' type='clear' onPress={this.props.onCancel}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    modalView: {
        backgroundColor: 'white',
        padding: 35,
        alignItems: 'center',
        elevation: 5,
        width: '100%',
        alignSelf: 'flex-end',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    input: {
        width: '90%',
        height: 40,
        margin: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        fontSize: 16,
        outlineWidth: 0,
    },
});

export default EditModal;