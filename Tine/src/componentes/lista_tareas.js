import React, { Component } from 'react';
import { StyleSheet, View, Text, Alert, ToastAndroid, ScrollView, Keyboard, AsyncStorage } from 'react-native';
import NetInfo from "@react-native-community/netinfo";

const { server } = require('../config/keys');
import { ListItem, Icon, Divider } from 'react-native-elements';
import { FloatingAction } from "react-native-floating-action";
import moment from "moment";
import BackgraundTask from 'react-native-background-task';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
const manejador = require("./manejadorSqlite");

import BackgroundTimer from 'react-native-background-timer';
var timer;

export default class lista_tareas extends Component {

    componentDidMount() {


        myTimer = BackgroundTimer.setInterval(() => {
            NetInfo.isConnected.fetch().done((isConnected) => {
                if (isConnected == true) {
                    this.setState({ connection_Status: "Online" })
                }
                else {
                    this.setState({ connection_Status: "Offline" })
                }
            })
            if (this.state.connection_Status == "Online") {
                manejador.subirTareas();
                //manejador.subirAsistencia();
                //ToastAndroid.show("estado", NetInfo.isConnected.toString(), ToastAndroid.LONG);
            }
        }, 10000);
    }




    static navigationOptions = {
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
                onPress={() => console.log('perfil')} />
        ),

    };

    constructor(props) {
        super(props);
        this.state = {
            listaT: '',
        }
    }


    Listar = async () => {
        /*
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
            */
    }

    promesa() {
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                db.transaction(async function (txn) {
                    txn.executeSql("SELECT * FROM tarea", [], (tx, res) => {
                        resolve(res.rows.raw());
                    });
                });
            }, 1000);
        });
    }

    parseData() {
        Keyboard.dismiss();
        this.promesa().then((lista_SC) => {
            this.setState({listaT: lista_SC});
        });
        if (this.state.listaT.length > 0) {
            var fecha = null;
                return this.state.listaT.map((data,i) => {
                    //fecha pasa de Date a moment
                    const moment_inicio = moment(data.inicio);
                    const moment_final = moment(data.fin);

                    const diff = moment_final.diff(moment_inicio);
                    const diffDuration = moment.duration(diff);


                    //setear la fecha de la tarea en una variable para luego compararla con la fecha de la tarea actual
                    var comp = fecha;

                    //fecha es igual a la fecha de la tarea actual
                    fecha = moment(data.inicio).format('MMMM Do YYYY');
                    return (
                        <View key={i}>
                            {comp != fecha ? <Text style={{ marginTop: 5, marginLeft: 10, fontSize: 15 }}>{moment(data.inicio).format('MMMM Do YYYY')}</Text> : null}
                            <ListItem
                                leftIcon={{ name: 'assignment' }}
                                title={data.titulo}
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
                return (
                    <Text style={{ textAlign: "center" }}>No existen tareas</Text>
                )
            }



    }

    EliminarTarea(id) {
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
                if (retorno.retorno == true) {
                    alert("La tarea se eliminó correctamente");
                } else {
                    alert(retorno.mensaje);
                }
            })
            .catch(function (err) {
                console.log('error', err);
            })

    }
    redireccionar_alta = async (name) => {
        if (name == "bt_tarea") {
            this.props.navigation.navigate('altaTarea');
        }
        else {
            this.props.navigation.navigate('modoTablet');
        }
    }


    redireccionar_modificar = async (id, inicio, fin, titulo) => {
        var myArray = [id, inicio, fin, titulo];
        AsyncStorage.setItem('tarea_mod', JSON.stringify(myArray));
        this.props.navigation.navigate('modificar_tarea');
    }



    render() {

        const actions = [
            {
                text: "Alta tarea",
                icon: require("../imagenes/agregar_tarea.png"),
                name: "bt_tarea",
                position: 1
            },
            {
                text: "Alta asistencia",
                icon: require("../imagenes/agregar_asistencia.png"),
                name: "bt_asistencia",
                position: 2
            }
        ];


        return (
            <>
                <ScrollView>
                    {this.parseData()}
                </ScrollView>
                <FloatingAction
                    style={styles.floatante}
                    actions={actions}
                    onPressItem={name => { this.redireccionar_alta(name) }}
                    showBackground={false}

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