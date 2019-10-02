import React from 'react';
import { StyleSheet, Text, TouchableHighlight, View, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import DateTimePicker from "react-native-modal-datetime-picker";
const { server } = require('../config/keys');
import { TextInput, Button } from 'react-native-paper';


export default class Signup2 extends React.Component {
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
            image: null,
            documento: null,
            nombre: null,
            apellido: null,
            celular: null,
            nacimiento: null,
        };
    }

    /* selectPicture = async () => {
         await Permissions.askAsync(Permissions.CAMERA_ROLL);
         const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
             aspect: 1,
             allowsEditing: true,
         });
         if (!cancelled) this.setState({ image: uri });
     };
 
     takePicture = async () => {
         await Permissions.askAsync(Permissions.CAMERA);
         const { cancelled, uri } = await ImagePicker.launchCameraAsync({
             allowsEditing: false,
         });
         this.setState({ image: uri });
     };*/

    showDateTimePicker_inicio = () => {
        this.setState({ isDateTimePickerVisible_inicio: true });
    };

    hideDateTimePicker_inicio = () => {
        this.setState({ isDateTimePickerVisible_inicio: false });
    };

    handleDatePicked_inicio = pickeddate => {
        this.setState({ nacimiento: pickeddate })
        // const value = await AsyncStorage.getItem('usuario')
        this.hideDateTimePicker_inicio();
    };

    enviarDatosEmpleado = async () => {

        const { navigation } = this.props;
        const datos = JSON.parse(navigation.getParam('datos'));

        const { nombre, apellido, celular, nacimiento, image } = this.state;

        let usuario = await AsyncStorage.getItem('usuario');
        let ld = JSON.parse(usuario);

        if (nombre == "" || celular == "" || apellido == "" || nacimiento == null) {
            ToastAndroid.show('Ingresa datos validos.', ToastAndroid.SHORT);
            return;
        }

        var formData = new FormData();
        formData.append('email', datos.email);
        formData.append('password', datos.password);
        formData.append('fullName', datos.fullName);
        formData.append('tipo', datos.tipo);
        formData.append('documento', datos.documento);
        formData.append('nombre', nombre);
        formData.append('celular', celular);
        formData.append('apellido', apellido);
        formData.append('nacimiento', nacimiento);
        formData.append('image', image);

        let datosFinales = {
            email: datos.email,
            password: datos.password,
            fullName: datos.fullName,
            tipo: datos.tipo,
            documento: datos.documento,
            nombre: nombre,
            apellido,
            celular,
            nacimiento,
            image
        }
        console.log('finales', datosFinales);


        await fetch(server.api + 'signup2', {
            method: 'POST',
            headers: {
                'Aceptar': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosFinales)
        })
            .then(res => {
                return res.json()
            })
            .then(data => {
                const retorno = data;
                console.log('retorno', retorno);
                if (retorno.retorno == true) {

                    var nuevaSession = {
                        id: datosFinales.documento,
                        tipo: datosFinales.email
                    }

                    AsyncStorage.setItem('usuario', JSON.stringify(nuevaSession));
                    this.props.navigation.navigate('Inicio');
                } else {
                    alert(retorno.mensaje);
                }
            })
            .catch(function (err) {
                console.log('error', err);
            })
    }



    enviarDatosEmpresa = async () => {

        const { navigation } = this.props;
        const datos = JSON.parse(navigation.getParam('datos'));

        const { nombre } = this.state;

        let usuario = await AsyncStorage.getItem('usuario');
        let ld = JSON.parse(usuario);

        if (nombre == "") {
            ToastAndroid.show('Ingresa datos validos.', ToastAndroid.SHORT);
            return;
        }

        var formData = new FormData();
        formData.append('email', datos.email);
        formData.append('password', datos.password);
        formData.append('fullName', datos.fullName);
        formData.append('tipo', datos.tipo);
        formData.append('nombre', nombre);


        let datosFinales = {
            email: datos.email,
            password: datos.password,
            fullName: datos.fullName,
            tipo: datos.tipo,
            nombre: nombre,
            documento: datos.documento

        }

        console.log('datosFinales', datosFinales);

        await fetch(server.api + 'signup2Empresa', {
            method: 'POST',
            headers: {
                'Aceptar': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosFinales)
        })
            .then(res => {
                return res.json()
            })
            .then(data => {
                const retorno = data;
                console.log('retorno', retorno);
                if (retorno.retorno == true) {

                    var nuevaSession = {
                        id: datosFinales.documento,
                        tipo: datosFinales.tipo
                    }
                    if (datosFinales.tipo == 1) {
                        AsyncStorage.setItem('usuario', JSON.stringify(nuevaSession));
                        this.props.navigation.navigate('lista_empresas');
                    } else {
                        alert(
                            "Usuario registrado correctamente",
                        )
                        this.props.navigation.navigate('login');
                    }
                } else {
                    alert(
                        retorno.mensaje,
                    )
                }
            })
            .catch(function (err) {
                ToastAndroid.show("Compruebe su conexión", ToastAndroid.LONG);
            })
    }


    render() {
        const { navigation } = this.props;
        const datos = JSON.parse(navigation.getParam('datos'));
        if (datos.tipo == 1) {
            return (

                <KeyboardAvoidingView style={{ flex: 1 }}
                    behavior="padding">
                    <View style={styles.container}>
                        <Text style={{fontSize: 30}}>Bienvenido</Text>

                        <View style={styles.inputContainer}>
                          
                               <TextInput
                                label="Nombre"
                                style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                                onChangeText={(nombre) => this.setState({ nombre })}
                                selectionColor="#008FAD"
                                underlineColor="#008FAD"
                                theme={{
                                    colors: {
                                        primary: '#008FAD',
                                        underlineColor: 'transparent'
                                    }

                                }}
                                value={this.state.nombre}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Apellido"
                                style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                                onChangeText={(apellido) => this.setState({ apellido })}
                                selectionColor="#008FAD"
                                underlineColor="#008FAD"
                                theme={{
                                    colors: {
                                        primary: '#008FAD',
                                        underlineColor: 'transparent'
                                    }

                                }}
                                value={this.state.apellido}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                                  <TextInput
                                label="Celular"
                                style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                                onChangeText={(celular) => this.setState({ celular })} 
                                selectionColor="#008FAD"
                                underlineColor="#008FAD"
                                theme={{
                                    colors: {
                                        primary: '#008FAD',
                                        underlineColor: 'transparent'
                                    }

                                }}
                                value={this.state.celular}
                            />
                        </View>
                        <Button style={{ width: 220, marginBottom: 20 }} color="#008FAD" mode="outlined" title="Fecha de nacimiento" onPress={this.showDateTimePicker_inicio}>Fecha de nacimiento</Button>

                        <DateTimePicker
                            isVisible={this.state.isDateTimePickerVisible_inicio}
                            onConfirm={this.handleDatePicked_inicio}
                            onCancel={this.hideDateTimePicker_inicio}
                            mode={'date'}
                        />
                        <Button style={{ width: 220 }} color="#008FAD" mode="contained" onPress={this.enviarDatosEmpleado}>
                            Registrarse
  </Button>
                    </View>
                </KeyboardAvoidingView>
            );
        } else {
            return (

                <KeyboardAvoidingView style={{ flex: 1 }}
                    behavior="padding">
                    <View style={styles.container}>
                        <View>
                            <TextInput
                                label="Nombre"
                                style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                                onChangeText={(nombre) => this.setState({ nombre })}
                                selectionColor="#008FAD"
                                underlineColor="#008FAD"
                                theme={{
                                    colors: {
                                        primary: '#008FAD',
                                        underlineColor: 'transparent'
                                    }

                                }}
                                value={this.state.nombre}
                            />
                        </View>
                        <Button style={{ width: 220, marginBottom: 30 }} color="#008FAD" mode="contained" onPress={this.enviarDatosEmpresa}>
                            Registrarse
  </Button>
                    </View>
                </KeyboardAvoidingView>
            );

        }
    }
}



const styles = StyleSheet.create({
    text: {
        fontSize: 21,
    },
    row: { flexDirection: 'row' },
    image: { width: 80, height: 80 },
    button: {
        padding: 13,
        margin: 15,
        backgroundColor: '#dddddd',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffff',
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

