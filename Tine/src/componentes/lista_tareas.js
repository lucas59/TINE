import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
const { server } = require('../config/keys');
import { ListItem, Icon, Image } from 'react-native-elements';
import ActionButton from 'react-native-action-button';
import moment from "moment";
import { openDatabase } from 'react-native-sqlite-storage';
import Toast from 'react-native-simple-toast';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
const manejador = require("./manejadorSqlite");
import PTRView from 'react-native-pull-to-refresh';
import {
    PulseIndicator
} from 'react-native-indicators';
import BackgroundTimer from 'react-native-background-timer';
export default class lista_tareas extends Component {
    llenar_lista() {
        console.log("fgb");
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
        })
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
            fecha_actual: ''
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

    async parseData() {
        Keyboard.dismiss();
        var tarea_pausa = await AsyncStorage.getItem("tarea");
        console.log("tarea pausa",tarea_pausa);
        if (tarea_pausa == true) {
            const moment_inicio_1 = moment(tarea_pausa.fecha);
            const moment_final_1 = moment(this.state.fecha_actual);
            const diff_1 = moment_final_1.diff(moment_inicio_1);
            const diffDuration_1 = moment.duration(diff_1);
            return (
                <View >
                    <ListItem
                        leftIcon={{ name: 'assignment' }}
                        title={tarea_pausa.titulo != "" ? tarea_pausa.titulo : "Sin nombre"}
                        rightTitle={diffDuration_1.days() + "d " +diffDuration_1.hours() + "h " + diffDuration_1.minutes() + "m " + diffDuration_1.seconds() + "s"}
                    />
                </View>
            )
        }
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
                    <View key={i}>
                        {comp != fecha ? <Text style={{ marginTop: 5, marginLeft: 10, fontSize: 15 }}>{fecha}</Text> : null}
                        <ListItem
                            leftIcon={{ name: 'assignment' }}
                            title={data.titulo != "" ? data.titulo : "Sin nombre"}
                            rightTitle={diffDuration.days() + "d " +diffDuration.hours() + "h " + diffDuration.minutes() + "m " + diffDuration.seconds() + "s"}
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
                <View>
                    {this.state.cargando ? <PulseIndicator color='#00748D' size={60} style={{ marginTop: 30 }} /> : <View style={{
                        top: 15,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 600
                    }}>
                        <Image
                            source={require('../imagenes/reloj-durmiendo.png')}
                            style={{ width: 300, height: 250 }}
                        />
                        <Text style={{ fontSize: 19 }}>La lista de tareas esta vacia</Text>
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
        this.props.navigation.navigate('modificar_tarea');
    }




    render() {
        return (
            <>
                <PTRView onRefresh={() => this.llenar_lista()} delay={900} >
                    <ScrollView>
                        {this.parseData()}
                    </ScrollView>
                </PTRView>
                <ActionButton
                    buttonColor="#00748D"
                    onPress={() => { this.props.navigation.navigate('altaTarea'); }}
                />

            </>
        )
    }

}
