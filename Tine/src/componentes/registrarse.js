import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableHighlight,
    Image,
    ToastAndroid,
    KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';

const { server } = require('../config/keys');

export default class Signup extends React.Component {

    static navigationOptions = {
        title: 'Crea una cuenta',
    };

    constructor(props) {
        super(props);
        state = {
            fullName: '',
            email: '',
            password: '',
            tipo: 0,
            documento: '',
        };
        console.log('tipo', state.tipo)
    }


    saveData = async () => { /////////////////////////envio de datos a la api
        //Keyboard.dismiss();
        const { email, password, fullName, tipo, documento } = this.state;
        if (email == "" || password == "" || fullName == "") {
            ToastAndroid.show('Ingresa datos validos.', ToastAndroid.SHORT);
            return;
        }

        var tipo2;

        if (tipo == undefined) {
            tipo2 = 0;
        } else {
            tipo2 = tipo;
        }


        //save data with asyncstorage
        let datos = {
            email: email,
            password: password,
            fullName: fullName,
            tipo: tipo2,
            documento: documento
        }
        console.log('tipo', datos);


        fetch(server.api + 'signup', {
            method: 'POST',
            headers: {
                'Aceptar': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        })
            .then(res => {
                return res.json()
            })
            .then(data => {
                const retorno = data;
                console.log(retorno.retorno);
                if (retorno.retorno == true) {
                    //  ToastAndroid.show('Bienvenido', ToastAndroid.SHORT);
                    AsyncStorage.setItem('usuario', JSON.stringify(datos));
                    this.props.navigation.navigate('Signup2', {
                        datos: JSON.stringify(datos)
                    });
                } else {
                    alert(retorno.mensaje);
                }
            })
            .catch(function (err) {
                ToastAndroid.show("Compruebe su conexión", ToastAndroid.LONG);
            })

    }


    render() {
        var radio_props = [
            { label: 'Empresa', value: 0 },
            { label: 'Colaborador', value: 1 }
        ];
        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <View style={styles.container}>
                    <View style={styles.inputContainer}>
                        <Image style={styles.inputIcon} source={{ uri: 'https://img.icons8.com/ultraviolet/50/000000/identification-documents.png' }} />
                        <TextInput style={styles.inputs}
                            placeholder="Documento"
                            underlineColorAndroid='transparent'
                            placeholderTextColor="#002f6c"
                            selectionColor="#fff"
                            onChangeText={(documento) => this.setState({ documento })}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Image style={styles.inputIcon} source={{ uri: 'https://png.icons8.com/male-user/ultraviolet/50/3498db' }} />
                        <TextInput style={styles.inputs}
                            placeholder="Nombre de usuario"
                            keyboardType="email-address"
                            underlineColorAndroid='transparent'
                            placeholderTextColor="#002f6c"
                            selectionColor="#fff"
                            onChangeText={(fullName) => this.setState({ fullName })} />
                    </View>
                    <View style={styles.inputContainer}>
                        <Image style={styles.inputIcon} source={{ uri: 'https://img.icons8.com/ultraviolet/40/000000/email.png' }} />
                        <TextInput style={styles.inputs}
                            placeholder="Correo"
                            keyboardType="email-address"
                            underlineColorAndroid='transparent'
                            placeholderTextColor="#002f6c"
                            selectionColor="#fff"
                            onChangeText={(email) => this.setState({ email })} />
                    </View>
                    <View style={styles.inputContainer}>
                        <Image style={styles.inputIcon} source={{ uri: 'https://png.icons8.com/key-2/ultraviolet/50/3498db' }} />
                        <TextInput style={styles.inputs}
                            placeholder="Contraseña"
                            secureTextEntry={true}
                            underlineColorAndroid='transparent'
                            placeholderTextColor="#002f6c"
                            selectionColor="#fff"
                            onChangeText={(password) => this.setState({ password })} />
                    </View>
                    <View>
                        <RadioForm
                            radio_props={radio_props}
                            initial={0}
                            onPress={(value) => { this.setState({ tipo: value }) }}
                        />
                    </View>
                    <TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={this.saveData}>
                        <Text onPress={this.saveData} style={styles.signUpText}>Sign up</Text>
                    </TouchableHighlight>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffff',
    },
    inputContainer: {
        borderBottomColor: '#8594A6',
        backgroundColor: '#FFFF',
        borderRadius: 30,
        borderBottomWidth: 1,
        width: 250,
        height: 45,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    inputs: {
        height: 45,
        marginLeft: 16,
        borderBottomColor: '#8594A6',
        flex: 1,
    },
    inputIcon: {
        width: 30,
        height: 30,
        marginLeft: 15,
        justifyContent: 'center'
    },
    buttonContainer: {
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 250,
        borderRadius: 30,
    },
    signupButton: {
        backgroundColor: "#034358",
    },
    signUpText: {
        color: 'white',
    }
});