import React, { Component } from 'react';
import { StyleSheet, View, Text, Alert, ToastAndroid, ScrollView, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
const { server } = require('../config/keys');
import { ListItem, Icon } from 'react-native-elements';
import ActionButton from 'react-native-action-button';
import moment from "moment";
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
const manejador = require("./manejadorSqlite");
import {
    PulseIndicator
} from 'react-native-indicators';
import BackgroundTimer from 'react-native-background-timer';
export default class lista_tareas extends Component {
    llenar_lista() {
        NetInfo.isConnected.fetch().done((isConnected) => {
            if (isConnected == true) {
                console.log("online");
                this.setState({ connection_Status: "Online" });
                this.Listar();
            }
            else {
                this.setState({ connection_Status: "Offline" });
                this.promesa().then((lista_SC) => {
                    console.log("lista tareas: ", lista_SC)
                    this.setState({ listaT: lista_SC });
                });
            }
        })
    }
    componentDidMount() {
        myTimer = BackgroundTimer.setInterval(() => {
            NetInfo.isConnected.fetch().done((isConnected) => {
                if (isConnected == true) {
                    manejador.subirTareas();
                    console.log("online");
                }
                else {
                    console.log("offline");
                }
            })
        }, 5000);
        this.llenar_lista();


    }


    componentWillUnmount() {
        BackgroundTimer.clearInterval(myTimer);

    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Listas de tareas',
            headerStyle: {
                backgroundColor: '#1E8AF1',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerRight: (
                <Icon
                    reverse
                    name='face'
                    type='material'
                    color='#1E8AF1'
                    onPress={async () => navigation.navigate('perfil', { session: await AsyncStorage.getItem('usuario') })} />
            ),
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            listaT: '',
            usuario: '',
            empresa: '',
            cargando: true
        }
        cont = 0;
        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.llenar_lista();
            }
        );
    }

    Listar = async () => {
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        let session_2 = await AsyncStorage.getItem('empresa');
        let empresa = JSON.parse(session_2);
        console.log(empresa[0]);
        let tarea_send = {
            id: sesion.id,
            id_empresa: empresa[0]
        }
        await fetch(server.api + '/Tareas/ListaTareas', {
            method: 'POST',
            headers: {
                'Aceptar': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tarea_send)
        })
            .then(res => {
                return res.json()
            })
            .then(data => {
                const retorno = data;
                console.log(retorno);
                if (retorno.retorno == true) {
                    this.setState({ listaT: retorno.mensaje });
                }
            })
            .catch(function (err) {
                console.log('error', err);
            })

    }


    promesa = async () => {
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        let session_2 = await AsyncStorage.getItem('empresa');
        let empresa = JSON.parse(session_2);
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                db.transaction(async function (txn) {
                    txn.executeSql("SELECT * FROM tarea WHERE empleado_id = ? AND empresa_id = ?", [sesion.id, empresa[0]], (tx, res) => {
                        resolve(res.rows.raw());
                    });
                });
            }, 1000);
        });
    }

    parseData() {
        Keyboard.dismiss();
        if (this.state.listaT.length > 0) {
            var fecha = null;
            return this.state.listaT.map((data, i) => {
                //fecha pasa de Date a moment
                const moment_inicio = moment(data.inicio);
                const moment_final = moment(data.fin);
                const diff = moment_final.diff(moment_inicio);
                const diffDuration = moment.duration(diff);
                //setear la fecha de la tarea en una variable para luego compararla con la fecha de la tarea actual
                var comp = fecha;
                //fecha es igual a la fecha de la tarea actual
                fecha = moment(data.inicio).format('MMMM Do YYYY');
                if (fecha == moment(new Date()).format('MMMM Do YYYY')) {
                    fecha = "Hoy";
                }
                return (
                    <View key={i}>
                        {comp != fecha ? <Text style={{ marginTop: 5, marginLeft: 10, fontSize: 15 }}>{fecha}</Text> : null}
                        <ListItem
                            leftIcon={{ name: 'assignment' }}
                            title={data.titulo != "" ? data.titulo : "Sin nombre"}
                            rightTitle={diffDuration.hours() + "h " + diffDuration.minutes() + "m " + diffDuration.seconds() + "s"}
                            onPress={() => Alert.alert(
                                "Opciones",
                                "de tarea " + data.titulo,
                                [
                                    { text: "Modificar", onPress: () => this.redireccionar_modificar(data.id, data.inicio, data.fin, data.titulo) },
                                    {
                                        text: "Eliminar",
                                        onPress: () => this.EliminarTarea(data.id),
                                        style: "cancel"
                                    },
                                ],
                                { cancelable: true }
                            )
                            }
                        />
                    </View>
                )
            });
        }
        else {
            console.log("cargando 2", this.state.cargando);
            return (
                <View>
                    {this.state.cargando ? <PulseIndicator color='#1E8AF1' size={60} style={{ marginTop: 30 }} /> : <Text style={{ textAlign: "center" }}> No existen tareas </Text>}
                </View>
            )

        }
    }

    EliminarTarea(id) {
        console.log(id);
        if (this.state.connection_Status == "Offline") {
            db.transaction(function (txx) {
                txx.executeSql('DELETE FROM tarea WHERE id = ?', [id], (tx, results) => {
                    if (results.rowsAffected > 0) {
                        console.log("Eliminó");
                    } else {
                        console.log("error");
                    }
                }
                );
            });
        }
        else {
            console.log(id);
            let tarea_send = {
                id: id
            }
            fetch(server.api + 'EliminarTarea', {
                method: 'POST',
                headers: {
                    'Aceptar': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tarea_send)
            })
                .then(res => {
                    return res.json()
                })
                .then(data => {
                    const retorno = data;
                    console.log(retorno.retorno);
                    if (retorno.retorno == true) {
                        ToastAndroid.show('La tarea se eliminó correctamente', ToastAndroid.LONG);
                    } else {
                        ToastAndroid.show(retorno.mensaje, ToastAndroid.LONG);
                    }
                })
                .catch(function (err) {
                    console.log('error', err);
                    alert("Hubo un problema con la conexión");
                })
        }
        this.llenar_lista();
    }

    redireccionar_modificar = async (id, inicio, fin, titulo) => {
        var myArray = [id, inicio, fin, titulo];
        AsyncStorage.setItem('tarea_mod', JSON.stringify(myArray));
        this.props.navigation.navigate('modificar_tarea');
    }




    render() {
        return (
            <>
                <ScrollView>
                    {this.parseData()}
                </ScrollView>
                <ActionButton
                    buttonColor="#1E8AF1"
                    onPress={() => { this.props.navigation.navigate('altaTarea'); }}
                />
            </>
        )
    }

}
