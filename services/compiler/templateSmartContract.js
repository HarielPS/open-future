export const TemplateSM ={};

TemplateSM.getSmartContract = () => {
    const texto = `
    // SPDX-License-Identifier: GPL-3.0
    pragma solidity >=0.7.0 <0.9.0;

    import "https://github.com/hashgraph/hedera-smart-contracts/blob/main/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
    import "https://github.com/hashgraph/hedera-smart-contracts/tree/main/contracts/system-contracts/HederaResponseCodes.sol";
    

    contract openFuture is HederaTokenService{
        /*************** CONSTANTS ***************/
        uint256 public TIEMPO_TOLERANCIA = 5 minutes;
        uint256 public TIEMPO_RECAUDACION = 10 minutes;
        uint256 public TIEMPO_MES = 30 minutes;
        uint256 public TIEMPO_RECOLECCION_GARANTIA = 5 minutes;


        /*************** CONSTRUCTOR VARIABLES ***************/
        address payable public dir_owner;
        address payable public dir_empresa;
        uint256 public monto_meta; //Dinero que pide la emprpesa
        uint256 public porcentaje_comision; //Porcentaje de ganancia
        uint256 public num_mensualidades; //Cuantos meses estara pagando la empresa


        /*************** VARIABLES ***************/
        uint256 public fecha_recaudacion_fin; //Pasada esta fecha ningun usuario podra depositar
        uint256 public fecha_de_corte; //Indica la fecha de corte mas proxima;
        uint256 public monto_ingresado_empresa_garantia; //El dinero que ingresa la empresa para poner como garantia
        uint256 public monto_extra_empresa; //Cualquier monto extra que ingreso la empresa
        uint256 public monto_recaudado; //Dinero recaudado en tiempo de fondeo, por los clientes
        uint256 public monto_ingresado_empresa_mensualidad; //El dinero que ingresa la empresa para pagar a los que le prestaron
        bool    public garantia_completada;
        bool    public meta_alcanzada;
        bool    public aceptar_dinero_recaudado;
        bool    public fondos_distribuidos_empresa;  //El dinero del smartContract ya se le transfirio a la empresa?


        /*************** DATA STRUCTURES ***************/
        struct Contribucion {
            address payable dir_contribuidor;
            uint256 amount;
        }

        Contribucion[] public contribuidores;
        mapping(address => uint256) public MontoContribuidores;

        /*************** MODIFIERS ***************/
        modifier OnlyOwner() {
            require(msg.sender == dir_owner, "Solo el owner puede hacer esta accion");
            _;
        }

        modifier OnlyCompany() {
            require(msg.sender == dir_empresa, "Solo la empresa puede hacer esta accion");
            _;
        }


        /*************** START ***************/
        constructor(
            address payable _dir_owner,
            address payable _dir_empresa,
            uint256 _monto_meta,
            uint256 _porcentaje_comision,
            uint256 _num_mensualidades
        ){
            dir_owner = _dir_owner;
            dir_empresa = _dir_empresa;
            monto_meta = _monto_meta;
            porcentaje_comision = _porcentaje_comision;
            num_mensualidades = _num_mensualidades; 

            fecha_recaudacion_fin = block.timestamp + TIEMPO_RECOLECCION_GARANTIA + TIEMPO_RECAUDACION; //Pasada esta fecha ningun usuario podra depositar
            fecha_de_corte = 0; //Indica la fecha de corte mas proxima;
            monto_ingresado_empresa_garantia = 0; //El dinero que ingresa la empresa para poner como garantia
            monto_extra_empresa = 0; //Cualquier monto extra que ingreso la empresa
            monto_recaudado = 0; //Dinero recaudado en tiempo de fondeo, por los clientes
            monto_ingresado_empresa_mensualidad = 0; //El dinero que ingresa la empresa para pagar a los que le prestaron
            garantia_completada = false;
            meta_alcanzada = false;
            aceptar_dinero_recaudado = false;
            fondos_distribuidos_empresa = false;  //El dinero del smartContract ya se le transfirio a la empresa?
        }


        /*************** BUSSINES LOGIC ***************/
        function DepositarGarantia()  public payable OnlyCompany {
            require(block.timestamp < (fecha_recaudacion_fin - TIEMPO_RECAUDACION), "Fecha: No puedes ingresar garantia");
            require(!garantia_completada,"La garantia ya ha sido completada");
            require(msg.value > 0, "Debes depositar una cantidad mayor a 0");
            monto_ingresado_empresa_garantia += msg.value;
            if(monto_ingresado_empresa_garantia >= monto_meta){
                garantia_completada = true;
                if(monto_ingresado_empresa_garantia > monto_meta){
                    monto_extra_empresa += monto_ingresado_empresa_garantia - monto_meta;
                }
            }
        }

        function Invertir() public payable {
            require(garantia_completada, "Espera a que al empresa ingrese la garantia");
            require(block.timestamp <= fecha_recaudacion_fin, "El tiempo de invertir ha expirado");
            require(!meta_alcanzada, "Ya se ha recolectado la meta establecida, No puedes depositar mas");
            require(msg.value > 0, "El monto ingresado debe ser mayor a 0");
            bool existe = MontoContribuidores[msg.sender] > 0;
            uint256 nuevoMonto = MontoContribuidores[msg.sender] + msg.value;
            uint256 cpy_monto_recaudado = monto_recaudado;

            //Verificar si la nueva contribucion supera la meta
            if(cpy_monto_recaudado + msg.value > monto_meta){
                uint256 exceso = cpy_monto_recaudado + msg.value - monto_meta;
                nuevoMonto = monto_meta - cpy_monto_recaudado;//
                payable(msg.sender).transfer(exceso);//
            } else{
                nuevoMonto = msg.value;
            }
            //Actualizar montos
            MontoContribuidores[msg.sender] += nuevoMonto;
            monto_recaudado += nuevoMonto;

            //Verificar si el contribuidor ya existe en la lista
            if(!existe){
                contribuidores.push(Contribucion(payable(msg.sender), nuevoMonto));
            }
            //Verificamos si se alcanzo la meta
            if(monto_recaudado >= monto_meta){
                meta_alcanzada = true;
            }
        }

        function AceptarDineroRecaudado() public OnlyCompany{
            require(block.timestamp > fecha_recaudacion_fin, "Primero debebes esperar a que acabe el periodo de recaudacion");
            if(block.timestamp > fecha_recaudacion_fin + TIEMPO_TOLERANCIA){
                _Reembolso();
            }else{
                aceptar_dinero_recaudado = true;
            }
        }

        function RetirarFondosEmpresa() public OnlyCompany{ //Dinero del smart contract a la ==> Empresa
            require(!(block.timestamp > (fecha_recaudacion_fin + TIEMPO_TOLERANCIA)), "La fecha de retirar fondos ha expirado, ya no puedes retirar dinero");
            require(garantia_completada, "Primero debes completar el monto de garantia");
            require(!fondos_distribuidos_empresa, "Ya se le ha transferido fondos a la empresa, no se puede realizar esta accion mas de 1 vez");
            if(meta_alcanzada){
                payable(dir_empresa).transfer(monto_recaudado);
                fondos_distribuidos_empresa = true;
                fecha_de_corte = block.timestamp + TIEMPO_MES;
            }else{
                require(aceptar_dinero_recaudado, "Primero tienes que aceptar el monto recolectado");
                payable (dir_empresa).transfer(monto_recaudado);
                fondos_distribuidos_empresa = true;
                fecha_de_corte = block.timestamp + TIEMPO_MES;
            }
            payable(dir_empresa).transfer(monto_extra_empresa);
        }

        function DepositarMensualidad() payable public OnlyCompany{
            uint256 monto_min_mensualidad = (monto_recaudado)/(120);
            require(fondos_distribuidos_empresa, "Primero debes retirar los fondos");
            require(num_mensualidades > 0,"Ya has terminado de pagar tus mensualidades");
            if(block.timestamp > fecha_de_corte + TIEMPO_TOLERANCIA){ //Se paso de la fecha de corte
                _Reembolso();
            }else{
                monto_ingresado_empresa_mensualidad += msg.value;
                if(monto_ingresado_empresa_mensualidad>= monto_min_mensualidad){//El dinero acumulado ya es el minimo para poder hacer el pago de la primera mensualidad
                    _TransferirMensualidad();
                    num_mensualidades--;
                    monto_ingresado_empresa_mensualidad -= monto_min_mensualidad;
                    fecha_de_corte += TIEMPO_MES;
                    if(num_mensualidades == 0){
                        //Regresamos todo el dinero a la empresa y a las personas, porque ya acabo el prestamo
                        _TransferirInversionYGarantia();
                    }
                }
            }
            
        }

        function _TransferirInversionYGarantia() private {
            dir_empresa.transfer(monto_ingresado_empresa_garantia + monto_extra_empresa + monto_ingresado_empresa_mensualidad);
            monto_ingresado_empresa_garantia = 0;
            monto_extra_empresa = 0;
            monto_ingresado_empresa_mensualidad= 0;
            //Regresamos la inversion inicial a cada persona
            for(uint256 i =0; i< contribuidores.length; i++){
                contribuidores[i].dir_contribuidor.transfer(contribuidores[i].amount);
            }
        }

        function _TransferirMensualidad() private  {
            uint256 max_amount_invesment = (monto_recaudado * porcentaje_comision)/100; // %max de ganancia en $
            uint256 amoutToTransfer = 0;
            for(uint256 i =0; i <contribuidores.length; i++){
                amoutToTransfer = (contribuidores[i].amount*max_amount_invesment)/monto_recaudado*12;
                contribuidores[i].dir_contribuidor.transfer(amoutToTransfer);
            }
        }

        function _Reembolso() private {
            uint256 max_amount_invesment = (monto_recaudado * porcentaje_comision)/100; // %max de ganancia en $ || solo si se pagan las mensualidades al usuario
            uint256 monto_descontado_reembolso = 0;
            for(uint256 i=0;i<contribuidores.length;i++){
                monto_descontado_reembolso += (contribuidores[i].amount*max_amount_invesment*num_mensualidades)/monto_recaudado*12 + contribuidores[i].amount;
                contribuidores[i].dir_contribuidor.transfer((contribuidores[i].amount*max_amount_invesment*num_mensualidades)/monto_recaudado*12); //solo si se pagan las mensualidades al usuario
                contribuidores[i].dir_contribuidor.transfer(contribuidores[i].amount);
            }
            //Return the money to the company
            uint256 total_money_company = monto_ingresado_empresa_garantia + monto_extra_empresa+ monto_ingresado_empresa_mensualidad - monto_descontado_reembolso;
            dir_empresa.transfer(total_money_company);
            monto_extra_empresa =0;
            monto_ingresado_empresa_mensualidad =0;
            monto_ingresado_empresa_garantia =0;
            delete contribuidores;
        }

        function Reembolso() public {
            uint256 currentTime = block.timestamp;
            //No se junto la meta y el dinero no se acepto, y ya paso el periodo de tiempo
            if((currentTime > fecha_recaudacion_fin + TIEMPO_TOLERANCIA) && !aceptar_dinero_recaudado && !meta_alcanzada){
                _Reembolso();
            }else if((currentTime > fecha_de_corte + TIEMPO_TOLERANCIA) && (num_mensualidades>0) && fondos_distribuidos_empresa){
                _Reembolso();
            }
        }

        function getBalance() public view returns (uint256){
            return address(this).balance;
        }

        function getGarantia() public view returns (uint256){
            return monto_ingresado_empresa_garantia;
        }

        function getMontoMensualidad() public view returns (uint256){
            return monto_ingresado_empresa_mensualidad;
        }

        function getMontoExtraEmpresa() public view returns (uint256){
            return monto_extra_empresa;
        }

        function getRecaudacion() public view returns (uint256){
            return  monto_recaudado;
        }

        function getMontoInvertidoPorAddress() public view returns (uint256){
            return MontoContribuidores[msg.sender];
        }

        function getNextCuttOffDay() public view returns (uint256){
            return fecha_de_corte;
        }

        function getMontoMinimoMensualidad() public view returns (uint256){
            return monto_recaudado/(120);
        }

    }`;

};