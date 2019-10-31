import React, { Component } from 'react';
import { View, Keyboard, Alert, TouchableOpacity, Image, TouchableHighlight, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { RNCamera } from 'react-native-camera';
import moment from "moment";
const { server } = require('../config/keys');
import NetInfo from "@react-native-community/netinfo";
import { Button } from 'react-native-paper';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
import Toast from 'react-native-simple-toast';
import styles from "../css/styleasistencia_app";


const PendingView = () => (
    <View
        style={styles.view_cargando}
    >
        <Text>Cargando</Text>
    </View>
);
export default class asistencia_app extends Component {
    comprobar_ultima_asistencia_offline = async () => {
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        let session_2 = await AsyncStorage.getItem('empresa');
        let empresa = JSON.parse(session_2);
        var empresa_id = empresa[0];
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                db.transaction(function (tx) {
                    console.log("entra", sesion.id);
                    console.log("entra", empresa_id);
                    tx.executeSql('SELECT * FROM asistencia WHERE id=(SELECT MAX(id) from asistencia) AND empleado_id = ? AND empresa_id = ? AND tipo = 1', [sesion.id, empresa_id], (tx, results) => {
                        if (results.rows.length > 0) {
                            resolve(1);
                        }
                        else {
                            resolve(2);
                        }
                    });
                });
            }, 1000);
        });

    }


    comprobar_conexion = async () => {
        NetInfo.isConnected.fetch().done(async (isConnected) => {
            if (isConnected == true) {
                this.setState({ connection_Status: "Online" });
                let session = await AsyncStorage.getItem('usuario');
                let sesion = JSON.parse(session);
                let session_2 = await AsyncStorage.getItem('empresa');
                let empresa = JSON.parse(session_2);
                let loginDetails = {
                    id_usuario: sesion.id,
                    id_empresa: empresa[0]
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
                        console.log(retorno);
                        if (retorno.retorno == true) {
                            this.setState({ empleado_id: retorno.id });
                            if (retorno.estado_ree == 1) {
                                this.setState({ mensaje_alert: retorno.mensaje });
                            }
                            else {
                                this.setState({ mensaje_alert: retorno.mensaje });
                            }
                        } else {
                            Toast.show(retorno.mensaje);
                        }
                    })
                    .catch(function (err) {
                        console.log('error', err);
                    })

                console.log("online");
            }
            else {
                this.setState({ connection_Status: "Offline" });
                this.comprobar_ultima_asistencia_offline().then((data) => {
                    console.log("data", data);
                    if (data == 1) {
                        this.setState({ mensaje_alert: "Su ultima asistencia fue una entrada,¿Usted esta ingresando o saliendo de la empresa?" });
                    }
                    else if (data == 2) {
                        this.setState({ mensaje_alert: "¿Usted esta ingresando o saliendo de la empresa?" });
                    }
                });

            }
        })
    }

    componentDidMount = async () => {
        this.comprobar_conexion();
        const value = await AsyncStorage.getItem('configuraciones');
        if (value !== null) {
            this.setState({ 'camara': JSON.parse(value).camara.data[0] });
        }
    }
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            foto: '',
            codigo: '',
            inicio: '',
            empleado_id: '',
            empresa_id: '',
            cameraType: 'front',
            mirrorMode: false,
            camara: '',
            cargnado: false
        }
    }


    Alta_asistencia = async (camera, tipo) => {
        this.setState({ cargando: true });
        console.log("el tipo: ", tipo);
        Keyboard.dismiss();
        this.comprobar_conexion();
        const options = { quality: 0.5, base64: true, captureAudio: false };
        if (camera != null) {
            const data = await camera.takePictureAsync(options);
            this.setState({ foto: data.base64 });
        }
        else {
            this.setState({ foto: null });
        }
        var fecha = moment(new Date()).format();
        this.setState({ fecha: fecha });
        const { foto } = this.state;
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        let session_2 = await AsyncStorage.getItem('empresa');
        let empresa = JSON.parse(session_2);
        console.log(empresa[0]);
        let tarea_send = {
            id: sesion.id,
            id_empresa: empresa[0]
        }
        if (this.state.connection_Status == "Offline") {
            console.log(tarea_send.id);
            console.log(foto);
            console.log(fecha);
            console.log(tarea_send.id_empresa);
            db.transaction(function (tx) {
                db.transaction(function (txx) {
                    txx.executeSql('INSERT INTO asistencia (empleado_id,foto,fecha,empresa_id,tipo,estado) VALUES (?, ?,?,?,?,?)', [tarea_send.id, foto, fecha, tarea_send.id_empresa, tipo, 0], (tx, results) => {
                        console.log(results.rowsAffected);
                        if (results.rowsAffected > 0) {
                            console.log("insertó");
                            Toast.show("la asistencia se ingresó correctamente");
                            this.setState({ cargnado: false });
                        } else {
                            console.log("error");
                        }
                    }
                    );
                });

            });
            this.props.navigation.navigate('lista_asistencias');
        }
        else {
            const { foto } = this.state;
            let asistencia_send = {
                fecha: fecha,
                foto: foto,
                empleado_id: tarea_send.id,
                estado: tipo,
                empresa_id: tarea_send.id_empresa
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
                        Toast.show("La asistencia se ingresó correctamente");
                        this.setState({ cargnado: false });
                        this.props.navigation.navigate('lista_asistencias');
                    } else {
                        this.setState({ cargnado: false });
                        Toast.show(retorno.mensaje);
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
                <View style={styles.main}>
                    {this.state.camara == 1 ? <RNCamera
                        style={styles.camara}
                        type={RNCamera.Constants.Type.front}
                        captureAudio={false}
                    >
                        {({ camera, status }) => {
                            if (status !== 'READY') return <PendingView />;
                            return (
                                <View style={styles.view_boton}>

                                    {this.state.cargando ? <Button disabled={true} style={styles.boton} color="#00748D" loading={true} mode="contained"></Button> :
                                        <TouchableHighlight onPress={() => Alert.alert(
                                            "Opciones",
                                            this.state.mensaje_alert,
                                            [
                                                { text: "Entrando", onPress: () => this.Alta_asistencia(camera, 1) },
                                                {
                                                    text: "Saliendo",
                                                    onPress: () => this.Alta_asistencia(camera, 0),
                                                },
                                            ],
                                            { cancelable: true }
                                        )} ><Button style={styles.boton} color="#00748D" mode="contained" onPress={() => Alert.alert(
                                            "Opciones",
                                            this.state.mensaje_alert,
                                            [
                                                { text: "Entrando", onPress: () => this.Alta_asistencia(camera, 1) },
                                                {
                                                    text: "Saliendo",
                                                    onPress: () => this.Alta_asistencia(camera, 0),
                                                },
                                            ],
                                            { cancelable: true }
                                        )}>
                                                <Text style={styles.boton_capturar}> Capturar y aceptar </Text>
                                            </Button>
                                        </TouchableHighlight>
                                    }
                                </View>
                            );

                        }}
                    </RNCamera> :

                        <View
                            style={styles.view_camara}>
                            <Image
                                source={require('../imagenes/camara.png')}
                                style={styles.imagen_camaraimagen}
                            />
                            <Text style={styles.texto_camaraimagen}>
                                Usted no tiene permisos para usar la cámara en el teléfono
              </Text>
                            <TouchableOpacity onPress={() => Alert.alert(
                                "Opciones",
                                this.state.mensaje_alert,
                                [
                                    { text: "Entrando", onPress: () => this.Alta_asistencia(null, 1) },
                                    {
                                        text: "Saliendo",
                                        onPress: () => this.Alta_asistencia(null, 0),
                                    },
                                ],
                                { cancelable: true }
                            )
                            } style={styles.capture}>
                                <Text style={StyleSheet.boton_capturar}> Capturar y aceptar </Text>
                            </TouchableOpacity>

                        </View>
                    }


                </View>
            </>
        )
    }
}