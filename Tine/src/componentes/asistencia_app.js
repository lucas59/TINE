import React, { Component } from 'react';
import { View, Button, Keyboard,Alert, ToastAndroid,  TouchableOpacity, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { RNCamera } from 'react-native-camera';
import moment from "moment";
const { server } = require('../config/keys');
import NetInfo from "@react-native-community/netinfo";
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
        <Text>Cargando</Text>
    </View>
);
export default class modoTablet extends Component {
    comprobar_conexion(){
        NetInfo.isConnected.fetch().done((isConnected) => {
            if (isConnected == true) {
                this.setState({ connection_Status: "Online" });
                console.log("online");
            }
            else {
                this.setState({ connection_Status: "Offline" });
            }
        })
    }
    componentDidMount() {
        this.comprobar_conexion();
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
            mirrorMode: false
        }
    }

    
    Alta_asistencia = async (camera,tipo) => {
        Keyboard.dismiss();
        this.comprobar_conexion();
        const options = { quality: 0.5, base64: true, captureAudio: false };
        const data = await camera.takePictureAsync(options);
        this.setState({ foto: data.base64 });
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
            console.log(estado);
            db.transaction(function (tx) {                    
                        db.transaction(function (txx) {
                            txx.executeSql('INSERT INTO asistencia (empleado_id,foto,fecha,empresa_id,tipo,estado) VALUES (?, ?,?,?,?,?)', [tarea_send.id, foto, fecha, tarea_send.id_empresa,tipo,0], (tx, results) => {
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
                <View style={styles.main}>
                    <RNCamera
                        style={styles.camara}
                        type={RNCamera.Constants.Type.front}
                        captureAudio={false}
                    >
                        {({ camera, status }) => {
                            if (status !== 'READY') return <PendingView />;
                            return (
                                <View style={{ position: 'relative', bottom: 0, left: 0, right: 0 }}>
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
                                        <Text style={{ fontSize: 14, color: 'white' }}> Capturar y aceptar </Text>
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
    camara: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
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
    main: {
        flex: 1,
    }
});