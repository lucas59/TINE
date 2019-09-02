import React from 'react';
import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';

//vistas
require('moment/locale/es');
import Login from './src/componentes/login';
import Signup from './src/componentes/registrarse';
import Signup2 from './src/componentes/registrarse2';
import altaTarea from './src/componentes/Alta_tarea';
import Inicio from './src/componentes/Inicio';
import modoTablet from './src/componentes/modo_tablet'
import lista_empresas from './src/componentes/lista_empresas'
import lista_tareas from './src/componentes/lista_tareas'
import perfil from './src/componentes/perfil';
import modificar_tarea from './src/componentes/modificar_tarea'


const AppStack = createStackNavigator({ Inicio: Inicio });
const Tareas = createStackNavigator({ lista_empresas: lista_empresas, altaTarea: altaTarea, lista_tareas: lista_tareas, perfil: perfil, modificar_tarea: modificar_tarea });
const empresa = createStackNavigator({ modoTablet: modoTablet, perfilEmpresa: perfil });
const AuthStack = createStackNavigator({ Login: Login, Signup: Signup });
const AuthStack2 = createStackNavigator({ Signup2: Signup2 });

export default createAppContainer(createSwitchNavigator(
  {
    Home: AppStack,
    Tareas: Tareas,
    Auth: AuthStack,
    Auth2: AuthStack2,
    empresa: empresa
  }
));


