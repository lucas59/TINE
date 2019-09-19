import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView, Keyboard, navigation } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
const { server } = require('../config/keys');
import { ListItem, Icon, Divider } from 'react-native-elements';
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
                this.setState({ connection_Status: "Online" });
                this.Listar();
            }
            else {
                this.setState({ connection_Status: "Offline" });
                this.promesa().then((lista_SC) => {
                    console.log("lista asistencias: ", lista_SC)
                    this.setState({ listaT: lista_SC });
                    this.setState({ cargando: false });
                });
            }
        })
    }
    componentDidMount() {
        myTimer = BackgroundTimer.setInterval(() => {
            NetInfo.isConnected.fetch().done((isConnected) => {
                if (isConnected == true) {
                    manejador.subirAsistencias();
                    console.log("online");
                }
                else {
                    console.log("offline");
                }
            })
        }, 20000);
       this.llenar_lista();

    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Listas de asistencias',
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
        await fetch(server.api + '/Tareas/ListaAsistencias', {
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
        console.log(sesion.id);
        console.log(empresa[0]);
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                db.transaction(async function (txn) {
                    txn.executeSql("SELECT * FROM asistencia WHERE empleado_id = ? AND empresa_id = ?", [sesion.id, empresa[0]], (tx, res) => {
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
                const moment_fecha = moment(data.fecha);
                //setear la fecha de la tarea en una variable para luego compararla con la fecha de la tarea actual
                var comp = fecha;
                //fecha es igual a la fecha de la tarea actual
                fecha = moment(data.fecha).format('MMMM Do YYYY');
                var icono = data.tipo ? 'assignment-returned' : 'assignment-return';
                if (fecha == moment(new Date()).format('MMMM Do YYYY')) {
                    fecha = "Hoy";
                }
                return (
                    <View key={i}>
                        {comp != fecha ? <Text style={{ marginTop: 5, marginLeft: 10, fontSize: 15 }}>{fecha}</Text> : null}
                        <ListItem
                            leftIcon={{ name: icono }}
                            title={data.tipo ? 'Entrada' : 'Salida'}
                            rightTitle={moment_fecha.format('HH:mm') + " Horas"}

                        />
                    </View>
                )
            });
        }
        else {
            return (
                <View>
                    {this.state.cargando ? <PulseIndicator color='#1E8AF1' size={60} style={{ marginTop: 30 }} /> : <Text style={{ textAlign: "center" }}> No existen tareas </Text>}
                </View>
            )

        }
    }

    redireccionar_alta = async (name) => {
        this.props.navigation.navigate('asistencia_app');

    }




    render() {



        return (
            <>
                <ScrollView>
                    {this.parseData()}
                </ScrollView>
                <ActionButton
                    buttonColor="#1E8AF1"
                    onPress={() => { this.props.navigation.navigate('asistencia_app'); }}
                />
            </>
        )
    }

}


const styles = StyleSheet.create({
    container: {
        justifyContent: 'center'
    },
    titulo: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    button: {
        width: 300,
        backgroundColor: '#4f83cc',
        borderRadius: 25,
        marginVertical: 10,
        paddingVertical: 12
    },
    lista: {
        marginTop: 5,
        marginBottom: 5
    },
    flotante: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    }
});
