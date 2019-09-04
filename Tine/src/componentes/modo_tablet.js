import React, { Component } from 'react';
import { View, Button, Keyboard, ToastAndroid, AsyncStorage, TouchableOpacity, StyleSheet, Text } from 'react-native';
const { server } = require('../config/keys');
import { RNCamera } from 'react-native-camera';
import PinView from 'react-native-pin-view'
import { Icon } from 'react-native-elements';
import moment from "moment";
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
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
            cameraType: 'front',
            mirrorMode: false
        }
        this.perfil();
    }


    confirmar_usuario = async () => {
        Keyboard.dismiss();
        const { codigo } = this.state;
        console.log("prueba");
        db.transaction(function (tx) {
            tx.executeSql('INSERT INTO usuario (pin) VALUES (?)',[2712],(tx, results) => {
                console.log('Results', results.rowsAffected);
                if (results.rowsAffected > 0) {
                    console.log("insertó");
                } else {
                    console.log("error");
                }
            });
        });
        db.transaction(function (tx) {
            
            tx.executeSql('SELECT * FROM usuario', [], (tx, results) => {
                console.log(results.rows.length);
                for (var i = 0; i < results.rows.length; i++) {
                    console.log(results.rows.item(i).pin);
                    console.log(codigo);
                    if (results.rows.item(i).pin == codigo) {
                        tx.executeSql('SELECT * FROM asistencia WHERE empleado_id = ? AND fin IS NULL', [results.rows.item(i).id], (tx, results) => {
                            if (results.rows.length > 0) {
                            
                                ToastAndroid.show('Buen viaje, seleccione aceptar', ToastAndroid.LONG);
                                var fin = moment(new Date()).format();
                                this.setState({ fin: fin });
                            }
                            else {
                               
                                ToastAndroid.show('Bienvenido, seleccione aceptar', ToastAndroid.LONG);
                                this.setState({ fin: null });
                            }
                        });
                }

                }
            });
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
        console.log(data.base64);
        this.setState({ foto: data.base64 });
        var inicio_fecha = moment(new Date()).format();
        this.setState({ inicio: inicio_fecha });
        const { inicio, fin, foto, empleado_id } = this.state;
        console.log(foto);
        tx.executeSql('SELECT * FROM asistencia WHERE empleado_id = ? AND fin IS NULL', [empleado_id], (tx, results) => {
            if (results.rows.length > 0) {
                tx.executeSql('UPDATE asistencia SET fin = ? WHERE empleado_id = ?', [], (tx, results) => {
                    if (results.rowsAffected > 0) {
                        console.log("Actualizó");
                    } else {
                        console.log("error");
                    }
                }
                );
            }
            else {
                tx.executeSql('INSERT INTO asistencia (fin) VALUES (?)',[],(tx, results) => {
                        console.log('Results', results.rowsAffected);
                        if (results.rowsAffected > 0) {
                            console.log("insertó");
                        } else {
                            console.log("error");
                        }
                    }
                );
            }
        });
        /*
        tx.executeSql(
          'INSERT INTO usuario (documento) VALUES (?)',
          [1234],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
               
              console.log("insertó");
            } else {
                console.log("error");
            }
          }
        );
        */


        let asistencia_send = {
            inicio: inicio,
            fin: fin,
            foto: foto,
            empleado_id: empleado_id
        }
    }
    /*
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
*/




    render() {
        return (
            <View style={styles.camara}>
                <PinView
                    onComplete={(val, clear) => { this.setState({ codigo: val }), clear(), this.confirmar_usuario() }}
                    pinLength={4}
                    inputBgColor="#0083D0"
                    inputBgOpacity={0.6}

                />

                <RNCamera
                    style={styles.preview}
                    type={RNCamera.Constants.Type.front}
                >
                    {({ camera, status }) => {
                        if (status !== 'READY') return <PendingView />;
                        return (
                            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => this.Alta_asistencia(camera)} style={styles.capture}>
                                    <Text style={{ fontSize: 14 }}> Aceptar </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                </RNCamera>
            </View>
        )
    }
}




const styles = StyleSheet.create({
    camara: {
        position: 'absolute', top: 0, left: 30, bottom: 0, justifyContent: 'center'
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        width: 400,
        height: 400,

    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
});