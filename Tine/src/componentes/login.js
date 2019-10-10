import React, { Component } from 'react';
import { Alert, View, Keyboard, ToastAndroid, Text, ScrollView } from 'react-native';
import { Image } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import { TextInput } from 'react-native-paper';
const { server } = require('../config/keys');
import styles from '../css/styleLogin';
const manejador = require("./manejadorSqlite");
import DeviceInfo from 'react-native-device-info';
import { Button } from 'react-native-paper';
var timer;

export default class Login extends Component {

    static navigationOptions = {
        title: 'Ingresar',
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
            email: '',
            password: '',
            // endpoint: "https://servidortesis2019.herokuapp.com/",
            modoTablet: 1,
            cargando: false
        }
        this.checkSession();
    }

    /*   componentDidMount() {
           const { endpoint } = this.state;
           const socket = socketIOClient(endpoint);
           socket.on("FromAPI", data => console.log(data));
       }
   */
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
        this.setState({ cargando: true });
        const { email, password } = this.state;

        if (email == "" || password == "") {
            ToastAndroid.show('Ingresa datos validos.', ToastAndroid.SHORT);
            this.setState({ cargando: false });
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
            .then(async data => {
                const retorno = data;
                console.log(retorno);
                if (retorno.retorno == true) {
                    if (retorno.tipo == 1) {
                        ToastAndroid.show('Bienvenido.', ToastAndroid.LONG);
                        await AsyncStorage.setItem('usuario', JSON.stringify(retorno));
                        this.props.navigation.navigate('Inicio');
                    } else {
                        this.configuraciones(retorno.id);
                        try {
                            const value = await AsyncStorage.getItem('configuraciones');
                            if (value !== null) {
                                this.setState({ 'modoTablet': JSON.parse(value).modoTablet.data[0] });
                            }
                        } catch (e) {
                            console.log("error", e);
                        }
                        console.log("Modo tablet: ", this.state.modoTablet);
                        if (this.state.modoTablet) {
                            await AsyncStorage.setItem('usuario', JSON.stringify(retorno));
                            this.props.navigation.navigate('Inicio');
                            manejador.bajarEmpleadosEmpresa(retorno.id);
                        } else {
                            Alert.alert(
                                "Alerta",
                                "Usted no tiene permitido el ingreso en una tablet",
                            )
                        }


                    }

                } else {
                    ToastAndroid.show(retorno.mensaje, ToastAndroid.LONG);
                    console.log(retorno);
                }
                this.setState({ cargando: false });
                console.log(this.state.cargando);
            })
            .catch(function (err) {
                console.log(err);
                ToastAndroid.show("Compruebe su conexión" + err, ToastAndroid.LONG);
            })

    }

    configuraciones = async (id) => {
        Keyboard.dismiss();
        let tarea_send = {
            id_empresa: id
        }
        console.log("empresa conectada", tarea_send);
        await fetch(server.api + 'configuraciones_empresa', {
            method: 'POST',
            headers: {
                'Aceptar': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tarea_send)
        })
            .then(res => {
                return res.json()
            })
            .then(async data => {
                const retorno = data;
                console.log(retorno.retorno);
                if (retorno.retorno == true) {
                    try {
                        await AsyncStorage.setItem('configuraciones', JSON.stringify(retorno.mensaje[0]));
                    } catch (e) {
                        console.log("error", e);
                        // saving error
                    }
                } else {
                    alert(retorno.mensaje);
                }
                this.setState({ cargando: false });
            })
            .catch(function (err) {
                console.log('error', err);
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
            <ScrollView>
                <View style={styles.container}>
                    <View >
                        <Image
                            source={require('../imagenes/Tesis-logo.png')}
                            style={{ width: 300, height: 300 }}
                        />
                        <TextInput
                            label="Email"
                            style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                            onChangeText={(email) => this.setState({ email })}
                            selectionColor="#008FAD"
                            underlineColor="#008FAD"
                            theme={{
                                colors: {
                                    primary: '#008FAD',
                                    underlineColor: 'transparent'
                                }

                            }}
                            value={this.state.email}
                        />
                    </View>
                    <View>
                        <TextInput
                            label="Contraseña"
                            style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 30 }}
                            onChangeText={(password) => this.setState({ password })}
                            selectionColor="#008FAD"
                            underlineColor="#008FAD"
                            theme={{
                                colors: {
                                    primary: '#008FAD',
                                    underlineColor: 'transparent',
                                }

                            }}
                            value={this.state.password}
                            secureTextEntry={true}
                        />
                    </View>

                    {this.state.cargando ? <Button loading={true} disabled={true} style={{ width: 220, marginBottom: 30 }} color="#008FAD" mode="contained" onPress={this.saveData}></Button> : <Button style={{ width: 220, marginBottom: 30 }} color="#008FAD" mode="contained" onPress={this.saveData}>
                        Iniciar
  </Button>}
                    <Text >¿Nuevo aquí?</Text>
                    <Text style={{ color: '#008FAD' }} onPress={this.openSignup}>Registrate</Text>
                </View>
            </ScrollView>
        )
    }


}
