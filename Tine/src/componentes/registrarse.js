import React from 'react';
import {
    StyleSheet,
    View,
    ToastAndroid,
    KeyboardAvoidingView
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import RadioForm from 'react-native-simple-radio-button';

const { server } = require('../config/keys');

export default class Signup extends React.Component {

    static navigationOptions = {
        title: 'Crea una cuenta',
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
            fullName: '',
            email: '',
            password: '',
            tipo: 0,
            documento: '',
        };
        console.log('tipo', this.state.tipo)
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
                <View style={styles.container}>
                    <View >
                    <TextInput
                            label="Documento"
                            style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                            onChangeText={(documento) => this.setState({ documento })}
                            selectionColor="#008FAD"
                            underlineColor="#008FAD"
                            theme={{
                                colors: {
                                    primary: '#008FAD',
                                    underlineColor: 'transparent'
                                }

                            }}
                            value={this.state.documento}
                        />
                      
                    </View>
                    <View >
                    <TextInput
                            label="Nombre"
                            style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                            onChangeText={(fullName) => this.setState({ fullName })}
                            selectionColor="#008FAD"
                            underlineColor="#008FAD"
                            theme={{
                                colors: {
                                    primary: '#008FAD',
                                    underlineColor: 'transparent'
                                }

                            }}
                            value={this.state.fullName}
                        />
                    </View>
                    <View >
                    <TextInput
                            label="Correo"
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
                    <View >
                    <TextInput
                            label="Contraseña"
                            style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                            onChangeText={(password) => this.setState({ password })}
                            selectionColor="#008FAD"
                            underlineColor="#008FAD"
                            theme={{
                                colors: {
                                    primary: '#008FAD',
                                    underlineColor: 'transparent'
                                }

                            }}
                            value={this.state.password}
                        />
                    </View>
                    <View>
                        <RadioForm
                            radio_props={radio_props}
                            initial={0}
                            onPress={(value) => { this.setState({ tipo: value }) }}
                        />
                    </View>
                    <Button style={{ width: 220, marginBottom: 30 }} color="#008FAD" mode="contained" onPress={this.saveData}>
                        Registrarse
  </Button>
                </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',   
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