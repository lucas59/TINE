import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
const { server } = require('../config/keys');
import { Card, Surface } from 'react-native-paper';
import { ListItem, Icon, Image, Divider } from 'react-native-elements';
import ActionButton from 'react-native-action-button';
import moment from "moment";
import style_lista_tareas from '../css/styleLista';
import SQLite  from 'react-native-sqlite-storage';
import Toast from 'react-native-simple-toast';
const manejador = require("./manejadorSqlite");
import PTRView from 'react-native-pull-to-refresh';
import {
    PulseIndicator
} from 'react-native-indicators';
import BackgroundTimer from 'react-native-background-timer';
const db = SQLite.openDatabase(
    {
      name: 'sqlliteTesis.db',
      location: 'default',
      createFromLocation: '~www/sqlliteTesis.db',
    },
    () => {},
    error => {
      console.log(error);
    }
  );
export default class lista_tareas extends Component {
    intervalID = 0;
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
                    console.log("lista tareas: ", lista_SC);
                    if (lista_SC) {
                        if (lista_SC.length > 0) {
                            this.setState({ listaT: lista_SC });
                        }
                        else {
                            this.setState({ listaT: null });
                        }
                    }

                    this.setState({ cargando: false });

                });
            }
        });
        this.promesa_tareas_pausa().then((lista_tareas_pausa) => {
            if (lista_tareas_pausa) {
                if (lista_tareas_pausa.length > 0) {
                    this.setState({ lista_tareas_pausa: lista_tareas_pausa });
                }
                else {
                    this.setState({ lista_tareas_pausa: null });
                }
            }
        });
    }

    componentDidMount() {


        myTimer = BackgroundTimer.setInterval(() => {
            NetInfo.isConnected.fetch().done((isConnected) => {
                if (isConnected == true) {
                    manejador.subirTareas();
                    //manejador.subirAsistencias();
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
            cargando: true,
            lista_tareas_pausa: '',
            curTime: new Date()
        }
        cont = 0;
        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.llenar_lista();
                this.intervalID = setInterval(() => {
                    this.setState({
                        curTime: new Date()
                    })
                }, 1000);
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
                else {
                    this.setState({ listaT: null });
                }
                this.setState({ cargando: false });
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
                    txn.executeSql("SELECT * FROM tarea WHERE empleado_id = ? AND empresa_id = ? GROUP BY inicio ORDER BY inicio DESC;", [sesion.id, empresa[0]], (tx, res) => {
                        resolve(res.rows.raw());
                    });
                });
            }, 1000);
        });
    }


    promesa_tareas_pausa = async () => {
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        let session_2 = await AsyncStorage.getItem('empresa');
        let empresa = JSON.parse(session_2);
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                db.transaction(async function (txn) {
                    txn.executeSql("SELECT * FROM tareas_pausa WHERE id_empleado = ? AND id_empresa = ? GROUP BY fecha ORDER BY fecha DESC;", [sesion.id, empresa[0]], (tx, res) => {
                        resolve(res.rows.raw());
                    });
                });
            }, 1000);
        });
    }
    parsedata_2() {
        if (this.state.lista_tareas_pausa) {
            var fecha = null;
            return this.state.lista_tareas_pausa.map((data, i) => {
                const moment_inicio = moment(data.fecha);
                const moment_final = moment(this.state.curTime);
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
                        {comp != fecha ? <Text style={style_lista_tareas.fecha_lista}>{fecha}</Text> : null}
                        {comp != fecha ? <Divider style={style_lista_tareas.divisor_lista} /> : null}
                        <ListItem
                            leftIcon={{ name: 'assignment' }}
                            title={data.titulo != "" ? data.titulo : "Sin nombre"}
                            rightTitle={diffDuration.days() + "d " + diffDuration.hours() + "h " + diffDuration.minutes() + "m " + diffDuration.seconds() + "s"}
                            onPress={() => {
                                const moment_final = moment(new Date());
                                const diff = moment_final.diff(moment_inicio);
                                const diffDuration = moment.duration(diff);
                                clearInterval(this.intervalID), this.props.navigation.navigate('altaTarea', {
                                    tarea_pausa_id: data.id,
                                    tarea_pausa_nombre: data.titulo,
                                    tarea_pausa_longitud: data.longitud,
                                    tarea_pausa_latitud: data.latitud,
                                    tarea_pausa_fecha: data.fecha,
                                    tarea_pausa_milli: diffDuration.asMilliseconds()
                                });
                            }}
                        />
                    </View>
                )
            });
        }
    }
    parseData() {
        if (this.state.listaT) {
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
                    <View key={i} >
                        {comp != fecha ? <Text style={style_lista_tareas.fecha_lista}>{fecha}</Text> : null}
                        {comp != fecha ? <Divider style={style_lista_tareas.divisor_lista} /> : null}
                        <ListItem
                            leftIcon={{ name: 'assignment' }}
                            title={data.titulo != "" ? data.titulo : "Sin nombre"}
                            rightTitle={diffDuration.days() + "d " + diffDuration.hours() + "h " + diffDuration.minutes() + "m " + diffDuration.seconds() + "s"}
                            onPress={() => Alert.alert(
                                "Opciones",
                                "de tarea " + (data.titulo != '' ? data.titulo : "Sin nombre"),
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
                <View>
                    {this.state.cargando ? <PulseIndicator color='#00748D' size={60} style={style_lista_tareas.cargando_icono} /> : <View style={style_lista_tareas.lista_vacia}>
                        <Image
                            source={require('../imagenes/reloj-durmiendo.png')}
                            style={style_lista_tareas.imagen_vacia}
                        />
                        <Text style={style_lista_tareas.texto_vacio}>La lista de tareas está vacia</Text>
                    </View>}
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
                        Toast.show('La tarea se eliminó correctamente');
                    } else {
                        Toast.show(retorno.mensaje);
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
        clearInterval(this.intervalID);
        this.props.navigation.navigate('modificar_tarea');
    }




    render() {
        return (
            <>
                <PTRView onRefresh={() => this.llenar_lista()} delay={900} >
                    <ScrollView contentContainerStyle={style_lista_tareas.scrollview_lista} >
                        {this.state.lista_tareas_pausa ?
                            <View style={style_lista_tareas.lista_tareas_nofinalizadas} >
                                <Surface style={style_lista_tareas.surface_lista}>
                                    <Card style={style_lista_tareas.card_lista}>
                                        <Card.Content>
                                            <Text style={style_lista_tareas.titulo_lista}>Tareas no finalizadas</Text>
                                            {this.parsedata_2()}
                                        </Card.Content>
                                    </Card>
                                </Surface>
                            </View> : null}
                        <View style={style_lista_tareas.lista_finalizadas}>
                            <Surface style={style_lista_tareas.surface_lista}>
                                <Card style={style_lista_tareas.card_lista}>
                                    <Card.Content>
                                        {this.state.listaT ? <Text style={style_lista_tareas.titulo_lista}>Tareas finalizadas</Text> : null}
                                        {this.parseData()}
                                    </Card.Content>
                                </Card>
                            </Surface>
                        </View>
                    </ScrollView>
                </PTRView>
                <ActionButton
                    buttonColor="#00748D"
                    onPress={() => { clearInterval(this.intervalID), this.props.navigation.navigate('altaTarea'); }}
                />

            </>
        )
    }

}