import React, { Component } from 'react';
import { View, Button, Keyboard,Alert, ToastAndroid, TouchableOpacity, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
import { RNCamera } from 'react-native-camera';
import PinView from 'react-native-pin-view'
import { Icon } from 'react-native-elements';
import moment from "moment";
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
var idempleado;
import NetInfo from "@react-native-community/netinfo";
import BackgroundTimer from 'react-native-background-timer';




const PendingView = () => (
    <View
        style={{
            flex: 1,
            backgroundColor: 'lightgreen',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Text>Cargando</Text>
    </View>
);
export default class modoTablet extends Component {

    componentDidMount() {
        myTimer = BackgroundTimer.setInterval(() => {
            NetInfo.isConnected.fetch().done((isConnected) => {
                if (isConnected == true) {
                    this.setState({ connection_Status: "Online" });
                    console.log("online");
                }
                else {
                    this.setState({ connection_Status: "Offline" });
                    console.log("offline");
                }
            })
        }, 5000);
    }
    componentWillUnmount() {
        BackgroundTimer.clearInterval(myTimer);
    }
    static navigationOptions = ({ navigation }) => {
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

    perfil = async () => {
        var user = await AsyncStorage.getItem('usuario');
        console.log('usuario', user);
    }


    constructor(props) {
        super(props);
        this.state = {
            foto: '',
            codigo: '',
            inicio: '',
            empleado_id: '',
            empresa_id: '',
            cameraType: 'front',
            mirrorMode: false
        }
        this.perfil();
    }

    promesa() {
        var codigo = this.state.codigo;
        var empresa_id = this.state.empresa_id;
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                db.transaction(function (tx) {
                    tx.executeSql('SELECT * FROM usuario', [], (tx, results) => {
                        for (var i = 0; i < results.rows.length; i++) {
                            if (results.rows.item(i).pin == codigo) {
                                idempleado = results.rows.item(i).id;
                                tx.executeSql('SELECT * FROM asistencia WHERE empleado_id = ? AND empresa_id = ? AND tipo = 0', [results.rows.item(i).id, empresa_id], (tx, results) => {
                                    if (results.rows.length > 0) {
                                        resolve(1);
                                    }
                                    else {
                                        resolve(2);
                                    }
                                });
                            }
                            else {
                                resolve(3);
                            }
                        }
                    });
                });
            }, 1000);
        });
    }
    confirmar_usuario = async () => {
        Keyboard.dismiss();
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        this.setState({ empresa_id: sesion.id });
        this.promesa().then((data) => {
            if (data == 1) {
                ToastAndroid.show('Buen viaje, seleccione aceptar', ToastAndroid.LONG);
            }
            else if (data == 2) {
                ToastAndroid.show('Bienvenido, seleccione aceptar', ToastAndroid.LONG);
            }
            else if (data == 3) {
                ToastAndroid.show('Pin incorrecto', ToastAndroid.LONG);
            }
        });
    }

    /*
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
                    var fin = moment(new Date()).format();
                    this.setState({ fin: fin });
                }
            } else {
                ToastAndroid.show(retorno.mensaje, ToastAndroid.LONG);
            }
        })
        .catch(function (err) {
            console.log('error', err);
        })
*/




    Alta_asistencia = async (camera,estado) => {
        console.log(camera);
        Keyboard.dismiss();
        const options = { quality: 0.5, base64: true, captureAudio: false };
        const data = await camera.takePictureAsync(options);
        this.setState({ foto: data.base64 });
        var fecha = moment(new Date()).format();
        this.setState({ fecha: fecha });
        const { foto } = this.state;
        var empresa_id = this.state.empresa_id;
        console.log(idempleado);
        if (this.state.connection_Status == "Offline") {
            db.transaction(function (tx) {                    
                        db.transaction(function (txx) {
                            txx.executeSql('INSERT INTO asistencia (empleado_id,foto,fecha,empresa_id,tipo,estado) VALUES (?, ?,?,?,?,?)', [idempleado, foto, fecha, empresa_id,estado,0], (tx, results) => {
                                console.log(results.rowsAffected);
                                if (results.rowsAffected > 0) {
                                    console.log("insertó");
                                    ToastAndroid.show('La asistencia se insertó correctamente', ToastAndroid.LONG);
                                    db.transaction(function (txr) {
                                        txr.executeSql('SELECT * FROM asistencia', [], (tx, results) => {
                                            console.log(results.rows.length);
                                            for (var i = 0; i < results.rows.length; i++) {
                                                console.log("Empleado: : ", results.rows.item(i).empleado_id);
                                                console.log("Empresa: : ", results.rows.item(i).empresa_id);
                                                console.log("Inicio : ", results.rows.item(i).inicio);
                                            }
                                        });
                                    });
                                } else {
                                    console.log("error");
                                }
                            }
                            );
                        });

            });
        }
        else {
            const { foto } = this.state;
            let asistencia_send = {
                fecha: fecha,
                foto: foto,
                empleado_id: idempleado,
                estado: estado,
                empresa_id: empresa_id
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
                .then(async data => {
                    const retorno = data;
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
    }
    render() {
        return (
            <>
                <View style={styles.pin}>
                    <PinView

                        onComplete={(val, clear) => { this.setState({ codigo: val }), clear(), this.confirmar_usuario() }}
                        pinLength={4}
                        inputBgColor="#0083D0"
                        inputBgOpacity={0.6}

                    />
                </View>
                <View >
                    <RNCamera
                        style={styles.camara}
                        type={RNCamera.Constants.Type.front}
                        captureAudio={false}
                    >
                        {({ camera, status }) => {
                            if (status !== 'READY') return <PendingView />;
                            return (
                                <View style={{ position: 'relative', top: 300 }}>
                                    <TouchableOpacity onPress={() => Alert.alert(
                                        "Opciones",
                                        "¿Usted esta ingresando o saliendo del establecimiento?",
                                        [
                                            { text: "Entrando", onPress: () => this.Alta_asistencia(camera,1)},
                                            {
                                                text: "Saliendo",
                                                onPress: () => this.Alta_asistencia(camera,0),
                                            },
                                        ],
                                        { cancelable: true }
                                    )
                                    } style={styles.capture}>
                                        <Text style={{ fontSize: 14, color: 'white' }}> Aceptar </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        }}
                    </RNCamera>
                </View>
            </>
        )
    }
}




const styles = StyleSheet.create({
    pin: {
        position: 'absolute', top: 0, left: 100, bottom: 0, justifyContent: 'center'
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    camara: {
        width: 400,
        height: 300,
        position: 'absolute', top: 180, right: 100, bottom: 0
    },
    capture: {
        flex: 0,
        backgroundColor: '#1E8AF1',
        borderRadius: 5,
        padding: 15,
        alignSelf: 'center',
        paddingHorizontal: 20,
        margin: 20,
    },
});