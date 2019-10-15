import React from 'react';
import {
    StyleSheet,
    View,
    ImageBackground
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import RadioForm from 'react-native-simple-radio-button';
import Toast from 'react-native-simple-toast';
const { server } = require('../config/keys');

export default class Signup extends React.Component {

    static navigationOptions = {
        title: 'Crea una cuenta',
        headerStyle: {
            backgroundColor: '#00748D',
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
            cargando: false
        };
        console.log('tipo', this.state.tipo)
    }


    saveData = async () => { /////////////////////////envio de datos a la api
        //Keyboard.dismiss();
        this.setState({ cargando: true });
        const { email, password, fullName, tipo, documento } = this.state;
        if (email == "" || password == "" || fullName == "") {
            Toast.show('Ingresa datos validos.');
            this.setState({ cargando: false });
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
                    //  Toast.show('Bienvenido', Toast.SHORT);
                    AsyncStorage.setItem('usuario', JSON.stringify(datos));
                    this.props.navigation.navigate('Signup2', {
                        datos: JSON.stringify(datos)
                    });
                } else {
                    alert(retorno.mensaje);
                }
                this.setState({ cargando: false });
            })
            .catch(function (err) {
                Toast.show("Compruebe su conexión", Toast.LONG);
            })

    }


    render() {
        var radio_props = [
            { label: 'Empresa', value: 0 },
            { label: 'Colaborador', value: 1 }
        ];
        return (
            <ImageBackground
            resizeMode='cover'
            source={require('../imagenes/main.png')}
            style={{
              width: '100%',
              height: '100%',
              flex: 1
            }}>
            <View style={styles.container}>
                <View >
                    <TextInput
                        label="Documento"
                        style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                        onChangeText={(documento) => this.setState({ documento })}
                        selectionColor="#00748D"
                        underlineColor="#00748D"
                        theme={{
                            colors: {
                                primary: '#00748D',
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
                        selectionColor="#00748D"
                        underlineColor="#00748D"
                        theme={{
                            colors: {
                                primary: '#00748D',
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
                        selectionColor="#00748D"
                        underlineColor="#00748D"
                        theme={{
                            colors: {
                                primary: '#00748D',
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
                        selectionColor="#00748D"
                        underlineColor="#00748D"
                        theme={{
                            colors: {
                                primary: '#00748D',
                                underlineColor: 'transparent'
                            }

                        }}
                        value={this.state.password}
                        secureTextEntry={true}
                    />
                </View>
                <View>
                    <RadioForm
                        buttonColor={'#00748D'}
                        radio_props={radio_props}
                        initial={0}
                        onPress={(value) => { this.setState({ tipo: value }) }}
                    />
                </View>
                {this.state.cargando ? <Button loading={true} disabled={true} style={{ width: 220, marginTop:20 }} color="#00748D" mode="contained" onPress={this.saveData}>
  </Button> :
                    <Button style={{ width: 220, marginTop:20 }} color="#00748D" mode="contained" onPress={this.saveData}>
                        Siguiente
  </Button>}
                </View>
                </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        top: 60,
        alignSelf: 'center',
        alignContent: "center",
        alignItems:"center",
        position: 'absolute'
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