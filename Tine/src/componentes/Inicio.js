import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
import BackgroundTimer from 'react-native-background-timer';
var mytimer;
export default class Inicio extends Component {
    static navigationOptions = {
        headerStyle: {
            backgroundColor: '#008FAD',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
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
        console.log("sesion",sessionParce);
        if (session === null) {
            this.props.navigation.navigate('Login');
        } else {
            if (sessionParce.tipo == 0) {
                console.log("entra");
                this.props.navigation.navigate('modoTablet');
            }
            else {
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