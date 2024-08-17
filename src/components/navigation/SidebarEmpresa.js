"use client";
import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Ripple } from "primereact/ripple";
import { StyleClass } from "primereact/styleclass";
import "/node_modules/primeflex/primeflex.css";
import Image from "next/image";
import ItemSB from "./ItemSB";

import 'primereact/resources/themes/saga-blue/theme.css'; // Importa el tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Importa los estilos de PrimeReact
import 'primeicons/primeicons.css'; // Importa los iconos de PrimeIcons
import { useTheme } from '@mui/material/styles';
import { Box, color } from "@mui/system";
import { Typography } from "@mui/material";
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';
import { db } from '../../../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { logoutexit } from "@/component/web3/wallet/WalletDisconnect";


export default function SideBar({ visible, handleVisible }) {
  const theme = useTheme();
  const [userInfo, setUserInfo] = useState({
    image: "",
    name: "Master chief",
  });
  const btnRef1 = useRef(null);
  const btnRef2 = useRef(null);
  const btnRef3 = useRef(null);
  const btnRef4 = useRef(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Leer los datos de localStorage
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);

    if (storedUserId) {
      fetchUserInfo(storedUserId);
    }
  }, []);

  const fetchUserInfo = async (userId) => {
    try {
      const userDocRef = doc(db, 'empresa', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const fullName = `${userData.nombre}`;
        setUserInfo(prevState => ({
          ...prevState,
          name: fullName,
          image:userData.img,
        }));
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handlelogout = () => {
    logoutexit();
  };

  return (
    <div className="card flex justify-content-center">
      <Sidebar
        visible={visible}
        onHide={handleVisible}
        content={({ closeIconRef, hide }) => (
          <Box
            className="min-h-screen flex relative lg:static"
            style={{ backgroundColor: theme.palette.background.default }}
          >
            <Box
              id="app-sidebar-2"
              // className="surface-section h-screen block flex-shrink-0 absolute lg:static left-0 top-0 z-1 border-right-1 surface-border select-none"
              sx={{ width: "100%",backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}
            >
              <div className="flex flex-column h-full">
                <div className="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0">
                  <span className="inline-flex align-items-center gap-2">
                    <Image src="/logo2.png" alt="Logo" width={55} height={55} />
                    <span className="font-semibold text-2xl" style={{ color: theme.palette.primary.main }}>
                      Open Future
                    </span>
                  </span>
                  <span>
                    <Button
                      type="button"
                      ref={closeIconRef}
                      onClick={(e) => hide(e)}
                      icon="pi pi-times"
                      rounded
                      outlined
                      className="h-2rem w-2rem"
                      style={{ color: theme.palette.text.primary }}
                    ></Button>
                  </span>
                </div>
                <div className="overflow-y-auto">
                  <ul className="list-none p-3 m-0">
                    <li>
                      <StyleClass
                        nodeRef={btnRef1}
                        selector="@next"
                        enterClassName="hidden"
                        enterActiveClassName="slidedown"
                        leaveToClassName="hidden"
                        leaveActiveClassName="slideup"
                      >
                        <div
                          ref={btnRef1}
                          className="p-ripple p-3 flex align-items-center justify-content-between text-600 cursor-pointer"
                          style={{ color: theme.palette.text.primary }}
                        >
                          <Typography variant="h7" sx={{color:theme.palette.text.primary}}>MIS PROYECTOS</Typography>
                          <i className="pi pi-chevron-down"></i>
                          <Ripple />
                        </div>
                      </StyleClass>
                      <ul className="list-none p-0 m-0 overflow-hidden">
                        <ItemSB icon={"pi-home"} text={"Inicio"} link={"inicio"} />
                        <ItemSB icon={"pi-list"} text={"Mi portafolio"} link={"portafolio"} />
                        <ItemSB icon={"pi-history"} text={"Historial"} link={"historial"} />
                      </ul>
                    </li>
                  </ul>
                  <ul className="list-none p-3 m-0">
                    <li>
                      <StyleClass
                        nodeRef={btnRef4}
                        selector="@next"
                        enterClassName="hidden"
                        enterActiveClassName="slidedown"
                        leaveToClassName="hidden"
                        leaveActiveClassName="slideup"
                      >
                        <div
                          ref={btnRef4}
                          className="p-ripple p-3 flex align-items-center justify-content-between text-600 cursor-pointer"
                          style={{ color: theme.palette.text.primary }}
                        >
                          <Typography variant="h7" sx={{color:theme.palette.text.primary}}>INVERSIONES</Typography>
                          <i className="pi pi-chevron-down"></i>
                          <Ripple />
                        </div>
                      </StyleClass>
                      <ul className="list-none p-0 m-0 overflow-hidden">
                        <ItemSB icon={"pi-folder"} text={"Proyectos"} link={"proyectos"} />
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="mt-auto">
                  <hr className="mx-3 border-top-1 border-none surface-border mb-0" />
                  <a
                    v-ripple
                    className=" flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple"
                    style={{ color: theme.palette.text.primary }}
                    href="/user/empresa/profile"
                  >
                    <Avatar image={userInfo.image} shape="circle" />
                    <span className="font-bold" sx={{color:theme.palette.text.primary}}>{userInfo.name}</span>
                  </a>
                </div>
                <Button className="flex items-center bg-blue-600 hover:bg-blue-800 justify-center text-white py-2 px-4 rounded-t-xl" onClick={handlelogout}>
                  <Box sx={{marginRight:2}}>
                    <LogoutIcon/>
                  </Box>
                  <span>Cerrar sesión</span>
                </Button>
              </div>
            </Box>
          </Box>
        )}
      ></Sidebar>
    </div>
  );
}
