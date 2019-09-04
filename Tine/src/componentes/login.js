import React, { Component } from 'react';
import { TouchableWithoutFeedback, StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard, ToastAndroid, Image, ActivityIndicator } from 'react-native';
import Signup from '../componentes/registrarse';
const { server } = require('../config/keys');
import styles from '../css/styleLogin';
import { SafeAreaView } from 'react-navigation';
const manejador  = require("./manejadorSqlite");

var timer;

export default class Login extends Component {

    

    static navigationOptions = {
        title: 'Ingresar',
    };

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        }
        this.checkSession();
    }
    checkSession = async () => {
        let usuario = await AsyncStorage.getItem('usuario');
        if (usuario != null) {
            this.props.navigation.navigate('Login');
        }

    }

    openSignup = async () => {
        this.props.navigation.navigate('Signup');
    }


    saveData = async () => {
        Keyboard.dismiss();

        const { email, password } = this.state;

        if (email == "" || password == "") {
            ToastAndroid.show('Ingresa datos validos.', ToastAndroid.SHORT);
            return;
        }

        let loginDetails = {
            email: email,
            password: password
        }

        fetch(server.api + 'login', {
            method: 'POST',
            headers: {
                'Aceptar': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginDetails)
        })

            .then(res => {
                return res.json()
            })
            .then(data => {
                const retorno = data;
                if (retorno.retorno == true) {
                    ToastAndroid.show('Bienvenido.', ToastAndroid.LONG);
                    AsyncStorage.setItem('usuario', JSON.stringify(retorno));

                    if (retorno.tipo == 1) {
                        this.props.navigation.navigate('Inicio');
                    } else {
                        this.props.navigation.navigate('modoTablet');
                        manejador.bajarEmpleadosEmpresa(retorno.id);
                    }

                } else {
                    ToastAndroid.show(retorno.mensaje, ToastAndroid.LONG);
                }
            })
            .catch(function (err) {
                console.log(err);
                ToastAndroid.show("Compruebe su conexión", ToastAndroid.LONG);
            })

    }

    showData = async () => {
        let loginDetails = await AsyncStorage.getItem('usuario');
        let ld = JSON.parse(loginDetails);
        alert('email: ' + ld.email + ' ' + 'password: ' + ld.password);
    }

    registro2 = async () => {
        this.props.navigation.navigate('Signup2', {
            tipo: "empleado"
        });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <TouchableWithoutFeedback>
                    <View style={styles.container}>
                        <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={{ uri: 'https://png.icons8.com/male-user/ultraviolet/50/3498db' }} />
                            <TextInput style={styles.inputBox}
                                onChangeText={(email) => this.setState({ email })}
                                underlineColorAndroid='rgba(0,0,0,0)'
                                placeholder="Email"
                                placeholderTextColor="#002f6c"
                                selectionColor="#fff"
                                keyboardType="email-address"
                                onSubmitEditing={() => this.password.focus()} />
                        </View>
                        <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={{ uri: 'https://png.icons8.com/key-2/ultraviolet/50/3498db' }} />

                            <TextInput style={styles.inputBox}
                                onChangeText={(password) => this.setState({ password })}
                                underlineColorAndroid='rgba(0,0,0,0)'
                                placeholder="Password"
                                secureTextEntry={true}
                                placeholderTextColor="#002f6c"
                                ref={(input) => this.password = input}
                            />
                        </View>
                        <TouchableOpacity onPress={this.saveData} style={[styles.buttonContainer, styles.signupButton]}>
                            <Text style={styles.buttonText} onPress={this.saveData}>Entrar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Text onPress={this.openSignup}>Crear mi cuenta</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>

        )
    }


}
