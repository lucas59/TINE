import React, { Component } from 'react';
import { Icon } from 'react-native-elements';
import { Button, Card } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
export default class Menu_listas extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'TINE',
            headerStyle: {
                backgroundColor: '#008FAD',
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
                    color='#008FAD'
                    onPress={async () => navigation.navigate('perfil', { session: await AsyncStorage.getItem('usuario') })} />
            ),
        }
    };
    constructor(props) {
        
        super(props);
        this.state = {
            tarea: 1,
            asistencias: 1
        }
        this.inicio();
    }
    configuraciones = async () => {
        let session = await AsyncStorage.getItem('empresa');
        let sesion = JSON.parse(session);
        let tarea_send = {
          id_empresa: sesion[0],
        };
        console.log('empresa conectada', tarea_send);
        await fetch(server.api + 'configuraciones_empresa', {
          method: 'POST',
          headers: {
            Aceptar: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tarea_send),
        })
          .then(res => {
            return res.json();
          })
          .then(async data => {
            const retorno = data;
            console.log(retorno.retorno);
            if (retorno.retorno == true) {
              try {
                await AsyncStorage.setItem(
                  'configuraciones',
                  JSON.stringify(retorno.mensaje[0]),
                );
              } catch (e) {
                console.log('error', e);
                // saving error
              }
            } else {
              alert(retorno.mensaje);
            }
            this.setState({cargando: false});
          })
          .catch(function(err) {
            console.log('error', err);
          });
      };

    async inicio() {
        this.configuraciones();
        try {
            const value = await AsyncStorage.getItem('configuraciones');
            if (value !== null) {
                this.setState({ 'tarea': JSON.parse(value).tareas.data[0] });
                this.setState({ 'asistencias': JSON.parse(value).asistencias.data[0] });
            }
        } catch (e) {
            console.log("error", e);
        }
    }





    render() {
        return (
            <View style={styles.container}>
                <Card>
                    <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
                </Card>
                <View style={styles.buttonContainer}>
                    {this.state.tarea ? <Button
                        mode="contained"
                        onPress={() => {
                            this.props.navigation.navigate('lista_tareas');
                        }}
                        color="#008FAD"
                    >
                        Listas de tareas
                        </Button> : null}
                </View>
                <View style={styles.buttonContainer}>
                    {this.state.asistencias ? <Button
                        onPress={() => {
                            this.props.navigation.navigate('lista_asistencias');
                        }}
                        mode="contained"
                        color="#008FAD"
                    >
                        Lista de asistencias
                        </Button> : null}

                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
    },
    buttonContainer: {
        margin: 15
    }
});