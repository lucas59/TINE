import React from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableHighlight } from 'react-native';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';
import DatePicker from 'react-native-date-picker';
const { server } = require('../config/keys');
import { TextInput, Button } from 'react-native-paper';


export default class Signup2 extends React.Component {
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
            image: null,
            documento: null,
            nombre: null,
            apellido: null,
            celular: null,
            nacimiento: new Date(),
            cargando: false
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
        this.setState({ isDateTimePickerVisible_inicio: !this.state.isDateTimePickerVisible_inicio });
    };

    hideDateTimePicker_inicio = () => {
        this.setState({ isDateTimePickerVisible_inicio: false });
    };

    handleDatePicked_inicio = pickeddate => {
        this.setState({ nacimiento: pickeddate })
        // const value = await AsyncStorage.getItem('usuario')
        this.hideDateTimePicker_inicio();
        console.log(pickeddate);
    };

    enviarDatosEmpleado = async () => {
        this.setState({ cargando: true });
        const { navigation } = this.props;
        const datos = JSON.parse(navigation.getParam('datos'));

        const { nombre, apellido, celular, nacimiento, image } = this.state;

        let usuario = await AsyncStorage.getItem('usuario');
        let ld = JSON.parse(usuario);

        if (nombre == "" || celular == "" || apellido == "" || nacimiento == null) {
            Toast.show('Ingresa datos validos.', Toast.SHORT);
            this.setState({ cargando: false });
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
                        tipo: datosFinales.tipo
                    }
                    AsyncStorage.setItem('usuario', JSON.stringify(nuevaSession));
                    this.setState({ cargando: true });
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
        this.setState({ cargando: true });
        const { navigation } = this.props;
        const datos = JSON.parse(navigation.getParam('datos'));

        const { nombre } = this.state;

        let usuario = await AsyncStorage.getItem('usuario');
        let ld = JSON.parse(usuario);

        if (nombre == "") {
            Toast.show('Ingresa datos validos.', Toast.SHORT);
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
            .then(async data  => {
                const retorno = data;
                console.log('retorno', retorno);
                if (retorno.retorno == true) {
                    var nuevaSession = {
                        id: datosFinales.documento,
                        tipo: datosFinales.tipo
                    }
                    await AsyncStorage.setItem('usuario', JSON.stringify(nuevaSession));
                    this.props.navigation.navigate('Inicio');
                } else {
                    alert(
                        retorno.mensaje,
                    )
                }
                this.setState({ cargando: false });
            })
            .catch(function (err) {
                Toast.show("Compruebe su conexión", Toast.LONG);
            })
    }


    render() {
        const { navigation } = this.props;
        const datos = JSON.parse(navigation.getParam('datos'));
        if (datos.tipo == 1) {
            return (
                <><ImageBackground
                    resizeMode='cover'
                    source={require('../imagenes/main.png')}
                    style={{
                        width: '100%',
                        height: '100%',
                        flex: 1
                    }}>
                    <View style={styles.container}>
                        <Text style={{ fontSize: 30 }}>Bienvenido</Text>

                        <View style={styles.inputContainer}>

                            <TextInput
                                label="Nombre"
                                style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                                onChangeText={(nombre) => this.setState({ nombre })}
                                selectionColor="#00748D"
                                underlineColor="#00748D"
                                theme={{
                                    colors: {
                                        primary: '#00748D',
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
                                selectionColor="#00748D"
                                underlineColor="#00748D"
                                theme={{
                                    colors: {
                                        primary: '#00748D',
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
                                selectionColor="#00748D"
                                underlineColor="#00748D"
                                theme={{
                                    colors: {
                                        primary: '#00748D',
                                        underlineColor: 'transparent'
                                    }

                                }}
                                value={this.state.celular}
                            />
                        </View>
                        <TouchableHighlight onPress={this.showDateTimePicker_inicio}>
                            <Button style={{ borderRadius: 30,width: 220, marginBottom: 20 }} color="#00748D" mode="outlined" title="Fecha de nacimiento" onPress={this.showDateTimePicker_inicio}>Fecha de nacimiento</Button>
                        </TouchableHighlight>
                       
                        {this.state.isDateTimePickerVisible_inicio && <DatePicker
                            date={this.state.nacimiento}
                            onDateChange={(date) => this.handleDatePicked_inicio(date)}
                            mode={'date'}
                            locale='es-UY'
                        />}
                        {this.state.cargando ? <Button disabled={true} style={{ width: 220, height: 30 }} color="#00748D" loading={true} mode="contained" ></Button> :
                            <TouchableHighlight onPress={this.enviarDatosEmpleado}>
                                <Button style={{ borderRadius: 30,width: 220, marginBottom: 30 }} color="#00748D" mode="contained" onPress={this.enviarDatosEmpleado}>
                                    Registrarse
                    </Button>
                            </TouchableHighlight>
                        }
                    </View>
                </ImageBackground>
                </>
            );
        } else {
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
                        <View>
                            <Text style={{ textAlign: "center", fontSize: 30 }}>Bienvenido</Text>
                            <TextInput
                                label="Nombre"
                                style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                                onChangeText={(nombre) => this.setState({ nombre })}
                                selectionColor="#00748D"
                                underlineColor="#00748D"
                                theme={{
                                    colors: {
                                        primary: '#00748D',
                                        underlineColor: 'transparent'
                                    }

                                }}
                                value={this.state.nombre}
                            />
                        </View>
                        {this.state.cargando ? <Button disabled={true} style={{ borderRadius: 30,width: 220, height: 30 }} color="#00748D" loading={true} mode="contained" ></Button> :
                            <TouchableHighlight onPress={this.enviarDatosEmpresa}>
                                <Button style={{ borderRadius: 30,width: 220, marginBottom: 30 }} color="#00748D" mode="contained" onPress={this.enviarDatosEmpresa}>
                                    Registrarse
                    </Button>
                            </TouchableHighlight>
                        }
                    </View>
                </ImageBackground>
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
        top: 110,
        alignSelf: 'center',
        alignContent: "center",
        alignItems: "center",
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

