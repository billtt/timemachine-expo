import React, {Component} from 'react';
import {useState} from 'react';
import {Alert, Modal, StyleSheet, Text, Pressable, View, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {Button} from 'react-native-elements';
import Utils from './Utils';

type LoginModalProps = {
    visible: boolean,
    onOK: (name:string, password:string) => void,
};

class LoginModal extends Component<LoginModalProps> {
    state = {
        username: '',
        password: '',
    }
    render() {
        return (
            <View>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.props.visible}
                    >
                    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        {/*<TouchableWithoutFeedback onPress={Keyboard.dismiss}>*/}
                            <View style={styles.centeredView}>
                                <View style={{flex: 1}}></View>
                                <View style={styles.modalView}>
                                    <Text style={{fontSize: 24, fontWeight: 'bold'}}>Login</Text>
                                    <TextInput placeholder="Username" style={styles.input} id='username' autoCapitalize='none' onChangeText={newText => this.setState({username: newText})}/>
                                    <TextInput placeholder="Password" style={styles.input} secureTextEntry={true} autoCapitalize='none' onChangeText={newText => this.setState({password: newText})}/>
                                    <Button title='OK' type='clear' onPress={()=>this.props.onOK(this.state.username, this.state.password)}/>
                                </View>
                            </View>
                        {/*</TouchableWithoutFeedback>*/}
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
        margin: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        fontSize: 18,
        outlineStyle: 'none',   // Safari & Chrome iOS
        outlineWidth: 0,
        boxShadow: 'none',      // older Safari versions
    },
});

export default LoginModal;