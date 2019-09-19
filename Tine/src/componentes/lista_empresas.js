import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, Keyboard, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
import NetInfo from "@react-native-community/netinfo";
import { ListItem, Icon } from 'react-native-elements';
const manejador = require("./manejadorSqlite");
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
import {
    PulseIndicator
} from 'react-native-indicators';
export default class lista_empresas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            titulo: '',
            estado: '',
            inicio: '',
            fin: '',
            listaT: '',
            cargando: true
        }
    }

    componentDidMount() {
        NetInfo.isConnected.fetch().done(async (isConnected) => {
            if (isConnected == true) {
                let session = await AsyncStorage.getItem('usuario');
                console.log(session);
                let sesion = JSON.parse(session);
                manejador.listarempresas(sesion.id);
                this.Listar();
                console.log("online");
            }
            else {
                this.promesa().then((lista_SC) => {
                    console.log("lista tareas: ", lista_SC)
                    this.setState({ listaT: lista_SC });
                    this.setState({ cargando: false });
                });
                console.log("offline");
            }
        })
    }

    promesa = async () => {
        return new Promise(function (resolve, reject) {
            console.log("empresa");
            setTimeout(() => {
                db.transaction(async function (txn) {
                    txn.executeSql("SELECT * FROM empresa", [], (tx, res) => {
                        console.log(res);
                        resolve(res.rows.raw());
                    });
                });
            }, 1000);
        });
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Lista de empresas',
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


    redireccionar_perfil() {
        this.props.navigation.navigate('perfil');
    }


    Listar = async () => {
        Keyboard.dismiss();
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        let tarea_send = {
            id: sesion.id
        }
        await fetch(server.api + '/Tareas/ListaEmpresas', {
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
                    console.log(retorno.mensaje);
                    this.setState({ listaT: retorno.mensaje });
                } else {
                    alert(retorno.mensaje);
                }
                this.setState({ cargando: false });
            })
            .catch(function (err) {
                console.log('error', err);
            })
    }

    redireccionar_alta = async (id, nombre) => {
        var myArray = [id, nombre];
        AsyncStorage.setItem('empresa', JSON.stringify(myArray));
        console.log(myArray);
        this.props.navigation.navigate('menu_listas');
    }




    parseData() {
        if (this.state.listaT) {
            return this.state.listaT.map((data, i) => {
                return (
                    <ListItem
                        key={i}
                        leftAvatar={{ source: { uri: data.fotoPerfil } }}
                        title={data.nombre}
                        onPress={() => this.redireccionar_alta(data.id, data.nombre)}
                    />
                )
            })
        }
        else {
            return (
                <View>
                    {this.state.cargando ? <PulseIndicator color='#1E8AF1' size={60} style={{ marginTop: 30 }} /> : <Text style={{ textAlign: "center" }}> No existen empresas </Text>}
                </View>
            )

        }
    }
    render() {
        return (

            <>
                <ScrollView>
                    {this.parseData()}
                </ScrollView>


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
    screen: {
        backgroundColor: '#3D3D3D',
        flex: 1,
        paddingTop: 50,
        alignItems: 'center',
        //padding: 10
    },
});