import React, { Component } from 'react';
import { View, Button, Keyboard, ToastAndroid, AsyncStorage } from 'react-native';
const { server } = require('../config/keys');
//import { ImagePicker, Permissions } from 'expo';
import PinView from 'react-native-pin-view'
import { Icon } from 'react-native-elements';
export default class modoTablet extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: 'ModoTablet',
            headerRight: (
                <Icon
                    name='face'
                    type='material'
                    color='black'
                    onPress={async () => navigation.navigate('perfilEmpresa', { session: await AsyncStorage.getItem('usuario') })} />

            ),
        }
    };

    perfil = async () => {/*
        var usuario = await AsyncStorage.getItem('usuario');
        navigation.navigate('perfil', usuario);*/

        var user = await AsyncStorage.getItem('usuario');
        console.log('usuario', user);
    }


    constructor(props) {
        super(props);
        this.state = {
            foto: '',
            codigo: '',
            inicio: '',
            fin: null,
            empleado_id: ''
        }
        this.perfil();
    }


    confirmar_usuario = async () => {
        Keyboard.dismiss();
        const { codigo } = this.state;

        let loginDetails = {
            codigo: codigo
        }

        fetch(server.api + 'login_tablet', {
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
                    this.state.empleado_id = retorno.id;
                    if (retorno.estado_ree == 1) {
                        ToastAndroid.show('Bienvenido, seleccione aceptar', ToastAndroid.LONG);
                        this.setState({ fin: null });
                    }
                    else {
                        ToastAndroid.show('Buen viaje, seleccione aceptar', ToastAndroid.LONG);
                        var fin = new Date();
                        this.setState({ fin: fin });
                    }
                } else {
                    ToastAndroid.show(retorno.mensaje, ToastAndroid.LONG);
                }
            })
            .catch(function (err) {
                console.log('error', err);
            })

    }



    Alta_asistencia = async () => {
        Keyboard.dismiss();
        const { inicio, fin, foto, empleado_id } = this.state;
        let asistencia_send = {
            inicio: inicio,
            fin: fin,
            foto: foto,
            empleado_id: empleado_id
        }
        fetch(server.api + 'Alta_asistencia', {
            method: 'POST',
            headers: {
                'Aceptar': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(asistencia_send)
        })
            .then(res => {
                return res.json()
            })
            .then(data => {
                const retorno = data;
                console.log(this.state.fin);
                if (retorno.retorno == true) {
                    alert(retorno.mensaje);
                } else {
                    alert(retorno.mensaje);
                }
            })
            .catch(function (err) {
                console.log('error', err);
            })

    }

    takePicture = async () => {
       // await Permissions.askAsync(Permissions.CAMERA);
       /* const { base64, uri } = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            base64: true,
            quality: 0.5
        });*/
        var base64 = 'asd'; 
        var uri = 'asd';
        this.setState({ foto: base64 });
        if (uri == undefined) {
            alert("Tome la foto antes de seguir");
        } else {
            var inicio = new Date();
            this.setState({ inicio: inicio });
            this.Alta_asistencia();
        }
    };

    render() {
        return (
            <View style={{ position: 'absolute', top: 0, left: 30, bottom: 0, justifyContent: 'center' }}>
                <PinView
                    onComplete={(val, clear) => { this.setState({ codigo: val }), clear(), this.confirmar_usuario() }}
                    pinLength={4}
                    inputBgColor="#0083D0"
                    inputBgOpacity={0.6}

                />
                <Button onPress={this.takePicture} title="Aceptar"></Button>
            </View>
        )
    }
}
