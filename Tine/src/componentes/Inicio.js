import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
import BackgroundTimer from 'react-native-background-timer';
var mytimer;
export default class Inicio extends Component {

    componentDidMount() {
        myTimer = BackgroundTimer.setInterval(() => {
            //console.log('timer');
        }, 3000);
    }
    componentWillUnMount() {
        // Code to stop timer.
        BackgroundTimer.clearInterval(myTimer);
    }

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
                this.props.navigation.navigate('login');
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