import React, { Component } from 'react';
import { View, Button, Keyboard, ToastAndroid, AsyncStorage, TouchableOpacity, StyleSheet, Text } from 'react-native';
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
        <Text>Waiting</Text>
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
    componentWillUnmount(){
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
            fin: null,
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
                                tx.executeSql('SELECT * FROM asistencia WHERE empleado_id = ? AND empresa_id = ? AND fin IS NULL', [results.rows.item(i).id, empresa_id], (tx, results) => {
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
                var fin = moment(new Date()).format();
                this.setState({ fin: fin });
            }
            else if (data == 2) {
                ToastAndroid.show('Bienvenido, seleccione aceptar', ToastAndroid.LONG);
                this.setState({ fin: null });
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




    Alta_asistencia = async (camera) => {
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
                tx.executeSql('SELECT * FROM asistencia WHERE empleado_id = ? AND fin IS NULL', [idempleado], (tx, results) => {
                    console.log(results.rows.length);
                    if (results.rows.length > 0) {
                        db.transaction(function (txt) {
                            txt.executeSql('UPDATE asistencia SET fin = ? WHERE empleado_id = ? AND empresa_id = ?', [fecha, idempleado, empresa_id], (tx, results) => {
                                if (results.rowsAffected > 0) {
                                    console.log("Actualizó");
                                    ToastAndroid.show('La asistencia se actualizó correctamente', ToastAndroid.LONG);
                                    db.transaction(function (txr) {
                                        txr.executeSql('SELECT * FROM asistencia', [], (tx, results) => {
                                            console.log(results.rows.length);
                                            for (var i = 0; i < results.rows.length; i++) {
                                                console.log("Empleado: : ", results.rows.item(i).empleado_id);
                                                console.log("Empresa: : ", results.rows.item(i).empresa_id);
                                                console.log("Inicio : ", results.rows.item(i).inicio);
                                                console.log("Fin : ", results.rows.item(i).fin);
                                            }
                                        });
                                    });
                                } else {
                                    console.log("error");
                                }
                            }

                            );
                        });
                    }
                    else {
                        db.transaction(function (txx) {
                            txx.executeSql('INSERT INTO asistencia (fin, empleado_id,foto,inicio,empresa_id) VALUES (?, ?,?,?,?)', [null, idempleado, foto, fecha, empresa_id], (tx, results) => {
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
                                                console.log("Fin : ", results.rows.item(i).fin);
                                            }
                                        });
                                    });
                                } else {
                                    console.log("error");
                                }
                            }
                            );
                        });
                    }
                });

            });
        }
        else {
            const { foto} = this.state;
            let asistencia_send = {
                fecha: fecha,
                foto: foto,
                empleado_id: idempleado
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
                                    <TouchableOpacity onPress={() => this.Alta_asistencia(camera)} style={styles.capture}>
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