import React, { Component } from 'react';
import { View, Alert, TouchableOpacity, StyleSheet, Text, TouchableHighlight } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
import { RNCamera } from 'react-native-camera';
import PinView from 'react-native-pin-view'
import { Icon } from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import moment from "moment";
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
var idempleado;
import NetInfo from "@react-native-community/netinfo";
import BackgroundTimer from 'react-native-background-timer';
import DeviceInfo from 'react-native-device-info';
import { Button } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
const manejador = require("./manejadorSqlite");


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
            tablet: false,
            cargando: false,
            boton_act: false,
            mensaje_alert: ""
        }
        this.perfil();

    }

    componentDidMount() {
        this.establet();
        myTimer = BackgroundTimer.setInterval(() => {
            NetInfo.isConnected.fetch().done((isConnected) => {
                if (isConnected == true) {
                    this.setState({ connection_Status: "Online" });
                    manejador.subirAsistencias();
                }
                else {
                    this.setState({ connection_Status: "Offline" });
                }
            })
        }, 5000);

    }
    componentWillUnmount() {
        BackgroundTimer.clearInterval(myTimer);
    }
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Modo Tablet',
            headerStyle: {
                backgroundColor: '#00748D',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerRight: (
                <Icon
                    reverse
                    name='account-circle'
                    type='material-community'
                    color='#00748D'
                    onPress={async () => navigation.navigate('perfilEmpresa', { session: await AsyncStorage.getItem('usuario') })} />
            ),
        }
    };

    perfil = async () => {
        var user = await AsyncStorage.getItem('usuario');
        console.log('usuario', user);
    }

    comprobar_ultima_asistencia_offline = async () => {
        let empressa = await AsyncStorage.getItem('usuario');
        let empresa = JSON.parse(empressa);
        console.log(empresa);
        var empresa_id = empresa.id;
        console.log("entra", idempleado);
        console.log("entra", empresa_id);
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                db.transaction(function (tx) {
                    tx.executeSql('SELECT * FROM asistencia WHERE id=(SELECT MAX(id) from asistencia) AND empleado_id = ? AND empresa_id = ? AND tipo = 1', [idempleado, empresa_id], (tx, results) => {
                        console.log("eeee");
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

    comprobar_conexion = async (data) => {
        NetInfo.isConnected.fetch().done(async (isConnected) => {
            if (isConnected == true) {
                this.setState({ connection_Status: "Online" });
                let session = await AsyncStorage.getItem('usuario');
                let sesion = JSON.parse(session);
                let loginDetails = {
                    id_usuario: idempleado,
                    id_empresa: sesion.id
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
                    .then(async data_1 => {
                        const retorno = data_1;
                        console.log(retorno);
                        if (retorno.retorno == true) {
                            this.setState({ empleado_id: retorno.id });
                            await this.setState({ mensaje_alert: retorno.mensaje });
                        } else {
                            Toast.show(retorno.mensaje);
                        }
                        if (data == 1) {
                            this.setState({ boton_act: true });
                            this.setState({ cargando: false });
                            Toast.show('Buen viaje, seleccione aceptar');
                        }
                        else if (data == 2) {
                            this.setState({ boton_act: true });
                            this.setState({ cargando: false });
                            Toast.show('Bienvenido, seleccione aceptar');
                        }
                        else if (data == 3) {
                            this.setState({ boton_act: false });
                            this.setState({ cargando: false });
                            Toast.show('Pin incorrecto');
                        }
                    })
                    .catch(function (err) {
                        console.log('error', err);
                    })

                console.log("online");
            }
            else {
                this.setState({ connection_Status: "Offline" });
                this.comprobar_ultima_asistencia_offline().then((data_2) => {
                    console.log("data", data_2);
                    if (data_2 == 1) {
                        this.setState({ mensaje_alert: "Su última asistencia fue una entrada,¿Usted esta ingresando o saliendo de la empresa?" });
                    }
                    else if (data_2 == 2) {
                        this.setState({ mensaje_alert: "¿Usted esta ingresando o saliendo de la empresa?" });
                    }
                    if (data == 1) {
                        this.setState({ boton_act: true });
                        this.setState({ cargando: false });
                        Toast.show('Buen viaje, seleccione aceptar');
                    }
                    else if (data == 2) {
                        this.setState({ boton_act: true });
                        this.setState({ cargando: false });
                        Toast.show('Bienvenido, seleccione aceptar');
                    }
                    else if (data == 3) {
                        this.setState({ boton_act: false });
                        this.setState({ cargando: false });
                        Toast.show('Pin incorrecto');
                    }
                });

            }
        })
    }


    promesa() {
        var codigo = this.state.codigo;
        var empresa_id = this.state.empresa_id;
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                db.transaction(function (tx) {
                    tx.executeSql('SELECT * FROM usuario', [], (tx, results) => {
                        for (var i = 0; i < results.rows.length; i++) {
                            console.log("pin a ", results.rows.item(i).pin);
                            console.log("pin b ", codigo);
                            if (results.rows.item(i).pin == codigo) {
                                idempleado = results.rows.item(i).id;
                                tx.executeSql('SELECT * FROM asistencia WHERE empleado_id = ? AND empresa_id = ? AND tipo = 0', [results.rows.item(i).id, empresa_id], (tx, results) => {
                                    console.log("numero", results.rows.length);
                                    if (results.rows.length > 0) {
                                        resolve(1);
                                    }
                                    else {
                                        resolve(2);
                                    }
                                });
                                break;
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
        this.setState({ cargando: true });
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        this.setState({ empresa_id: sesion.id });
        this.promesa().then(async (data) => {
            console.log("data", data);
            await this.comprobar_conexion(data);
        });
    }


    Alta_asistencia = async (camera, estado) => {
        this.setState({ cargando: true });
        const options = { quality: 0.5, base64: true, captureAudio: false };
        const data = await camera.takePictureAsync(options);
        this.setState({ foto: data.base64 });
        var fecha = moment(new Date()).format();
        this.setState({ fecha: fecha });
        const { foto } = this.state;
        var empresa_id = this.state.empresa_id;
        if (this.state.connection_Status == "Offline") {
            db.transaction(function (tx) {
                db.transaction(function (txx) {
                    txx.executeSql('INSERT INTO asistencia (empleado_id,foto,fecha,empresa_id,tipo,estado) VALUES (?,?,?,?,?,?)', [idempleado, foto, fecha, empresa_id, estado, 0], (tx, results) => {
                        console.log(results.rowsAffected);
                        if (results.rowsAffected > 0) {
                            console.log("insertó");
                            Alert.alert(
                                "Mensaje",
                                "La asistencia se insertó correctamente",
                            )
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
            this.setState({ cargando: false });
            this.setState({ boton_act: false });
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

                        Alert.alert(
                            "Mensaje",
                            retorno.mensaje,
                        )
                    } else {
                        alert(retorno.mensaje);
                    }
                    this.setState({ cargando: false });
                    this.setState({ boton_act: false });
                })
                .catch(function (err) {
                    console.log('error', err);
                })
        }
    }

    async establet() {
        try {
            await DeviceInfo.isTablet().then(async isTablet => {
                this.setState({ tablet: isTablet });
            });
        } catch (e) {
            console.log("error", e);
        }
    }


    render() {
        console.log(this.state.tablet);
        if (this.state.tablet) {
            return (
                <ScrollView >
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
                                    <View style={{ position: 'absolute', bottom: -100, right: 50, left: 50 }}>
                                        {this.state.cargando ? <Button mode="outlined" color="#00748D"
                                            disabled={true} loading={true}>
                                        </Button>
                                            : this.state.boton_act ? <TouchableHighlight onPress={() => Alert.alert(
                                                "Opciones",
                                                this.state.mensaje_alert,
                                                [
                                                    { text: "Entrando", onPress: () => this.Alta_asistencia(camera, 1) },
                                                    {
                                                        text: "Saliendo",
                                                        onPress: () => this.Alta_asistencia(camera, 0),
                                                    },
                                                ],
                                            )}><Button mode="contained" color="#00748D"
                                                onPress={() => Alert.alert(
                                                    "Opciones",
                                                    this.state.mensaje_alert,
                                                    [
                                                        { text: "Entrando", onPress: () => this.Alta_asistencia(camera, 1) },
                                                        {
                                                            text: "Saliendo",
                                                            onPress: () => this.Alta_asistencia(camera, 0),
                                                        },
                                                    ],
                                                )} disabled={false}>
                                                    Aceptar
                                       </Button></TouchableHighlight> : <Button mode="contained" color="#00748D"
                                                    disabled={true}>
                                                    Aceptar
                                       </Button>
                                        }
                                    </View>
                                );
                            }}
                        </RNCamera>
                    </View>
                </ScrollView>
            )
        }
        else {
            console.log("mensaje: ", this.state.mensaje_alert);
            return (
                <ScrollView>
                    <View style={{ alignContent: 'center', alignItems: 'center' }} >
                        <RNCamera
                            type={RNCamera.Constants.Type.front}
                            captureAudio={false}
                            style={{ top: 100, width: 150 }}
                        >
                            {({ camera, status }) => {
                                if (status !== 'READY') return <PendingView />;
                                return (
                                    <View style={{ position: 'relative', top: 570 }}>
                                        {this.state.cargando ? <Button style={styles.capture} mode="outlined" color="#00748D"
                                            style={{ marginTop: 10, width: 150 }} disabled={true} loading={true}>
                                        </Button>
                                            : this.state.boton_act ? <TouchableHighlight onPress={async () => Alert.alert(
                                                "Opciones",
                                                this.state.mensaje_alert,
                                                [
                                                    { text: "Entrando", onPress: () => this.Alta_asistencia(camera, 1) },
                                                    {
                                                        text: "Saliendo",
                                                        onPress: () => this.Alta_asistencia(camera, 0),
                                                    },
                                                ],
                                            )}><Button style={styles.capture} mode="contained" color="#00748D"
                                                style={{ marginTop: 10, width: 150 }} onPress={async () => Alert.alert(
                                                    "Opciones",
                                                    this.state.mensaje_alert,
                                                    [
                                                        { text: "Entrando", onPress: () => this.Alta_asistencia(camera, 1) },
                                                        {
                                                            text: "Saliendo",
                                                            onPress: () => this.Alta_asistencia(camera, 0),
                                                        },
                                                    ],
                                                )} disabled={false}>
                                                    Aceptar
                                       </Button></TouchableHighlight> : <Button style={styles.capture} mode="contained" color="#00748D"
                                                    style={{ marginTop: 10, width: 150 }} disabled={true}>
                                                    Aceptar
                                       </Button>
                                        }
                                    </View>
                                );
                            }}
                        </RNCamera>
                    </View>
                    <View style={{
                        position: "absolute", left: 20, right: 20, top: 260, bottom: 100
                        , borderWidth: 2,
                        borderRadius: 10,
                        borderColor: '#ddd',
                        shadowColor: '#000',
                    }}>
                        <PinView
                            onComplete={(val, clear) => { this.setState({ codigo: val }), clear(), this.confirmar_usuario() }}
                            pinLength={4}
                            inputBgColor="#0083D0"
                            inputBgOpacity={0.6}

                        />
                    </View>
                </ScrollView>
            )
        }

    }
}




const styles = StyleSheet.create({
    pin: {
        position: 'absolute', top: 100, left: 100, bottom: 100, justifyContent: 'center', alignContent: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#ddd',
        borderBottomWidth: 0,
        shadowColor: '#000',
        elevation: 3,
        marginLeft: 5,
        marginRight: 5
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    camara: {
        width: 400,
        height: 300,
        position: 'absolute', top: 160, right: 100, bottom: 0
    },
    capture: {
        flex: 0,
        backgroundColor: '#1E8AF1',
        borderRadius: 5,
        padding: 15,
        alignSelf: 'center',
        paddingHorizontal: 20,
        margin: 20,
        borderRadius: 30,

    },
});