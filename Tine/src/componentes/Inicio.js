import React, { Component } from 'react';
import { StyleSheet, Text, View, AsyncStorage, Keyboard, ToastAndroid } from 'react-native';
const { server } = require('../config/keys');


export default class Inicio extends Component {

    static navigationOptions = {
        title: 'Inicio',
    };


    constructor(props) {
        super(props);
        this.state = {
            
        }

        this.Redirigir();
    }

    Redirigir = async () => {
        // await AsyncStorage.removeItem('usuario');
        let session = await AsyncStorage.getItem('usuario');
        let sessionParce = JSON.parse(session);
        if (session === null) {
            this.props.navigation.navigate('Login');
        } else {
            if (sessionParce.tipo == 0) {
                this.props.navigation.navigate('modoTablet');
            }
            else{
                this.props.navigation.navigate('lista_empresas');
            }
        }
    }
    render() {
        return (
            <>
            </>
        )
    }
}